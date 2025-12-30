/**
 * Socket.IO Handler avec Authentification JWT
 * ============================================
 * Système de messagerie temps réel sécurisé
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import { jwtVerify } from "jose";
import * as db from "./db";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

// Store connected users
const connectedUsers = new Map<number, string[]>();

/**
 * Vérifie le token JWT et retourne les données utilisateur
 */
async function verifyToken(token: string): Promise<{ userId: number; openId: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.openId) {
      return null;
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await db.getUserByOpenId(payload.openId as string);
    if (!user) {
      return null;
    }
    
    return {
      userId: user.id,
      openId: user.openId,
      role: user.role || 'user',
    };
  } catch (error) {
    console.error('[Socket.IO] Token verification failed:', error);
    return null;
  }
}

export function setupSocketIO(io: SocketIOServer) {
  // Middleware d'authentification
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Permettre les connexions non authentifiées pour certaines fonctionnalités publiques
      console.log(`[Socket.IO] Unauthenticated connection: ${socket.id}`);
      return next();
    }
    
    const userData = await verifyToken(token);
    if (userData) {
      socket.userId = userData.userId;
      socket.userRole = userData.role;
      console.log(`[Socket.IO] Authenticated user ${userData.userId} connected: ${socket.id}`);
    } else {
      console.warn(`[Socket.IO] Invalid token for socket: ${socket.id}`);
    }
    
    next();
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Handle user authentication (pour les connexions qui n'ont pas passé le middleware)
    socket.on("authenticate", async (data: { token?: string; userId?: number }) => {
      // Si déjà authentifié via middleware, ignorer
      if (socket.userId) {
        socket.emit("authenticated", { success: true, userId: socket.userId });
        return;
      }
      
      // Authentification via token JWT
      if (data.token) {
        const userData = await verifyToken(data.token);
        if (userData) {
          socket.userId = userData.userId;
          socket.userRole = userData.role;
          
          // Store socket connection for user
          const userSockets = connectedUsers.get(userData.userId) || [];
          userSockets.push(socket.id);
          connectedUsers.set(userData.userId, userSockets);
          
          // Join user's personal room
          socket.join(`user:${userData.userId}`);
          
          console.log(`[Socket.IO] User ${userData.userId} authenticated with socket ${socket.id}`);
          socket.emit("authenticated", { success: true, userId: userData.userId });
          
          // Notify others that user is online
          socket.broadcast.emit("user_online", { userId: userData.userId });
          return;
        }
      }
      
      // Authentification échouée
      console.warn(`[Socket.IO] Authentication failed for socket: ${socket.id}`);
      socket.emit("error", { message: "Authentication failed", code: "AUTH_FAILED" });
    });

    // Handle joining a conversation room
    socket.on("join_conversation", async (data: { conversationId: number }) => {
      const { conversationId } = data;
      
      if (!socket.userId) {
        socket.emit("error", { message: "Authentication required", code: "AUTH_REQUIRED" });
        return;
      }
      
      if (!conversationId) {
        socket.emit("error", { message: "Conversation ID required", code: "INVALID_INPUT" });
        return;
      }

      try {
        const conversation = await db.getConversationById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found", code: "NOT_FOUND" });
          return;
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (conversation.participant1Id !== socket.userId && conversation.participant2Id !== socket.userId) {
          console.warn(`[Socket.IO] Unauthorized access attempt to conversation ${conversationId} by user ${socket.userId}`);
          socket.emit("error", { message: "Unauthorized", code: "UNAUTHORIZED" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`[Socket.IO] User ${socket.userId} joined conversation ${conversationId}`);
        socket.emit("joined_conversation", { conversationId });

        // Mark messages as read when joining
        await db.markConversationAsRead(conversationId, socket.userId);
      } catch (error) {
        console.error("[Socket.IO] Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation", code: "SERVER_ERROR" });
      }
    });

    // Handle leaving a conversation room
    socket.on("leave_conversation", (data: { conversationId: number }) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Socket.IO] Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle sending a message
    socket.on("send_message", async (data: {
      conversationId: number;
      content: string;
      attachments?: string;
      tempId?: string;
    }) => {
      const { conversationId, content, attachments, tempId } = data;

      if (!socket.userId) {
        socket.emit("error", { message: "Authentication required", code: "AUTH_REQUIRED", tempId });
        return;
      }

      if (!conversationId || !content || content.trim().length === 0) {
        socket.emit("error", { message: "Missing required fields", code: "INVALID_INPUT", tempId });
        return;
      }

      // Limite de longueur du message
      if (content.length > 5000) {
        socket.emit("error", { message: "Message too long (max 5000 characters)", code: "MESSAGE_TOO_LONG", tempId });
        return;
      }

      try {
        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await db.getConversationById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found", code: "NOT_FOUND", tempId });
          return;
        }

        if (conversation.participant1Id !== socket.userId && conversation.participant2Id !== socket.userId) {
          socket.emit("error", { message: "Unauthorized", code: "UNAUTHORIZED", tempId });
          return;
        }

        // Save message to database
        const messageId = await db.sendMessage({
          conversationId,
          senderId: socket.userId,
          content: content.trim(),
          attachments,
        });

        if (!messageId) {
          socket.emit("error", { message: "Failed to save message", code: "SAVE_ERROR", tempId });
          return;
        }

        // Get the full message with sender info
        const message = await db.getMessageById(messageId);
        
        if (message) {
          // Broadcast to all users in the conversation
          io.to(`conversation:${conversationId}`).emit("new_message", {
            ...message,
            conversationId,
            tempId,
          });

          // Find the other participant
          const recipientId = conversation.participant1Id === socket.userId 
            ? conversation.participant2Id 
            : conversation.participant1Id;

          // Get sender info for notification
          const sender = await db.getUserById(socket.userId);

          // Send notification to recipient if they're not in the conversation room
          io.to(`user:${recipientId}`).emit("message_notification", {
            conversationId,
            senderId: socket.userId,
            senderName: sender?.name || "Utilisateur",
            senderAvatar: sender?.avatar,
            preview: content.substring(0, 100),
            timestamp: new Date().toISOString(),
          });

          // Create database notification
          await db.createNotification({
            userId: recipientId,
            type: 'message',
            title: `Nouveau message de ${sender?.name || 'Utilisateur'}`,
            content: content.substring(0, 100),
            link: `/messages/${conversationId}`,
          });
        }

        socket.emit("message_sent", { success: true, messageId, tempId });
      } catch (error) {
        console.error("[Socket.IO] Error sending message:", error);
        socket.emit("error", { message: "Failed to send message", code: "SERVER_ERROR", tempId });
      }
    });

    // Handle typing indicator
    socket.on("typing_start", (data: { conversationId: number }) => {
      if (!socket.userId) return;
      
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit("user_typing", { 
        userId: socket.userId, 
        isTyping: true 
      });
    });

    socket.on("typing_stop", (data: { conversationId: number }) => {
      if (!socket.userId) return;
      
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit("user_typing", { 
        userId: socket.userId, 
        isTyping: false 
      });
    });

    // Handle message read status
    socket.on("mark_read", async (data: { conversationId: number }) => {
      if (!socket.userId) return;
      
      const { conversationId } = data;
      
      try {
        await db.markConversationAsRead(conversationId, socket.userId);
        socket.to(`conversation:${conversationId}`).emit("messages_read", { 
          conversationId, 
          readBy: socket.userId,
          readAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[Socket.IO] Error marking as read:", error);
      }
    });

    // Handle order status updates
    socket.on("order_update", async (data: { 
      orderId: number; 
      status: string; 
      recipientId: number;
    }) => {
      if (!socket.userId) return;
      
      const { orderId, status, recipientId } = data;
      
      // Notify the other party about order update
      io.to(`user:${recipientId}`).emit("order_status_changed", {
        orderId,
        status,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle notification read
    socket.on("notification_read", async (data: { notificationId: number }) => {
      if (!socket.userId) return;
      
      const { notificationId } = data;
      try {
        await db.markNotificationAsRead(notificationId);
        socket.emit("notification_marked_read", { notificationId });
      } catch (error) {
        console.error("[Socket.IO] Error marking notification as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      
      if (socket.userId) {
        const userSockets = connectedUsers.get(socket.userId);
        if (userSockets) {
          const index = userSockets.indexOf(socket.id);
          if (index !== -1) {
            userSockets.splice(index, 1);
            if (userSockets.length === 0) {
              connectedUsers.delete(socket.userId);
              // Notify others that user is offline
              socket.broadcast.emit("user_offline", { userId: socket.userId });
            }
          }
        }
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("[Socket.IO] Socket error:", error);
    });
  });

  // Utility function to send notification to a specific user
  io.sendToUser = (userId: number, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Utility function to check if user is online
  io.isUserOnline = (userId: number): boolean => {
    const sockets = connectedUsers.get(userId);
    return sockets !== undefined && sockets.length > 0;
  };

  // Utility function to get online users
  io.getOnlineUsers = (): number[] => {
    return Array.from(connectedUsers.keys());
  };

  // Utility function to broadcast to all users
  io.broadcastToAll = (event: string, data: any) => {
    io.emit(event, data);
  };

  return io;
}

// Extend Socket.IO Server type
declare module "socket.io" {
  interface Server {
    sendToUser: (userId: number, event: string, data: any) => void;
    isUserOnline: (userId: number) => boolean;
    getOnlineUsers: () => number[];
    broadcastToAll: (event: string, data: any) => void;
  }
}
