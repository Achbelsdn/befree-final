import { eq, and, or, desc, asc, like, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { 
  InsertUser, users, 
  categories, InsertCategory, Category,
  services, InsertService, Service,
  orders, InsertOrder, Order,
  reviews, InsertReview, Review,
  conversations, InsertConversation, Conversation,
  messages, InsertMessage, Message,
  favorites, InsertFavorite, Favorite,
  wallets, InsertWallet, Wallet,
  transactions, InsertTransaction, Transaction,
  projects, InsertProject, Project,
  notifications, InsertNotification, Notification,
  kycDocuments, InsertKYCDocument, KYCDocument,
  portfolioItems, InsertPortfolioItem, PortfolioItem,
  certifications, InsertCertification, Certification,
  mutualReviews, InsertMutualReview, MutualReview
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Test the connection
      await _db.execute(sql`SELECT 1`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function becomeSeller(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isSeller: true }).where(eq(users.id, userId));
}

export async function getTopSellers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users)
    .where(eq(users.isSeller, true))
    .orderBy(desc(users.rating), desc(users.completedOrders))
    .limit(limit);
}

// ==================== CATEGORY FUNCTIONS ====================

// Default categories - Will be populated from database in production
// These are seed categories that should be inserted via migration or admin panel
const defaultCategories: Array<{
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  createdAt: Date;
}> = [];

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return defaultCategories;
  const result = await db.select().from(categories).orderBy(asc(categories.name));
  return result;
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}

// ==================== SERVICE FUNCTIONS ====================

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(services).values(data);
  return result[0].insertId;
}

export async function updateService(serviceId: number, userId: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) return;
  await db.update(services)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(services.id, serviceId), eq(services.userId, userId)));
}

export async function deleteService(serviceId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(services)
    .set({ status: "deleted" })
    .where(and(eq(services.id, serviceId), eq(services.userId, userId)));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getServicesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services)
    .where(and(eq(services.userId, userId), sql`${services.status} != 'deleted'`))
    .orderBy(desc(services.createdAt));
}

export async function getServices(options: {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) {
    // Return empty array when database is not available
    console.warn('[Database] getServices: database not available, returning empty array');
    return [];
  }

  let query = db.select().from(services).where(eq(services.status, "active"));

  const conditions = [eq(services.status, "active")];

  if (options.categoryId) {
    conditions.push(eq(services.categoryId, options.categoryId));
  }

  if (options.search) {
    conditions.push(
      or(
        like(services.title, `%${options.search}%`),
        like(services.description, `%${options.search}%`)
      )!
    );
  }

  if (options.minPrice) {
    conditions.push(sql`${services.price} >= ${options.minPrice}`);
  }

  if (options.maxPrice) {
    conditions.push(sql`${services.price} <= ${options.maxPrice}`);
  }

  if (options.deliveryTime) {
    conditions.push(sql`${services.deliveryTime} <= ${options.deliveryTime}`);
  }

  let orderBy;
  switch (options.sortBy) {
    case 'price_asc':
      orderBy = asc(services.price);
      break;
    case 'price_desc':
      orderBy = desc(services.price);
      break;
    case 'rating':
      orderBy = desc(sql`${services.totalStars} / NULLIF(${services.starCount}, 0)`);
      break;
    case 'popular':
      orderBy = desc(services.totalOrders);
      break;
    case 'newest':
    default:
      orderBy = desc(services.createdAt);
  }

  return db.select().from(services)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(options.limit || 20)
    .offset(options.offset || 0);
}

export async function getPopularServices(limit = 8) {
  const db = await getDb();
  if (!db) {
    // Return empty array when database is not available
    console.warn('[Database] getPopularServices: database not available, returning empty array');
    return [];
  }
  const result = await db.select().from(services)
    .where(eq(services.status, "active"))
    .orderBy(desc(services.totalOrders), desc(sql`${services.totalStars} / NULLIF(${services.starCount}, 0)`))
    .limit(limit);
  return result;
}

export async function getServicesByCategory(categoryId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services)
    .where(and(eq(services.categoryId, categoryId), eq(services.status, "active")))
    .orderBy(desc(services.totalOrders))
    .limit(limit);
}

// ==================== ORDER FUNCTIONS ====================

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByBuyer(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.buyerId, buyerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersBySeller(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: Order['status']) {
  const db = await getDb();
  if (!db) return;
  const updateData: Partial<InsertOrder> = { status };
  if (status === 'completed') {
    updateData.completedAt = new Date();
  }
  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }
  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

// ==================== REVIEW FUNCTIONS ====================

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Insert review
  const result = await db.insert(reviews).values(data);
  
  // Update service rating
  await db.update(services)
    .set({
      totalStars: sql`${services.totalStars} + ${data.rating}`,
      starCount: sql`${services.starCount} + 1`
    })
    .where(eq(services.id, data.serviceId));
  
  // Update seller rating
  const sellerReviews = await db.select().from(reviews).where(eq(reviews.sellerId, data.sellerId));
  const totalRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) + data.rating;
  const avgRating = totalRating / (sellerReviews.length + 1);
  
  await db.update(users)
    .set({
      rating: avgRating.toFixed(2),
      totalReviews: sql`${users.totalReviews} + 1`
    })
    .where(eq(users.id, data.sellerId));
  
  return result[0].insertId;
}

