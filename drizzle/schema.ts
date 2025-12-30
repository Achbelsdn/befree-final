import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }), // google, email
  role: mysqlEnum("role", ["user", "moderator", "admin", "superadmin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["client", "freelance"]).default("client").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Extended fields for freelance platform
  avatar: text("avatar"),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bénin"),
  isSeller: boolean("isSeller").default(false).notNull(),
  skills: text("skills"), // JSON array of skills
  languages: text("languages"), // JSON array of languages
  responseTime: varchar("responseTime", { length: 50 }),
  completedOrders: int("completedOrders").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  // KYC status
  kycStatus: mysqlEnum("kycStatus", ["none", "pending", "verified", "rejected"]).default("none").notNull(),
  kycSubmittedAt: timestamp("kycSubmittedAt"),
  kycVerifiedAt: timestamp("kycVerifiedAt"),
  // Email auth fields
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false),
  verificationToken: varchar("verificationToken", { length: 255 }),
  // Account status
  isBanned: boolean("isBanned").default(false),
  bannedAt: timestamp("bannedAt"),
  banReason: text("banReason"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for services and projects
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  image: text("image"),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Services/Gigs offered by freelancers
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 300 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  deliveryTime: int("deliveryTime").notNull(), // in days
  revisions: int("revisions").default(1),
  coverImage: text("coverImage"),
  images: text("images"), // JSON array of image URLs
  features: text("features"), // JSON array of features included
  requirements: text("requirements"), // What the seller needs from buyer
  tags: text("tags"), // JSON array of tags
  status: mysqlEnum("status", ["draft", "active", "paused", "deleted"]).default("active").notNull(),
  totalOrders: int("totalOrders").default(0),
  totalStars: int("totalStars").default(0),
  starCount: int("starCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Projects - Public job posts by clients for freelancers to apply
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull(),
  description: text("description").notNull(),
  clientId: int("clientId").notNull(),
  categoryId: int("categoryId"),
  freelancerId: int("freelancerId"),
  budgetMin: decimal("budgetMin", { precision: 12, scale: 2 }),
  budgetMax: decimal("budgetMax", { precision: 12, scale: 2 }),
  budgetType: mysqlEnum("budgetType", ["fixed", "hourly", "negotiable"]).default("fixed").notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  status: mysqlEnum("status", ["draft", "open", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  visibility: mysqlEnum("visibility", ["public", "private", "invite_only"]).default("public").notNull(),
  deadline: timestamp("deadline"),
  duration: varchar("duration", { length: 50 }), // e.g., "1-2 weeks", "1 month"
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "intermediate", "expert"]).default("intermediate"),
  skills: text("skills"), // JSON array of required skills
  attachments: text("attachments"), // JSON array of file URLs
  requirements: text("requirements"),
  completedAt: timestamp("completedAt"),
  // Engagement stats
  viewCount: int("viewCount").default(0),
  applicationCount: int("applicationCount").default(0),
  likeCount: int("likeCount").default(0),
  commentCount: int("commentCount").default(0),
  saveCount: int("saveCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Applications - Freelancers apply to projects
 */
export const projectApplications = mysqlTable("projectApplications", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  freelancerId: int("freelancerId").notNull(),
  coverLetter: text("coverLetter").notNull(),
  proposedBudget: decimal("proposedBudget", { precision: 12, scale: 2 }),
  proposedDuration: varchar("proposedDuration", { length: 50 }),
  attachments: text("attachments"), // JSON array of portfolio/sample URLs
  status: mysqlEnum("status", ["pending", "shortlisted", "accepted", "rejected", "withdrawn"]).default("pending").notNull(),
  clientNote: text("clientNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectApplication = typeof projectApplications.$inferSelect;
export type InsertProjectApplication = typeof projectApplications.$inferInsert;

/**
 * Project Likes - Users can like projects
 */
export const projectLikes = mysqlTable("projectLikes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectLike = typeof projectLikes.$inferSelect;
export type InsertProjectLike = typeof projectLikes.$inferInsert;

/**
 * Project Comments - Users can comment on projects
 */
export const projectComments = mysqlTable("projectComments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  parentId: int("parentId"), // For replies
  content: text("content").notNull(),
  isEdited: boolean("isEdited").default(false),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = typeof projectComments.$inferInsert;

/**
 * Project Saves/Bookmarks - Users can save projects for later
 */
export const projectSaves = mysqlTable("projectSaves", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  isImportant: boolean("isImportant").default(false), // Mark as important
  note: text("note"), // Personal note
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectSave = typeof projectSaves.$inferSelect;
export type InsertProjectSave = typeof projectSaves.$inferInsert;

/**
 * Comment Likes - Users can like comments
 */
export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

/**
 * Orders placed by buyers
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  projectId: int("projectId"),
  title: varchar("title", { length: 200 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "delivered", "completed", "cancelled", "disputed"]).default("pending").notNull(),
  requirements: text("requirements"),
  deliveryDate: timestamp("deliveryDate"),
  deliveredAt: timestamp("deliveredAt"), // When the freelance delivered the work
  completedAt: timestamp("completedAt"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded", "released"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["mtn", "moov", "celtiis", "card", "wallet"]),
  paymentReference: varchar("paymentReference", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Wallets for users - Store earnings and balance
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  pendingBalance: decimal("pendingBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Transactions - All financial movements
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "payment", "earning", "refund", "fee"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["mtn", "moov", "celtiis", "card", "wallet"]),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  reference: varchar("reference", { length: 255 }),
  externalReference: varchar("externalReference", { length: 255 }),
  description: text("description"),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Reviews for services
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  orderId: int("orderId").notNull(),
  userId: int("userId").notNull(),
  sellerId: int("sellerId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Conversations between users
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  participant1Id: int("participant1Id").notNull(),
  participant2Id: int("participant2Id").notNull(),
  lastMessage: text("lastMessage"),
  lastMessageAt: timestamp("lastMessageAt"),
  readByParticipant1: boolean("readByParticipant1").default(true),
  readByParticipant2: boolean("readByParticipant2").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages in conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Favorites/Saved services
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceId: int("serviceId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["order", "message", "payment", "review", "system", "project", "application", "alert", "kyc"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  link: varchar("link", { length: 255 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * KYC Documents - Identity verification documents for freelancers
 */
export const kycDocuments = mysqlTable("kycDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", ["id_card", "passport", "driver_license", "residence_proof", "selfie"]).notNull(),
  documentUrl: text("documentUrl").notNull(),
  documentNumber: varchar("documentNumber", { length: 100 }),
  expiryDate: timestamp("expiryDate"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KYCDocument = typeof kycDocuments.$inferSelect;
export type InsertKYCDocument = typeof kycDocuments.$inferInsert;

/**
 * Portfolio Items - Showcase work samples for freelancers
 */
export const portfolioItems = mysqlTable("portfolioItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  imageUrl: text("imageUrl").notNull(),
  projectUrl: text("projectUrl"),
  clientName: varchar("clientName", { length: 200 }),
  completionDate: timestamp("completionDate"),
  tags: text("tags"), // JSON array of tags
  isHighlighted: boolean("isHighlighted").default(false),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Certifications - Professional certifications for freelancers
 */
export const certifications = mysqlTable("certifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  issuingOrganization: varchar("issuingOrganization", { length: 200 }).notNull(),
  credentialId: varchar("credentialId", { length: 200 }),
  credentialUrl: text("credentialUrl"),
  issueDate: timestamp("issueDate").notNull(),
  expiryDate: timestamp("expiryDate"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;

/**
 * Mutual Reviews - Both parties can review each other after order completion
 */
export const mutualReviews = mysqlTable("mutualReviews", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  revieweeId: int("revieweeId").notNull(),
  reviewerType: mysqlEnum("reviewerType", ["client", "freelancer"]).notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  // Specific rating categories
  communicationRating: int("communicationRating"), // 1-5
  qualityRating: int("qualityRating"), // 1-5
  timelinessRating: int("timelinessRating"), // 1-5
  professionalismRating: int("professionalismRating"), // 1-5
  // Response from reviewee
  response: text("response"),
  responseAt: timestamp("responseAt"),
  // Moderation
  isHidden: boolean("isHidden").default(false),
  hiddenReason: text("hiddenReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MutualReview = typeof mutualReviews.$inferSelect;
export type InsertMutualReview = typeof mutualReviews.$inferInsert;

/**
 * User Badges - Achievement badges for users
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: mysqlEnum("badgeType", [
    "verified_identity",
    "top_rated",
    "rising_talent",
    "expert",
    "fast_responder",
    "on_time_delivery",
    "repeat_client",
    "early_adopter",
    "community_contributor"
  ]).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  metadata: text("metadata"), // JSON for additional badge data
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Escrow Transactions - Track escrow payments
 */
export const escrowTransactions = mysqlTable("escrowTransactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  status: mysqlEnum("status", ["held", "released", "refunded", "disputed"]).default("held").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["mtn", "moov", "celtiis", "card", "wallet"]),
  paymentReference: varchar("paymentReference", { length: 255 }),
  releasedAt: timestamp("releasedAt"),
  releasedBy: int("releasedBy"),
  refundedAt: timestamp("refundedAt"),
  refundReason: text("refundReason"),
  disputeId: int("disputeId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = typeof escrowTransactions.$inferInsert;

/**
 * Disputes - Handle order disputes
 */
export const disputes = mysqlTable("disputes", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  openedBy: int("openedBy").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "closed"]).default("open").notNull(),
  resolution: text("resolution"),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  buyerRefundAmount: decimal("buyerRefundAmount", { precision: 12, scale: 2 }),
  sellerPaymentAmount: decimal("sellerPaymentAmount", { precision: 12, scale: 2 }),
  attachments: text("attachments"), // JSON array of evidence files
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

/**
 * Dispute Messages - Communication during dispute resolution
 */
export const disputeMessages = mysqlTable("disputeMessages", {
  id: int("id").autoincrement().primaryKey(),
  disputeId: int("disputeId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["buyer", "seller", "admin"]).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type InsertDisputeMessage = typeof disputeMessages.$inferInsert;
