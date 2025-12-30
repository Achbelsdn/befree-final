import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import * as escrow from "./escrow";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    registerWithEmail: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        userType: z.enum(['client', 'freelance']),
      }))
      .mutation(async ({ input }) => {
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(input.password, 10);
        const userId = await db.createUserWithEmail({
          name: input.name,
          email: input.email,
          passwordHash,
          userType: input.userType,
        });
        return { success: true, userId };
      }),
    
    loginWithEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Authentification sécurisée via base de données uniquement
        // PLUS DE COMPTES HARDCODÉS - Sécurité renforcée
        const user = await db.getUserByEmail(input.email);
        
        if (!user) {
          // Log tentative d'accès avec email inexistant
          console.warn(`[Auth] Login attempt with unknown email: ${input.email}`);
          throw new Error('Email ou mot de passe incorrect');
        }
        
        if (!user.passwordHash) {
          // Utilisateur créé via OAuth, pas de mot de passe
          throw new Error('Ce compte utilise une autre méthode de connexion');
        }
        
        // Vérifier si l'utilisateur est banni
        if (user.isBanned) {
          throw new Error('Votre compte a été suspendu. Contactez le support.');
        }
        
        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        
        if (!isValid) {
          // Log tentative d'accès avec mauvais mot de passe
          console.warn(`[Auth] Failed login attempt for user: ${user.id}`);
          throw new Error('Email ou mot de passe incorrect');
        }
        
        // Créer le token JWT
        const { SignJWT } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production');
        const token = await new SignJWT({ 
          openId: user.openId,
          userId: user.id,
          role: user.role 
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d') // Réduit de 30d à 7d pour plus de sécurité
          .sign(secret);
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        // Mettre à jour la dernière connexion
        await db.updateLastLogin(user.id);
        
        // Log connexion réussie
        console.log(`[Auth] Successful login for user: ${user.id}`);
        
        return { 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            userType: user.userType,
            role: user.role,
            isSeller: user.isSeller,
          } 
        };
      }),
  }),

  // ==================== USER ROUTES ====================
  user: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserById(input.userId);
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        avatar: z.string().optional(),
        skills: z.string().optional(),
        languages: z.string().optional(),
        responseTime: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    
    becomeSeller: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.becomeSeller(ctx.user.id);
        // Create wallet for seller
        await db.getOrCreateWallet(ctx.user.id);
        return { success: true };
      }),
    
    topSellers: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTopSellers(input?.limit || 10);
      }),
  }),

  // ==================== CATEGORY ROUTES ====================
  category: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCategoryBySlug(input.slug);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can create categories');
        }
        await db.createCategory(input);
        return { success: true };
      }),
  }),

  // ==================== SERVICE ROUTES ====================
  service: router({
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        title: z.string(),
        description: z.string(),
        shortDescription: z.string().optional(),
        price: z.string(),
        deliveryTime: z.number(),
        revisions: z.number().optional(),
        coverImage: z.string().optional(),
        images: z.string().optional(),
        features: z.string().optional(),
        requirements: z.string().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.isSeller) {
          throw new Error('You must be a seller to create services');
        }
        const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        const serviceId = await db.createService({
          ...input,
          userId: ctx.user.id,
          slug,
        });
        return { success: true, serviceId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.string().optional(),
        deliveryTime: z.number().optional(),
        revisions: z.number().optional(),
        coverImage: z.string().optional(),
        images: z.string().optional(),
        features: z.string().optional(),
        requirements: z.string().optional(),
        tags: z.string().optional(),
        status: z.enum(['draft', 'active', 'paused']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { serviceId, ...data } = input;
        await db.updateService(serviceId, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ serviceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteService(input.serviceId, ctx.user.id);
        return { success: true };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getServiceById(input.id);
      }),
    
    getByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getServicesByUser(input.userId);
      }),
    
    myServices: protectedProcedure.query(async ({ ctx }) => {
      return db.getServicesByUser(ctx.user.id);
    }),
    
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        deliveryTime: z.number().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getServices(input || {});
      }),
    
    popular: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPopularServices(input?.limit || 8);
      }),
    
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getServicesByCategory(input.categoryId, input.limit || 10);
      }),
  }),

  // ==================== PROJECT ROUTES ====================
  project: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        categoryId: z.number().optional(),
        budgetType: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
        budgetMin: z.string().optional(),
        budgetMax: z.string().optional(),
        deadline: z.string().optional(),
        duration: z.string().optional(),
        experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
        skills: z.string().optional(),
        requirements: z.string().optional(),
        attachments: z.string().optional(),
        visibility: z.enum(['public', 'private']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        const projectId = await db.createProject({
          ...input,
          slug,
          clientId: ctx.user.id,
          status: 'open',
          deadline: input.deadline ? new Date(input.deadline) : undefined,
        });
        return { success: true, projectId };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectWithDetails(input.id, ctx.user?.id);
      }),
    
    listPublic: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        sortBy: z.enum(['newest', 'budget_high', 'budget_low', 'deadline', 'popular']).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listPublicProjects(input || {});
      }),
    
    myProjects: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByClient(ctx.user.id);
    }),
    
    freelancerProjects: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByFreelancer(ctx.user.id);
    }),
    
    openProjects: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getOpenProjects(input?.limit || 20);
      }),
    
    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        budgetType: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
        budgetMin: z.string().optional(),
        budgetMax: z.string().optional(),
        status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).optional(),
        deadline: z.string().optional(),
        duration: z.string().optional(),
        experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
        skills: z.string().optional(),
        requirements: z.string().optional(),
        visibility: z.enum(['public', 'private']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.clientId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        const { projectId, deadline, ...data } = input;
        await db.updateProject(projectId, {
          ...data,
          deadline: deadline ? new Date(deadline) : undefined,
        });
        return { success: true };
      }),
    
    assignFreelancer: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        freelancerId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.clientId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        await db.assignFreelancerToProject(input.projectId, input.freelancerId);
        return { success: true };
      }),
    
    // Applications
    submitApplication: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        coverLetter: z.string(),
        proposedBudget: z.string().optional(),
        proposedDuration: z.string().optional(),
        attachments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.userType !== 'freelance') {
          throw new Error('Seuls les freelances peuvent postuler');
        }
        const applicationId = await db.createProjectApplication({
          ...input,
          freelancerId: ctx.user.id,
        });
        return { success: true, applicationId };
      }),
    
    getApplications: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.clientId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        return db.getProjectApplications(input.projectId);
      }),
    
    myApplications: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserApplications(ctx.user.id);
    }),
    
    updateApplicationStatus: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        status: z.enum(['pending', 'shortlisted', 'accepted', 'rejected']),
        clientNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateApplicationStatus(input.applicationId, input.status, input.clientNote);
        return { success: true };
      }),
    
    // Interactions
    toggleLike: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isLiked = await db.toggleProjectLike(input.projectId, ctx.user.id);
        return { success: true, isLiked };
      }),
    
    toggleSave: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isSaved = await db.toggleProjectSave(input.projectId, ctx.user.id);
        return { success: true, isSaved };
      }),
    
    savedProjects: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSavedProjects(ctx.user.id);
    }),
    
    // Comments
    addComment: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        content: z.string(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = await db.createProjectComment({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true, commentId };
      }),
    
    getComments: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectComments(input.projectId);
      }),
  }),

  // ==================== ORDER ROUTES ====================
  order: router({
    create: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        requirements: z.string().optional(),
        paymentMethod: z.enum(['mtn', 'moov', 'celtiis', 'card', 'wallet']),
        phoneNumber: z.string().optional(),
        paymentReference: z.string().optional(), // Reference from payment provider
      }))
      .mutation(async ({ ctx, input }) => {
        const service = await db.getServiceById(input.serviceId);
        if (!service) {
          throw new Error('Service not found');
        }
        if (service.userId === ctx.user.id) {
          throw new Error('You cannot order your own service');
        }
        
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + service.deliveryTime);
        
        // Create the order
        const orderId = await db.createOrder({
          serviceId: input.serviceId,
          buyerId: ctx.user.id,
          sellerId: service.userId,
          title: service.title,
          price: service.price,
          currency: service.currency,
          requirements: input.requirements,
          deliveryDate,
          paymentMethod: input.paymentMethod,
        });
        
        if (!orderId) {
          throw new Error('Failed to create order');
        }
        
        // Initialize ESCROW - Funds are held until buyer validates delivery
        const escrowResult = await escrow.initializeEscrow({
          orderId,
          buyerId: ctx.user.id,
          sellerId: service.userId,
          amount: parseFloat(service.price),
          currency: service.currency,
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
        });
        
        if (!escrowResult.success) {
          // Rollback order if escrow fails
          await db.updateOrderStatus(orderId, 'cancelled');
          throw new Error(escrowResult.error || 'Escrow initialization failed');
        }
        
        // Create notification for seller
        await db.createNotification({
          userId: service.userId,
          type: 'order',
          title: 'Nouvelle commande',
          content: `Vous avez reçu une nouvelle commande pour "${service.title}". Le paiement est sécurisé en escrow.`,
          link: `/dashboard/orders`,
        });
        
        return { success: true, orderId, escrowId: escrowResult.escrowId };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) return null;
        if (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        return order;
      }),
    
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByBuyer(ctx.user.id);
    }),
    
    sellerOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersBySeller(ctx.user.id);
    }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed']),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        
        const isSeller = order.sellerId === ctx.user.id;
        const isBuyer = order.buyerId === ctx.user.id;
        
        if (!isSeller && !isBuyer) {
          throw new Error('Unauthorized');
        }
        
        // Validate status transitions
        if (isSeller && !['in_progress', 'delivered'].includes(input.status)) {
          throw new Error('Invalid status transition for seller');
        }
        if (isBuyer && !['completed', 'disputed', 'cancelled'].includes(input.status)) {
          throw new Error('Invalid status transition for buyer');
        }
        
        // Update order status
        await db.updateOrderStatus(input.orderId, input.status);
        
        // Handle ESCROW based on status
        if (input.status === 'completed') {
          // RELEASE ESCROW - Buyer validates delivery
          const releaseResult = await escrow.releaseEscrow({
            orderId: input.orderId,
            releasedBy: 'buyer',
          });
          
          if (!releaseResult.success) {
            console.error('[Order] Escrow release failed:', releaseResult.error);
          }
        } else if (input.status === 'disputed') {
          // OPEN DISPUTE
          await escrow.openDispute({
            orderId: input.orderId,
            openedBy: ctx.user.id,
            reason: 'Litige ouvert par ' + (isBuyer ? 'l\'acheteur' : 'le vendeur'),
          });
        } else if (input.status === 'cancelled' && isBuyer) {
          // REFUND if cancelled by buyer before delivery
          if (order.status === 'pending' || order.status === 'in_progress') {
            await escrow.refundEscrow({
              orderId: input.orderId,
              reason: 'Annulation par l\'acheteur',
              refundedBy: 'admin',
            });
          }
        }
        
        // Notify the other party
        const otherPartyId = isBuyer ? order.sellerId : order.buyerId;
        const statusMessages: Record<string, string> = {
          'in_progress': 'Le freelance a commencé à travailler sur votre commande',
          'delivered': 'Votre commande a été livrée ! Vérifiez et validez.',
          'completed': 'La commande a été validée. Paiement libéré.',
          'cancelled': 'La commande a été annulée.',
          'disputed': 'Un litige a été ouvert sur cette commande.',
        };
        
        await db.createNotification({
          userId: otherPartyId,
          type: 'order',
          title: `Commande #${order.id} - Mise à jour`,
          content: statusMessages[input.status] || `Statut mis à jour: ${input.status}`,
          link: `/dashboard/orders`,
        });
        
        return { success: true };
      }),
    
    // Route pour demander un remboursement
    requestRefund: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        
        if (order.buyerId !== ctx.user.id) {
          throw new Error('Only buyer can request refund');
        }
        
        if (!['pending', 'in_progress'].includes(order.status)) {
          throw new Error('Refund not available for this order status');
        }
        
        const result = await escrow.refundEscrow({
          orderId: input.orderId,
          reason: input.reason,
          refundedBy: 'admin',
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Refund failed');
        }
        
        return { success: true };
      }),
  }),

  // ==================== WALLET ROUTES ====================
  wallet: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateWallet(ctx.user.id);
    }),
    
    transactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getTransactionsByUser(ctx.user.id, input?.limit || 50);
      }),
    
    withdraw: protectedProcedure
      .input(z.object({
        amount: z.number(),
        paymentMethod: z.enum(['mtn', 'moov', 'celtiis']),
        phoneNumber: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet) {
          throw new Error('Wallet not found');
        }
        
        const balance = parseFloat(wallet.balance);
        if (balance < input.amount) {
          throw new Error('Solde insuffisant');
        }
        
        // Minimum withdrawal: 1000 FCFA
        if (input.amount < 1000) {
          throw new Error('Le montant minimum de retrait est de 1000 FCFA');
        }
        
        // Create withdrawal transaction
        const transactionId = await db.createTransaction({
          userId: ctx.user.id,
          walletId: wallet.id,
          type: 'withdrawal',
          amount: input.amount.toString(),
          currency: wallet.currency,
          paymentMethod: input.paymentMethod,
          phoneNumber: input.phoneNumber,
          reference: `WD-${nanoid(10)}`,
          description: `Retrait vers ${input.paymentMethod.toUpperCase()} ${input.phoneNumber}`,
          status: 'pending',
        });
        
        // Deduct from balance
        await db.updateWalletBalance(ctx.user.id, input.amount, 'subtract');
        
        return { success: true, transactionId };
      }),
    
    deposit: protectedProcedure
      .input(z.object({
        amount: z.number(),
        paymentMethod: z.enum(['mtn', 'moov', 'celtiis']),
        phoneNumber: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await db.getOrCreateWallet(ctx.user.id);
        if (!wallet) {
          throw new Error('Could not create wallet');
        }
        
        // Create deposit transaction
        const transactionId = await db.createTransaction({
          userId: ctx.user.id,
          walletId: wallet.id,
          type: 'deposit',
          amount: input.amount.toString(),
          currency: wallet.currency,
          paymentMethod: input.paymentMethod,
          phoneNumber: input.phoneNumber,
          reference: `DEP-${nanoid(10)}`,
          description: `Dépôt via ${input.paymentMethod.toUpperCase()} ${input.phoneNumber}`,
          status: 'pending',
        });
        
        return { success: true, transactionId };
      }),
  }),

  // ==================== NOTIFICATION ROUTES ====================
  notification: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input?.limit || 20);
      }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== DASHBOARD ROUTES ====================
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDashboardStats(ctx.user.id, ctx.user.isSeller);
    }),
    
    recentActivity: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getRecentActivity(ctx.user.id, ctx.user.isSeller, input?.limit || 10);
      }),
  }),

  // ==================== REVIEW ROUTES ====================
  review: router({
    create: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        orderId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order || order.buyerId !== ctx.user.id) {
          throw new Error('Invalid order');
        }
        if (order.status !== 'completed') {
          throw new Error('Order must be completed to leave a review');
        }
        
        const reviewId = await db.createReview({
          serviceId: input.serviceId,
          orderId: input.orderId,
          userId: ctx.user.id,
          sellerId: order.sellerId,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true, reviewId };
      }),
    
    byService: publicProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ input }) => {
        return db.getReviewsByService(input.serviceId);
      }),
    
    bySeller: publicProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => {
        return db.getReviewsBySeller(input.sellerId);
      }),
  }),

  // ==================== CONVERSATION ROUTES ====================
  conversation: router({
    getOrCreate: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.getOrCreateConversation(ctx.user.id, input.otherUserId);
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserConversations(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markConversationAsRead(input.conversationId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== MESSAGE ROUTES ====================
  message: router({
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
        attachments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const messageId = await db.sendMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          attachments: input.attachments,
        });
        return { success: true, messageId };
      }),
    
    getByConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return db.getConversationMessages(input.conversationId);
      }),
  }),

  // ==================== FAVORITE ROUTES ====================
  favorite: router({
    add: protectedProcedure
      .input(z.object({ serviceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addFavorite(ctx.user.id, input.serviceId);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ serviceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFavorite(ctx.user.id, input.serviceId);
        return { success: true };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFavorites(ctx.user.id);
    }),
    
    check: protectedProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.isFavorite(ctx.user.id, input.serviceId);
      }),
  }),

  // ==================== ADMIN ROUTES ====================
  admin: router({
    // Get all users (admin/superadmin only)
    listUsers: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        role: z.enum(['user', 'moderator', 'admin', 'superadmin']).optional(),
        userType: z.enum(['client', 'freelance']).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.adminListUsers(input);
      }),
    
    // Get user details (admin/superadmin only)
    getUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.getUserById(input.userId);
      }),
    
    // Update user role (superadmin only)
    updateUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'moderator', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'superadmin') {
          throw new Error('Seul le super administrateur peut modifier les rôles');
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    // Ban/Unban user (admin/superadmin/moderator)
    toggleUserBan: protectedProcedure
      .input(z.object({
        userId: z.number(),
        banned: z.boolean(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        await db.toggleUserBan(input.userId, input.banned, input.reason);
        return { success: true };
      }),
    
    // Get platform statistics (admin/superadmin only)
    platformStats: protectedProcedure.query(async ({ ctx }) => {
      if (!['admin', 'superadmin'].includes(ctx.user.role)) {
        throw new Error('Accès non autorisé');
      }
      return db.getAdminPlatformStats();
    }),
    
    // List all services for moderation
    listServicesForModeration: protectedProcedure
      .input(z.object({
        status: z.enum(['draft', 'active', 'paused', 'deleted']).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.adminListServices(input);
      }),
    
    // Approve/Reject service (moderator/admin/superadmin)
    moderateService: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        action: z.enum(['approve', 'reject', 'pause']),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        await db.moderateService(input.serviceId, input.action, input.reason);
        return { success: true };
      }),
    
    // List all projects for moderation
    listProjectsForModeration: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.adminListProjects(input);
      }),
    
    // List all transactions (admin/superadmin)
    listTransactions: protectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
        type: z.enum(['deposit', 'withdrawal', 'payment', 'earning', 'refund', 'fee']).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.adminListTransactions(input);
      }),
    
    // Process transaction (admin/superadmin)
    processTransaction: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        action: z.enum(['approve', 'reject']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        await db.processTransaction(input.transactionId, input.action, input.notes);
        return { success: true };
      }),
    
    // Get list of moderators (superadmin only)
    listModerators: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'superadmin') {
        throw new Error('Seul le super administrateur peut voir les modérateurs');
      }
      return db.getModeratorsList();
    }),
    
    // ==================== KYC ADMIN ROUTES ====================
    
    // Get KYC documents for review
    getKYCDocuments: protectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        if (input?.status === 'all' || !input?.status) {
          return db.getAllKYCDocuments();
        }
        return db.getKYCDocumentsByStatus(input.status);
      }),
    
    // Get pending KYC count
    getPendingKYCCount: protectedProcedure.query(async ({ ctx }) => {
      if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
        throw new Error('Accès non autorisé');
      }
      const count = await db.getPendingKYCCount();
      return { count };
    }),
    
    // Approve KYC document
    approveKYC: protectedProcedure
      .input(z.object({
        documentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin'].includes(ctx.user.role)) {
          throw new Error('Seuls les administrateurs peuvent approuver les KYC');
        }
        
        const doc = await db.getKYCDocumentById(input.documentId);
        if (!doc) {
          throw new Error('Document non trouvé');
        }
        
        // Update document status
        await db.updateKYCDocument(input.documentId, {
          status: 'approved',
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });
        
        // Update user KYC status
        await db.updateUserKYCStatus(doc.userId, 'verified');
        
        // Create notification
        await db.createNotification({
          userId: doc.userId,
          type: 'kyc',
          title: 'KYC Approuvé',
          content: 'Votre vérification d\'identité a été approuvée. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
          link: '/dashboard/settings',
        });
        
        return { success: true };
      }),
    
    // Reject KYC document
    rejectKYC: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin'].includes(ctx.user.role)) {
          throw new Error('Seuls les administrateurs peuvent rejeter les KYC');
        }
        
        const doc = await db.getKYCDocumentById(input.documentId);
        if (!doc) {
          throw new Error('Document non trouvé');
        }
        
        // Update document status
        await db.updateKYCDocument(input.documentId, {
          status: 'rejected',
          rejectionReason: input.reason,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });
        
        // Update user KYC status
        await db.updateUserKYCStatus(doc.userId, 'rejected');
        
        // Create notification
        await db.createNotification({
          userId: doc.userId,
          type: 'kyc',
          title: 'KYC Rejeté',
          content: `Votre vérification d'identité a été rejetée. Raison: ${input.reason}`,
          link: '/dashboard/settings',
        });
        
        return { success: true };
      }),
    
    // Get admin dashboard stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
        throw new Error('Accès non autorisé');
      }
      return db.getAdminDashboardStats();
    }),
    
    // Get users with filters
    getUsers: protectedProcedure
      .input(z.object({
        role: z.enum(['user', 'moderator', 'admin', 'superadmin']).optional(),
        userType: z.enum(['client', 'freelance']).optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!['admin', 'superadmin', 'moderator'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        return db.adminListUsers(input);
      }),
    
    // Ban user
    banUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin', 'superadmin'].includes(ctx.user.role)) {
          throw new Error('Accès non autorisé');
        }
        await db.toggleUserBan(input.userId, true, input.reason);
        return { success: true };
      }),
  }),

  // ==================== KYC USER ROUTES ====================
  kyc: router({
    // Submit KYC document
    submit: protectedProcedure
      .input(z.object({
        documentType: z.enum(['id_card', 'passport', 'driver_license', 'residence_proof', 'selfie']),
        documentUrl: z.string(),
        documentNumber: z.string().optional(),
        expiryDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create KYC document
        const docId = await db.createKYCDocument({
          userId: ctx.user.id,
          documentType: input.documentType,
          documentUrl: input.documentUrl,
          documentNumber: input.documentNumber,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
          status: 'pending',
        });
        
        // Update user KYC status to pending
        await db.updateUserKYCStatus(ctx.user.id, 'pending');
        
        return { success: true, documentId: docId };
      }),
    
    // Get user's KYC documents
    myDocuments: protectedProcedure.query(async ({ ctx }) => {
      return db.getKYCDocumentsByUser(ctx.user.id);
    }),
    
    // Get user's KYC status
    status: protectedProcedure.query(async ({ ctx }) => {
      const status = await db.getUserKYCStatus(ctx.user.id);
      return { status: status || 'none' };
    }),
  }),

  // ==================== PORTFOLIO ROUTES ====================
  portfolio: router({
    // Create portfolio item
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string(),
        projectUrl: z.string().optional(),
        clientName: z.string().optional(),
        completionDate: z.string().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.isSeller && ctx.user.userType !== 'freelance') {
          throw new Error('Seuls les freelances peuvent créer un portfolio');
        }
        const itemId = await db.createPortfolioItem({
          userId: ctx.user.id,
          ...input,
          completionDate: input.completionDate ? new Date(input.completionDate) : undefined,
        });
        return { success: true, itemId };
      }),
    
    // Get user's portfolio
    myPortfolio: protectedProcedure.query(async ({ ctx }) => {
      return db.getPortfolioByUser(ctx.user.id);
    }),
    
    // Get portfolio by user ID (public)
    byUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPortfolioByUser(input.userId);
      }),
    
    // Update portfolio item
    update: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        projectUrl: z.string().optional(),
        clientName: z.string().optional(),
        tags: z.string().optional(),
        isHighlighted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { itemId, ...data } = input;
        await db.updatePortfolioItem(itemId, ctx.user.id, data);
        return { success: true };
      }),
    
    // Delete portfolio item
    delete: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePortfolioItem(input.itemId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== CERTIFICATION ROUTES ====================
  certification: router({
    // Create certification
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        issuingOrganization: z.string(),
        credentialId: z.string().optional(),
        credentialUrl: z.string().optional(),
        issueDate: z.string(),
        expiryDate: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.isSeller && ctx.user.userType !== 'freelance') {
          throw new Error('Seuls les freelances peuvent ajouter des certifications');
        }
        const certId = await db.createCertification({
          userId: ctx.user.id,
          ...input,
          issueDate: new Date(input.issueDate),
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        return { success: true, certId };
      }),
    
    // Get user's certifications
    myCertifications: protectedProcedure.query(async ({ ctx }) => {
      return db.getCertificationsByUser(ctx.user.id);
    }),
    
    // Get certifications by user ID (public)
    byUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getCertificationsByUser(input.userId);
      }),
    
    // Delete certification
    delete: protectedProcedure
      .input(z.object({ certId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCertification(input.certId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== MUTUAL REVIEW ROUTES ====================
  mutualReview: router({
    // Create mutual review
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        revieweeId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        communicationRating: z.number().min(1).max(5).optional(),
        qualityRating: z.number().min(1).max(5).optional(),
        timelinessRating: z.number().min(1).max(5).optional(),
        professionalismRating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if can review
        const canReview = await db.canReviewOrder(input.orderId, ctx.user.id, input.revieweeId);
        if (!canReview) {
          throw new Error('Vous ne pouvez pas laisser cet avis');
        }
        
        // Determine reviewer type
        const order = await db.getOrderById(input.orderId);
        const reviewerType = order?.buyerId === ctx.user.id ? 'client' : 'freelancer';
        
        const reviewId = await db.createMutualReview({
          orderId: input.orderId,
          reviewerId: ctx.user.id,
          revieweeId: input.revieweeId,
          reviewerType,
          rating: input.rating,
          comment: input.comment,
          communicationRating: input.communicationRating,
          qualityRating: input.qualityRating,
          timelinessRating: input.timelinessRating,
          professionalismRating: input.professionalismRating,
        });
        
        // Update reviewee's rating
        await db.updateUserRating(input.revieweeId);
        
        // Notify reviewee
        await db.createNotification({
          userId: input.revieweeId,
          type: 'review',
          title: 'Nouvel avis reçu',
          content: `Vous avez reçu un avis ${input.rating}/5 étoiles`,
          link: '/profile/' + input.revieweeId,
        });
        
        return { success: true, reviewId };
      }),
    
    // Get reviews for a user
    forUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getReviewsForUser(input.userId);
      }),
    
    // Check if can review an order
    canReview: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        revieweeId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return db.canReviewOrder(input.orderId, ctx.user.id, input.revieweeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