export async function getReviewsByService(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(eq(reviews.serviceId, serviceId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewsBySeller(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(eq(reviews.sellerId, sellerId))
    .orderBy(desc(reviews.createdAt));
}

// ==================== CONVERSATION & MESSAGE FUNCTIONS ====================

export async function getOrCreateConversation(participant1Id: number, participant2Id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Check if conversation exists
  const existing = await db.select().from(conversations)
    .where(
      or(
        and(eq(conversations.participant1Id, participant1Id), eq(conversations.participant2Id, participant2Id)),
        and(eq(conversations.participant1Id, participant2Id), eq(conversations.participant2Id, participant1Id))
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new conversation
  const result = await db.insert(conversations).values({
    participant1Id,
    participant2Id
  });
  
  return {
    id: result[0].insertId,
    participant1Id,
    participant2Id,
    lastMessage: null,
    lastMessageAt: null,
    readByParticipant1: true,
    readByParticipant2: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const convs = await db.select().from(conversations)
    .where(
      or(
        eq(conversations.participant1Id, userId),
        eq(conversations.participant2Id, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt));
  
  // Enrich with other user info
  const enriched = await Promise.all(convs.map(async (conv) => {
    const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
    const otherUserResult = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);
    const otherUser = otherUserResult[0] || null;
    
    const isParticipant1 = conv.participant1Id === userId;
    const unreadCount = isParticipant1 
      ? (conv.readByParticipant1 ? 0 : 1)
      : (conv.readByParticipant2 ? 0 : 1);
    
    return {
      ...conv,
      otherUser: otherUser ? {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar,
        isSeller: otherUser.isSeller
      } : null,
      unreadCount
    };
  }));
  
  return enriched;
}

export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(messages).values(data);
  
  // Update conversation
  const conv = await db.select().from(conversations).where(eq(conversations.id, data.conversationId)).limit(1);
  if (conv.length > 0) {
    const isParticipant1 = conv[0].participant1Id === data.senderId;
    await db.update(conversations)
      .set({
        lastMessage: data.content.substring(0, 100),
        lastMessageAt: new Date(),
        readByParticipant1: isParticipant1,
        readByParticipant2: !isParticipant1
      })
      .where(eq(conversations.id, data.conversationId));
  }
  
  return result[0].insertId;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function markConversationAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (conv.length > 0) {
    const isParticipant1 = conv[0].participant1Id === userId;
    await db.update(conversations)
      .set(isParticipant1 ? { readByParticipant1: true } : { readByParticipant2: true })
      .where(eq(conversations.id, conversationId));
  }
}

// ==================== FAVORITES FUNCTIONS ====================

export async function addFavorite(userId: number, serviceId: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(favorites).values({ userId, serviceId });
  }
}

export async function removeFavorite(userId: number, serviceId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId)));
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const favs = await db.select().from(favorites).where(eq(favorites.userId, userId));
  if (favs.length === 0) return [];
  
  const serviceIds = favs.map(f => f.serviceId);
  return db.select().from(services).where(inArray(services.id, serviceIds));
}

export async function isFavorite(userId: number, serviceId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId)))
    .limit(1);
  
  return result.length > 0;
}


// ==================== WALLET FUNCTIONS ====================


export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  await db.insert(wallets).values({ userId });
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result[0];
}

export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWalletBalance(userId: number, amount: number, type: 'add' | 'subtract', pending = false) {
  const db = await getDb();
  if (!db) return;
  
  const field = pending ? wallets.pendingBalance : wallets.balance;
  if (type === 'add') {
    await db.update(wallets).set({
      [pending ? 'pendingBalance' : 'balance']: sql`${field} + ${amount}`
    }).where(eq(wallets.userId, userId));
  } else {
    await db.update(wallets).set({
      [pending ? 'pendingBalance' : 'balance']: sql`${field} - ${amount}`
    }).where(eq(wallets.userId, userId));
  }
}

export async function movePendingToBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(wallets).set({
    pendingBalance: sql`${wallets.pendingBalance} - ${amount}`,
    balance: sql`${wallets.balance} + ${amount}`
  }).where(eq(wallets.userId, userId));
}

// ==================== TRANSACTION FUNCTIONS ====================

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(transactions).values(data);
  return result[0].insertId;
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function updateTransactionStatus(transactionId: number, status: Transaction['status'], externalReference?: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: Partial<InsertTransaction> = { status };
  if (externalReference) {
    updateData.externalReference = externalReference;
  }
  await db.update(transactions).set(updateData).where(eq(transactions.id, transactionId));
}

// ==================== PROJECT FUNCTIONS ====================

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectsByFreelancer(freelancerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects)
    .where(eq(projects.freelancerId, freelancerId))
    .orderBy(desc(projects.createdAt));
}

