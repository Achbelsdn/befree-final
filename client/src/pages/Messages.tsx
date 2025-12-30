import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft,
  Search,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";
import { getLoginUrl } from "@/const";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  attachments?: string;
  createdAt: string;
  isRead?: boolean;
  tempId?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function Messages() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onMessageSent,
    onTyping,
    onMessagesRead,
    onUserOnline,
    onUserOffline,
  } = useSocket();

  const utils = trpc.useUtils();

  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = trpc.conversation.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const selectedConversationId = conversationId ? parseInt(conversationId) : null;

  const { data: messages, isLoading: loadingMessages } = trpc.message.getByConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const sendMessageMutation = trpc.message.send.useMutation();
  const markAsReadMutation = trpc.conversation.markAsRead.useMutation();

  // Initialize local messages from server data
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages.map((m: any) => ({ ...m, status: 'read' })));
    }
  }, [messages]);

  // Join/leave conversation room
  useEffect(() => {
    if (selectedConversationId && isConnected) {
      joinConversation(selectedConversationId);
      markAsRead(selectedConversationId);
      
      return () => {
        leaveConversation(selectedConversationId);
      };
    }
  }, [selectedConversationId, isConnected, joinConversation, leaveConversation, markAsRead]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      if (message.conversationId === selectedConversationId) {
        setLocalMessages(prev => {
          // Check if message already exists (by tempId or id)
          const exists = prev.some(m => 
            (message.tempId && m.tempId === message.tempId) || m.id === message.id
          );
          if (exists) {
            // Update existing message
            return prev.map(m => 
              (message.tempId && m.tempId === message.tempId) ? { ...message, status: 'sent' as const } : m
            );
          }
          return [...prev, { ...message, status: 'delivered' as const }];
        });
        
        // Mark as read if it's from the other user
        if (message.senderId !== user?.id) {
          markAsRead(selectedConversationId);
        }
      }
      // Refetch conversations to update last message
      refetchConversations();
    });
    return unsubscribe;
  }, [onNewMessage, selectedConversationId, user?.id, markAsRead, refetchConversations]);

  // Subscribe to message sent confirmation
  useEffect(() => {
    const unsubscribe = onMessageSent((data) => {
      if (data.tempId) {
        setLocalMessages(prev => 
          prev.map(m => m.tempId === data.tempId ? { ...m, id: data.messageId, status: 'sent' as const } : m)
        );
      }
    });
    return unsubscribe;
  }, [onMessageSent]);

  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribe = onTyping((data) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping);
        setTypingUserName(data.userName || null);
      }
    });
    return unsubscribe;
  }, [onTyping, user?.id]);

  // Subscribe to messages read status
  useEffect(() => {
    const unsubscribe = onMessagesRead((data) => {
      if (data.conversationId === selectedConversationId && data.readBy !== user?.id) {
        setLocalMessages(prev => 
          prev.map(m => m.senderId === user?.id ? { ...m, status: 'read' as const } : m)
        );
      }
    });
    return unsubscribe;
  }, [onMessagesRead, selectedConversationId, user?.id]);

  // Subscribe to online status
  useEffect(() => {
    const unsubOnline = onUserOnline((data) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });
    const unsubOffline = onUserOffline((data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, [onUserOnline, onUserOffline]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedConversationId) {
      startTyping(selectedConversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversationId);
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update
    const optimisticMessage: Message = {
      id: 0,
      conversationId: selectedConversationId,
      senderId: user!.id,
      content,
      createdAt: new Date().toISOString(),
      tempId,
      status: 'sending',
    };

    setLocalMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(selectedConversationId);

    // Send via Socket.IO if connected, otherwise use HTTP
    if (isConnected) {
      socketSendMessage(selectedConversationId, content, undefined, tempId);
    } else {
      try {
        await sendMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          content,
        });
        setLocalMessages(prev => 
          prev.map(m => m.tempId === tempId ? { ...m, status: 'sent' as const } : m)
        );
      } catch {
        toast.error("Erreur lors de l'envoi du message");
        setLocalMessages(prev => prev.filter(m => m.tempId !== tempId));
      }
    }

    // Focus input
    inputRef.current?.focus();
  };

  const selectedConversation = conversations?.find((c: any) => c.id === selectedConversationId) as any;
  const otherUser = selectedConversation?.otherUser;
  const isOtherUserOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

  const filteredConversations = conversations?.filter((conv: any) => 
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== user?.id) return null;
    
    switch (message.status) {
      case 'sending':
        return <Circle className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-heading text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour accéder à vos messages.
            </p>
            <a href={getLoginUrl()}>
              <Button className="btn-benin">Se connecter</Button>
            </a>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-6">
        <div className="h-[calc(100vh-200px)] flex rounded-lg border overflow-hidden bg-card">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-semibold text-lg">Messages</h2>
                {isConnected && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                    <Circle className="h-2 w-2 fill-green-600 mr-1" />
                    En ligne
                  </Badge>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map((conv: any) => {
                    const isOnline = onlineUsers.has(conv.otherUser?.id);
                    return (
                      <Link key={conv.id} href={`/messages/${conv.id}`}>
                        <div className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          conv.id === selectedConversationId ? 'bg-muted' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conv.otherUser?.avatar || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {conv.otherUser?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                  {conv.otherUser?.name || "Utilisateur"}
                                </p>
                                {conv.lastMessageAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.lastMessage}
                                </p>
                              )}
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucune conversation
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversationId && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setLocation("/messages")}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Link href={`/profile/${otherUser.id}`}>
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {otherUser.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isOtherUserOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${otherUser.id}`} className="font-medium hover:text-primary">
                        {otherUser.name || "Utilisateur"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {isOtherUserOnline ? (
                          <span className="text-green-600">En ligne</span>
                        ) : (
                          otherUser.isSeller ? "Freelance" : "Client"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : localMessages && localMessages.length > 0 ? (
                    <div className="space-y-4">
                      {localMessages.map((message, index) => {
                        const isOwn = message.senderId === user?.id;
                        const showDate = index === 0 || 
                          new Date(message.createdAt).toDateString() !== 
                          new Date(localMessages[index - 1].createdAt).toDateString();
                        
                        return (
                          <div key={message.id || message.tempId}>
                            {showDate && (
                              <div className="flex items-center justify-center my-4">
                                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                  {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                  })}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-2xl px-4 py-2 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-muted rounded-bl-md'
                                } ${message.status === 'sending' ? 'opacity-70' : ''}`}>
                                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {getMessageStatus(message)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Commencez la conversation
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim()}
                      className="btn-benin flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    Vos messages
                  </h3>
                  <p className="text-muted-foreground">
                    Sélectionnez une conversation pour commencer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