export async function getOpenProjects(limit = 20) {
  const db = await getDb();
  if (!db) {
    // Return empty array when database is not available
    console.warn('[Database] getOpenProjects: database not available, returning empty array');
    return [];
  }
  const result = await db.select().from(projects)
    .where(eq(projects.status, "open"))
    .orderBy(desc(projects.createdAt))
    .limit(limit);
  return result;
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, projectId));
}

export async function assignFreelancerToProject(projectId: number, freelancerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ 
    freelancerId, 
    status: "in_progress",
    updatedAt: new Date() 
  }).where(eq(projects.id, projectId));
}

// ==================== NOTIFICATION FUNCTIONS ====================

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ==================== DASHBOARD STATS ====================

export async function getUserDashboardStats(userId: number, isSeller: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  const wallet = await getWalletByUserId(userId);
  
  if (isSeller) {
    const activeServices = await db.select({ count: sql<number>`count(*)` }).from(services)
      .where(and(eq(services.userId, userId), eq(services.status, "active")));
    
    const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(eq(orders.sellerId, userId));
    
    const pendingOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(eq(orders.sellerId, userId), eq(orders.status, "pending")));
    
    const inProgressOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(eq(orders.sellerId, userId), eq(orders.status, "in_progress")));
    
    const completedOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed")));
    
    const totalEarnings = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "earning"), eq(transactions.status, "completed")));
    
    return {
      activeServices: activeServices[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      inProgressOrders: inProgressOrders[0]?.count || 0,
      completedOrders: completedOrders[0]?.count || 0,
      totalEarnings: parseFloat(totalEarnings[0]?.sum || "0"),
      balance: parseFloat(wallet?.balance?.toString() || "0"),
      pendingBalance: parseFloat(wallet?.pendingBalance?.toString() || "0")
    };
  } else {
    const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(eq(orders.buyerId, userId));
    
    const activeOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(eq(orders.buyerId, userId), or(eq(orders.status, "pending"), eq(orders.status, "in_progress"))));
    
    const completedOrders = await db.select({ count: sql<number>`count(*)` }).from(orders)
      .where(and(eq(orders.buyerId, userId), eq(orders.status, "completed")));
    
    const totalProjects = await db.select({ count: sql<number>`count(*)` }).from(projects)
      .where(eq(projects.clientId, userId));
    
    const totalSpent = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "payment"), eq(transactions.status, "completed")));
    
    return {
      totalOrders: totalOrders[0]?.count || 0,
      activeOrders: activeOrders[0]?.count || 0,
      completedOrders: completedOrders[0]?.count || 0,
      totalProjects: totalProjects[0]?.count || 0,
      totalSpent: parseFloat(totalSpent[0]?.sum || "0"),
      balance: parseFloat(wallet?.balance?.toString() || "0")
    };
  }
}

export async function getRecentActivity(userId: number, isSeller: boolean, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  // Get recent orders
  const recentOrders = isSeller 
    ? await db.select().from(orders).where(eq(orders.sellerId, userId)).orderBy(desc(orders.updatedAt)).limit(limit)
    : await db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.updatedAt)).limit(limit);
  
  // Get recent transactions
  const recentTransactions = await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
  
  return {
    orders: recentOrders,
    transactions: recentTransactions
  };
}


// ==================== PROJECT INTERACTIONS ====================

import { 
  projectApplications, InsertProjectApplication, ProjectApplication,
  projectLikes, InsertProjectLike, ProjectLike,
  projectComments, InsertProjectComment, ProjectComment,
  projectSaves, InsertProjectSave, ProjectSave,
  commentLikes
} from "../drizzle/schema";

export async function listPublicProjects(options: {
  search?: string;
  categoryId?: number;
  budgetMin?: number;
  budgetMax?: number;
  sortBy?: 'newest' | 'budget_high' | 'budget_low' | 'deadline' | 'popular';
  limit?: number;
  offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) {
    // Return empty array when database is not available
    console.warn('[Database] searchProjects: database not available, returning empty array');
    return [];
  }
  
  let query = db.select().from(projects)
    .where(and(
      eq(projects.status, "open"),
      eq(projects.visibility, "public")
    )) as any;
  
  // Apply sorting
  switch (options.sortBy) {
    case 'budget_high':
      query = query.orderBy(desc(projects.budgetMax));
      break;
    case 'budget_low':
      query = query.orderBy(projects.budgetMin);
      break;
    case 'deadline':
      query = query.orderBy(projects.deadline);
      break;
    case 'popular':
      query = query.orderBy(desc(projects.applicationCount));
      break;
    default:
      query = query.orderBy(desc(projects.createdAt));
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.offset(options.offset);
  }
  
  const results = await query;
  
  // Enrich with client info
  const enriched = await Promise.all(results.map(async (project: any) => {
    const clientResult = await db.select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      city: users.city,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, project.clientId)).limit(1);
    
    return {
      ...project,
      client: clientResult[0] || null
    };
  }));
  
  return enriched;
}

export async function getProjectWithDetails(projectId: number, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (result.length === 0) return undefined;
  
  const project = result[0];
  
  // Get client info
  const clientResult = await db.select({
    id: users.id,
    name: users.name,
    avatar: users.avatar,
    city: users.city,
    createdAt: users.createdAt
  }).from(users).where(eq(users.id, project.clientId)).limit(1);
  
  // Get project count for client
  const projectCountResult = await db.select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.clientId, project.clientId));
  
  // Check if user liked/saved
  let isLiked = false;
  let isSaved = false;
  
  if (userId) {
    const likeResult = await db.select().from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)))
      .limit(1);
    isLiked = likeResult.length > 0;
    
    const saveResult = await db.select().from(projectSaves)
      .where(and(eq(projectSaves.projectId, projectId), eq(projectSaves.userId, userId)))
      .limit(1);
    isSaved = saveResult.length > 0;
  }
  
  // Increment view count
  await db.update(projects).set({
    viewCount: sql`${projects.viewCount} + 1`
  }).where(eq(projects.id, projectId));
  
  return {
    ...project,
    client: clientResult[0] ? {
      ...clientResult[0],
      projectCount: projectCountResult[0]?.count || 0
    } : null,
    isLiked,
    isSaved
  };
}

// Project Applications
export async function createProjectApplication(data: InsertProjectApplication) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(projectApplications).values(data);
  
  // Update application count
  await db.update(projects).set({
    applicationCount: sql`${projects.applicationCount} + 1`
  }).where(eq(projects.id, data.projectId));
  
  return result[0].insertId;
}

export async function getProjectApplications(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const apps = await db.select().from(projectApplications)
    .where(eq(projectApplications.projectId, projectId))
    .orderBy(desc(projectApplications.createdAt));
  
  // Enrich with freelancer info
  const enriched = await Promise.all(apps.map(async (app) => {
    const freelancerResult = await db.select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      bio: users.bio,
      rating: users.rating,
      completedOrders: users.completedOrders
    }).from(users).where(eq(users.id, app.freelancerId)).limit(1);
    
    return {
      ...app,
      freelancer: freelancerResult[0] || null
    };
  }));
  
  return enriched;
}

export async function getUserApplications(freelancerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const apps = await db.select().from(projectApplications)
    .where(eq(projectApplications.freelancerId, freelancerId))
    .orderBy(desc(projectApplications.createdAt));
  
  // Enrich with project info
  const enriched = await Promise.all(apps.map(async (app) => {
    const projectResult = await db.select().from(projects)
      .where(eq(projects.id, app.projectId)).limit(1);
    
    return {
      ...app,
      project: projectResult[0] || null
    };
  }));
  
  return enriched;
}

export async function updateApplicationStatus(applicationId: number, status: ProjectApplication['status'], clientNote?: string) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: Partial<InsertProjectApplication> = { status };
  if (clientNote) updateData.clientNote = clientNote;
  
  await db.update(projectApplications).set(updateData)
    .where(eq(projectApplications.id, applicationId));
}

// Project Likes
export async function toggleProjectLike(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(projectLikes)
    .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
    await db.update(projects).set({
      likeCount: sql`${projects.likeCount} - 1`
    }).where(eq(projects.id, projectId));
    return false;
  } else {
    await db.insert(projectLikes).values({ projectId, userId });
    await db.update(projects).set({
      likeCount: sql`${projects.likeCount} + 1`
    }).where(eq(projects.id, projectId));
    return true;
  }
}

// Project Saves
export async function toggleProjectSave(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(projectSaves)
    .where(and(eq(projectSaves.projectId, projectId), eq(projectSaves.userId, userId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(projectSaves)
      .where(and(eq(projectSaves.projectId, projectId), eq(projectSaves.userId, userId)));
    await db.update(projects).set({
      saveCount: sql`${projects.saveCount} - 1`
    }).where(eq(projects.id, projectId));
    return false;
  } else {
    await db.insert(projectSaves).values({ projectId, userId });
    await db.update(projects).set({
      saveCount: sql`${projects.saveCount} + 1`
    }).where(eq(projects.id, projectId));
    return true;
  }
}

export async function getUserSavedProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const saves = await db.select().from(projectSaves).where(eq(projectSaves.userId, userId));
  if (saves.length === 0) return [];
  
  const projectIds = saves.map(s => s.projectId);
  return db.select().from(projects).where(inArray(projects.id, projectIds));
}

// Project Comments
export async function createProjectComment(data: InsertProjectComment) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(projectComments).values(data);
  
  // Update comment count
  await db.update(projects).set({
    commentCount: sql`${projects.commentCount} + 1`
  }).where(eq(projects.id, data.projectId));
  
  return result[0].insertId;
}

export async function getProjectComments(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const comments = await db.select().from(projectComments)
    .where(eq(projectComments.projectId, projectId))
    .orderBy(desc(projectComments.createdAt));
  
  // Enrich with user info
  const enriched = await Promise.all(comments.map(async (comment) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      avatar: users.avatar
    }).from(users).where(eq(users.id, comment.userId)).limit(1);
    
    return {
      ...comment,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

// Email Auth Functions
export async function createUserWithEmail(data: {
  name: string;
  email: string;
  passwordHash: string;
  userType: 'client' | 'freelance';
}) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Un compte avec cet email existe déjà');
  }
  
  const openId = `email_${nanoid(16)}`;
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    loginMethod: 'email',
    userType: data.userType,
    isSeller: data.userType === 'freelance',
    emailVerified: false,
    verificationToken: nanoid(32)
  });
  
  return result[0].insertId;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot get user by email: database not available');
    return undefined;
  }
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Mettre à jour la dernière connexion
export async function updateLastLogin(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function verifyUserEmail(token: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.update(users)
    .set({ emailVerified: true, verificationToken: null })
    .where(eq(users.verificationToken, token));
  
  return true;
}


// ==================== PLATFORM STATS ====================

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) {
    return {
      freelancers: 0,
      completedProjects: 0,
      satisfactionRate: 0,
      avgResponseTime: 0,
    };
  }

  try {
    // Count freelancers
    const freelancerCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.isSeller, true));
    
    // Count completed orders
    const completedCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.status, 'completed'));
    
    // Calculate average rating (satisfaction rate)
    const avgRating = await db.select({ 
      avg: sql<number>`COALESCE(AVG(rating), 0)` 
    }).from(reviews);
    
    // For now, use a default response time (could be calculated from messages later)
    const avgResponseTime = 24; // hours

    return {
      freelancers: Number(freelancerCount[0]?.count || 0),
      completedProjects: Number(completedCount[0]?.count || 0),
      satisfactionRate: Math.round((Number(avgRating[0]?.avg || 0) / 5) * 100),
      avgResponseTime,
    };
  } catch (error) {
    console.error("[Database] Failed to get platform stats:", error);
    return {
      freelancers: 0,
      completedProjects: 0,
      satisfactionRate: 0,
      avgResponseTime: 0,
    };
  }
}


// ==================== ESCROW FUNCTIONS ====================

export async function updateOrderPaymentStatus(orderId: number, status: 'pending' | 'paid' | 'refunded' | 'released') {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ paymentStatus: status }).where(eq(orders.id, orderId));
}

export async function releasePendingBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(wallets).set({
    pendingBalance: sql`${wallets.pendingBalance} - ${amount}`,
    balance: sql`${wallets.balance} + ${amount}`
  }).where(eq(wallets.userId, userId));
}

export async function updateTransactionStatusByOrder(orderId: number, userId: number, status: 'pending' | 'completed' | 'failed' | 'cancelled') {
  const db = await getDb();
  if (!db) return;
  
  await db.update(transactions)
    .set({ status })
    .where(
      and(
        eq(transactions.orderId, orderId),
        eq(transactions.userId, userId),
        eq(transactions.type, 'earning')
      )
    );
}

export async function getDeliveredOrdersForAutoRelease(daysAfterDelivery: number) {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAfterDelivery);
  
  return db.select().from(orders)
    .where(
      and(
        eq(orders.status, 'delivered'),
        eq(orders.paymentStatus, 'paid'),
        sql`${orders.updatedAt} < ${cutoffDate}`
      )
    );
}

// ==================== PUBLIC PROJECTS VISIBILITY ====================

export async function getPublicProjectsGlobal(options: {
  search?: string;
  categoryId?: number;
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) return { projects: [], total: 0 };
  
  const { search, categoryId, budgetMin, budgetMax, experienceLevel, sortBy, limit = 20, offset = 0 } = options;
  
  // Build conditions for public visibility
  const conditions = [
    eq(projects.visibility, 'public'),
    eq(projects.status, 'open'),
  ];
  
  if (categoryId) {
    conditions.push(eq(projects.categoryId, categoryId));
  }
  
  if (budgetMin) {
    conditions.push(sql`${projects.budgetMin} >= ${budgetMin}`);
  }
  
  if (budgetMax) {
    conditions.push(sql`${projects.budgetMax} <= ${budgetMax}`);
  }
  
  if (experienceLevel) {
    conditions.push(eq(projects.experienceLevel, experienceLevel as any));
  }
  
  // Search in title and description
  if (search) {
    conditions.push(
      sql`(${projects.title} LIKE ${`%${search}%`} OR ${projects.description} LIKE ${`%${search}%`})`
    );
  }
  
  // Get total count
  const countResult = await db.select({ count: sql<number>`COUNT(*)` })
    .from(projects)
    .where(and(...conditions));
  
  const total = Number(countResult[0]?.count || 0);
  
  // Build order clause
  let orderClause;
  switch (sortBy) {
    case 'budget_high':
      orderClause = desc(projects.budgetMax);
      break;
    case 'budget_low':
      orderClause = asc(projects.budgetMin);
      break;
    case 'deadline':
      orderClause = asc(projects.deadline);
      break;
    case 'popular':
      orderClause = desc(projects.applicationCount);
      break;
    case 'newest':
    default:
      orderClause = desc(projects.createdAt);
  }
  
  // Get projects with client info
  const projectList = await db.select({
    project: projects,
    client: {
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      country: users.country,
    },
    category: {
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    }
  })
    .from(projects)
    .leftJoin(users, eq(projects.clientId, users.id))
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);
  
  return {
    projects: projectList.map(p => ({
      ...p.project,
      client: p.client,
      category: p.category,
    })),
    total,
  };
}

export async function incrementProjectView(projectId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(projects)
    .set({ viewCount: sql`${projects.viewCount} + 1` })
    .where(eq(projects.id, projectId));
}


// ==================== ADMIN FUNCTIONS ====================

export async function adminListUsers(params?: {
  search?: string;
  role?: 'user' | 'moderator' | 'admin' | 'superadmin';
  userType?: 'client' | 'freelance';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(users);
  const conditions = [];
  
  if (params?.search) {
    conditions.push(
      or(
        like(users.name, `%${params.search}%`),
        like(users.email, `%${params.search}%`)
      )
    );
  }
  if (params?.role) {
    conditions.push(eq(users.role, params.role));
  }
  if (params?.userType) {
    conditions.push(eq(users.userType, params.userType));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query
    .orderBy(desc(users.createdAt))
    .limit(params?.limit || 50)
    .offset(params?.offset || 0);
}

export async function updateUserRole(userId: number, role: 'user' | 'moderator' | 'admin' | 'superadmin') {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function toggleUserBan(userId: number, banned: boolean, reason?: string) {
  const db = await getDb();
  if (!db) return;
  
  if (banned) {
    await db.update(users).set({ 
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason || null,
    }).where(eq(users.id, userId));
  } else {
    await db.update(users).set({ 
      isBanned: false,
      bannedAt: null,
      banReason: null,
    }).where(eq(users.id, userId));
  }
}

export async function getAdminPlatformStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [
    totalUsers,
    totalFreelancers,
    totalClients,
    totalServices,
    totalProjects,
    totalOrders,
    totalTransactions
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.userType, 'freelance')),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.userType, 'client')),
    db.select({ count: sql<number>`count(*)` }).from(services).where(eq(services.status, 'active')),
    db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, 'open')),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(transactions),
  ]);
  
  return {
    totalUsers: totalUsers[0]?.count || 0,
    totalFreelancers: totalFreelancers[0]?.count || 0,
    totalClients: totalClients[0]?.count || 0,
    totalServices: totalServices[0]?.count || 0,
    totalProjects: totalProjects[0]?.count || 0,
    totalOrders: totalOrders[0]?.count || 0,
    totalTransactions: totalTransactions[0]?.count || 0,
  };
}

export async function adminListServices(params?: {
  status?: 'draft' | 'active' | 'paused' | 'deleted';
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(services);
  
  if (params?.status) {
    query = query.where(eq(services.status, params.status)) as any;
  }
  
  const result = await query.orderBy(desc(services.createdAt)).limit(params?.limit || 50);
  
  // Enrich with user info
  const enriched = await Promise.all(result.map(async (service) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar
    }).from(users).where(eq(users.id, service.userId)).limit(1);
    
    return {
      ...service,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

export async function moderateService(serviceId: number, action: 'approve' | 'reject' | 'pause', reason?: string) {
  const db = await getDb();
  if (!db) return;
  
  let newStatus: 'active' | 'paused' | 'deleted';
  switch (action) {
    case 'approve':
      newStatus = 'active';
      break;
    case 'reject':
      newStatus = 'deleted';
      break;
    case 'pause':
      newStatus = 'paused';
      break;
  }
  
  await db.update(services).set({ status: newStatus }).where(eq(services.id, serviceId));
}

export async function adminListProjects(params?: {
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(projects);
  
  if (params?.status) {
    query = query.where(eq(projects.status, params.status as any)) as any;
  }
  
  const result = await query.orderBy(desc(projects.createdAt)).limit(params?.limit || 50);
  
  // Enrich with client info
  const enriched = await Promise.all(result.map(async (project) => {
    const clientResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar
    }).from(users).where(eq(users.id, project.clientId)).limit(1);
    
    return {
      ...project,
      client: clientResult[0] || null
    };
  }));
  
  return enriched;
}

export async function adminListTransactions(params?: {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  type?: 'deposit' | 'withdrawal' | 'payment' | 'earning' | 'refund' | 'fee';
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(transactions);
  const conditions = [];
  
  if (params?.status) {
    conditions.push(eq(transactions.status, params.status));
  }
  if (params?.type) {
    conditions.push(eq(transactions.type, params.type));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const result = await query.orderBy(desc(transactions.createdAt)).limit(params?.limit || 100);
  
  // Enrich with user info
  const enriched = await Promise.all(result.map(async (tx) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    }).from(users).where(eq(users.id, tx.userId)).limit(1);
    
    return {
      ...tx,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

export async function processTransaction(transactionId: number, action: 'approve' | 'reject', notes?: string) {
  const db = await getDb();
  if (!db) return;
  
  const tx = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
  if (tx.length === 0) return;
  
  const transaction = tx[0];
  
  if (action === 'approve') {
    await db.update(transactions).set({ status: 'completed' }).where(eq(transactions.id, transactionId));
    
    // If it's a deposit, add to wallet balance
    if (transaction.type === 'deposit') {
      await updateWalletBalance(transaction.userId, parseFloat(transaction.amount), 'add');
    }
  } else {
    await db.update(transactions).set({ status: 'failed' }).where(eq(transactions.id, transactionId));
    
    // If it's a withdrawal that was rejected, refund the balance
    if (transaction.type === 'withdrawal') {
      await updateWalletBalance(transaction.userId, parseFloat(transaction.amount), 'add');
    }
  }
}

export async function getModeratorsList() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).where(
    or(
      eq(users.role, 'moderator'),
      eq(users.role, 'admin'),
      eq(users.role, 'superadmin')
    )
  ).orderBy(desc(users.createdAt));
}


// ==================== SOCKET.IO HELPER FUNCTIONS ====================

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMessageById(messageId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (result.length === 0) return undefined;
  
  const message = result[0];
  
  // Get sender info
  const senderResult = await db.select({
    id: users.id,
    name: users.name,
    avatar: users.avatar
  }).from(users).where(eq(users.id, message.senderId)).limit(1);
  
  return {
    ...message,
    sender: senderResult[0] || null
  };
}

// ==================== KYC FUNCTIONS ====================

export async function createKYCDocument(data: InsertKYCDocument) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(kycDocuments).values(data);
  return result[0].insertId;
}

export async function getKYCDocumentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kycDocuments)
    .where(eq(kycDocuments.userId, userId))
    .orderBy(desc(kycDocuments.createdAt));
}

export async function updateKYCDocument(documentId: number, data: Partial<InsertKYCDocument>) {
  const db = await getDb();
  if (!db) return;
  await db.update(kycDocuments).set(data).where(eq(kycDocuments.id, documentId));
}

export async function getKYCDocumentById(documentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(kycDocuments).where(eq(kycDocuments.id, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingKYCDocuments() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(kycDocuments)
    .where(eq(kycDocuments.status, "pending"))
    .orderBy(asc(kycDocuments.createdAt));
  
  // Enrich with user info
  const enriched = await Promise.all(result.map(async (doc) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      phone: users.phone,
      city: users.city,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, doc.userId)).limit(1);
    
    return {
      ...doc,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

export async function updateUserKYCStatus(userId: number, status: 'pending' | 'verified' | 'rejected') {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ kycStatus: status }).where(eq(users.id, userId));
}

export async function getUserKYCStatus(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ kycStatus: users.kycStatus }).from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0].kycStatus : undefined;
}

// ==================== PORTFOLIO FUNCTIONS ====================

export async function createPortfolioItem(data: InsertPortfolioItem) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(portfolioItems).values(data);
  return result[0].insertId;
}

export async function getPortfolioByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems)
    .where(eq(portfolioItems.userId, userId))
    .orderBy(desc(portfolioItems.createdAt));
}

export async function updatePortfolioItem(itemId: number, userId: number, data: Partial<InsertPortfolioItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(portfolioItems)
    .set(data)
    .where(and(eq(portfolioItems.id, itemId), eq(portfolioItems.userId, userId)));
}

export async function deletePortfolioItem(itemId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(portfolioItems)
    .where(and(eq(portfolioItems.id, itemId), eq(portfolioItems.userId, userId)));
}

// ==================== CERTIFICATION FUNCTIONS ====================

export async function createCertification(data: InsertCertification) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(certifications).values(data);
  return result[0].insertId;
}

export async function getCertificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications)
    .where(eq(certifications.userId, userId))
    .orderBy(desc(certifications.issueDate));
}

export async function updateCertification(certId: number, userId: number, data: Partial<InsertCertification>) {
  const db = await getDb();
  if (!db) return;
  await db.update(certifications)
    .set(data)
    .where(and(eq(certifications.id, certId), eq(certifications.userId, userId)));
}

export async function deleteCertification(certId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(certifications)
    .where(and(eq(certifications.id, certId), eq(certifications.userId, userId)));
}

// ==================== MUTUAL REVIEW FUNCTIONS ====================

export async function createMutualReview(data: InsertMutualReview) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(mutualReviews).values(data);
  return result[0].insertId;
}

export async function getReviewsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(mutualReviews)
    .where(eq(mutualReviews.revieweeId, userId))
    .orderBy(desc(mutualReviews.createdAt));
  
  // Enrich with reviewer info
  const enriched = await Promise.all(result.map(async (review) => {
    const reviewerResult = await db.select({
      id: users.id,
      name: users.name,
      avatar: users.avatar
    }).from(users).where(eq(users.id, review.reviewerId)).limit(1);
    
    return {
      ...review,
      reviewer: reviewerResult[0] || null
    };
  }));
  
  return enriched;
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mutualReviews)
    .where(eq(mutualReviews.reviewerId, userId))
    .orderBy(desc(mutualReviews.createdAt));
}

export async function canReviewOrder(orderId: number, reviewerId: number, revieweeId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Check if order exists and is completed
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (orderResult.length === 0 || orderResult[0].status !== 'completed') {
    return false;
  }
  
  // Check if reviewer is part of the order
  const order = orderResult[0];
  if (order.buyerId !== reviewerId && order.sellerId !== reviewerId) {
    return false;
  }
  
  // Check if review already exists
  const existingReview = await db.select().from(mutualReviews)
    .where(and(
      eq(mutualReviews.orderId, orderId),
      eq(mutualReviews.reviewerId, reviewerId),
      eq(mutualReviews.revieweeId, revieweeId)
    ))
    .limit(1);
  
  return existingReview.length === 0;
}

export async function updateUserRating(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Calculate average rating from mutual reviews
  const result = await db.select({
    avgRating: sql<string>`AVG(rating)`,
    totalReviews: sql<number>`COUNT(*)`
  }).from(mutualReviews).where(eq(mutualReviews.revieweeId, userId));
  
  if (result.length > 0 && result[0].avgRating) {
    await db.update(users).set({
      rating: result[0].avgRating,
      totalReviews: result[0].totalReviews
    }).where(eq(users.id, userId));
  }
}


// ==================== ADDITIONAL KYC FUNCTIONS ====================

export async function getAllKYCDocuments() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(kycDocuments)
    .orderBy(desc(kycDocuments.createdAt));
  
  // Enrich with user info
  const enriched = await Promise.all(result.map(async (doc) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      phone: users.phone,
      city: users.city,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, doc.userId)).limit(1);
    
    return {
      ...doc,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

export async function getKYCDocumentsByStatus(status: 'pending' | 'approved' | 'rejected') {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(kycDocuments)
    .where(eq(kycDocuments.status, status))
    .orderBy(desc(kycDocuments.createdAt));
  
  // Enrich with user info
  const enriched = await Promise.all(result.map(async (doc) => {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      phone: users.phone,
      city: users.city,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, doc.userId)).limit(1);
    
    return {
      ...doc,
      user: userResult[0] || null
    };
  }));
  
  return enriched;
}

export async function getPendingKYCCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(kycDocuments)
    .where(eq(kycDocuments.status, 'pending'));
  
  return result[0]?.count || 0;
}

// ==================== ADMIN DASHBOARD STATS ====================

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  // Total users
  const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = totalUsersResult[0]?.count || 0;
  
  // Total freelancers
  const totalFreelancersResult = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.isSeller, true));
  const totalFreelancers = totalFreelancersResult[0]?.count || 0;
  
  // Active projects
  const activeProjectsResult = await db.select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.status, 'open'));
  const activeProjects = activeProjectsResult[0]?.count || 0;
  
  // Total revenue (sum of completed transactions)
  const revenueResult = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.status, 'completed'),
      eq(transactions.type, 'payment')
    ));
  const totalRevenue = parseFloat(revenueResult[0]?.sum || '0');
  
  // Pending disputes
  const disputesResult = await db.select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'disputed'));
  const pendingDisputes = disputesResult[0]?.count || 0;
  
  // Pending KYC
  const pendingKYCResult = await db.select({ count: sql<number>`count(*)` })
    .from(kycDocuments)
    .where(eq(kycDocuments.status, 'pending'));
  const pendingKYC = pendingKYCResult[0]?.count || 0;
  
  return {
    totalUsers,
    totalFreelancers,
    activeProjects,
    totalRevenue,
    pendingDisputes,
    pendingKYC,
  };
}


// ==================== ADMIN USERS FUNCTIONS ====================

export async function getAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users)
    .where(eq(users.role, 'admin'))
    .orderBy(asc(users.id));
}

// ==================== ESCROW HELPER FUNCTIONS ====================

export async function getDeliveredOrdersPendingValidation(minDays: number, maxDays: number) {
  const db = await getDb();
  if (!db) return [];
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - maxDays);
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - minDays);
  
  return db.select().from(orders)
    .where(and(
      eq(orders.status, 'delivered'),
      eq(orders.paymentStatus, 'paid'),
      sql`${orders.deliveredAt} IS NOT NULL`,
      sql`${orders.deliveredAt} >= ${minDate}`,
      sql`${orders.deliveredAt} <= ${maxDate}`
    ))
    .orderBy(asc(orders.deliveredAt));
}

export async function getDisputedOrders() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders)
    .where(eq(orders.status, 'disputed'))
    .orderBy(desc(orders.updatedAt));
}

export async function getDisputedOrdersWithDetails() {
  const db = await getDb();
  if (!db) return [];
  
  const disputedOrders = await db.select().from(orders)
    .where(eq(orders.status, 'disputed'))
    .orderBy(desc(orders.updatedAt));
  
  // Enrich with buyer and seller info
  const enriched = await Promise.all(disputedOrders.map(async (order) => {
    const [buyer, seller, service] = await Promise.all([
      db.select().from(users).where(eq(users.id, order.buyerId)).limit(1),
      db.select().from(users).where(eq(users.id, order.sellerId)).limit(1),
      db.select().from(services).where(eq(services.id, order.serviceId)).limit(1),
    ]);
    
    return {
      ...order,
      buyer: buyer[0] || null,
      seller: seller[0] || null,
      service: service[0] || null,
    };
  }));
  
  return enriched;
}

// ==================== USER PHONE NUMBER ====================

export async function updateUserPhoneNumber(userId: number, phoneNumber: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ 
    phone: phoneNumber,
    updatedAt: new Date()
  }).where(eq(users.id, userId));
}

export async function getUserPhoneNumber(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return result[0]?.phone || null;
}
