-- ===========================================
-- ORBIT - Schéma de Base de Données MySQL
-- ===========================================
-- Version: 1.0.0
-- Compatible avec: MySQL 8.0+ / TiDB
-- ===========================================

-- Créer la base de données (si nécessaire)
-- CREATE DATABASE IF NOT EXISTS orbit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE orbit;

-- ===========================================
-- TABLE: users
-- Description: Utilisateurs de la plateforme (clients et freelances)
-- ===========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `userType` ENUM('client', 'freelance') NOT NULL DEFAULT 'client',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Extended fields for freelance platform
  `avatar` TEXT,
  `bio` TEXT,
  `phone` VARCHAR(20),
  `city` VARCHAR(100),
  `country` VARCHAR(100) DEFAULT 'France',
  `isSeller` BOOLEAN NOT NULL DEFAULT FALSE,
  `skills` TEXT COMMENT 'JSON array of skills',
  `languages` TEXT COMMENT 'JSON array of languages',
  `responseTime` VARCHAR(50),
  `completedOrders` INT DEFAULT 0,
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `totalReviews` INT DEFAULT 0,
  -- Email auth fields
  `passwordHash` VARCHAR(255),
  `emailVerified` BOOLEAN DEFAULT FALSE,
  `verificationToken` VARCHAR(255),
  
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_isSeller` (`isSeller`),
  INDEX `idx_users_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: categories
-- Description: Catégories de services et projets
-- ===========================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(100),
  `image` TEXT,
  `color` VARCHAR(20),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: services
-- Description: Services/Gigs proposés par les freelances
-- ===========================================
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(250) NOT NULL,
  `description` TEXT NOT NULL,
  `shortDescription` VARCHAR(300),
  `price` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `deliveryTime` INT NOT NULL COMMENT 'Delivery time in days',
  `revisions` INT DEFAULT 1,
  `coverImage` TEXT,
  `images` TEXT COMMENT 'JSON array of image URLs',
  `features` TEXT COMMENT 'JSON array of features included',
  `requirements` TEXT COMMENT 'What the seller needs from buyer',
  `tags` TEXT COMMENT 'JSON array of tags',
  `status` ENUM('draft', 'active', 'paused', 'deleted') NOT NULL DEFAULT 'active',
  `totalOrders` INT DEFAULT 0,
  `totalStars` INT DEFAULT 0,
  `starCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_services_userId` (`userId`),
  INDEX `idx_services_categoryId` (`categoryId`),
  INDEX `idx_services_status` (`status`),
  INDEX `idx_services_price` (`price`),
  FULLTEXT INDEX `idx_services_search` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: projects
-- Description: Projets publics postés par les clients
-- ===========================================
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(250) NOT NULL,
  `description` TEXT NOT NULL,
  `clientId` INT NOT NULL,
  `categoryId` INT,
  `freelancerId` INT,
  `budgetMin` DECIMAL(12,2),
  `budgetMax` DECIMAL(12,2),
  `budgetType` ENUM('fixed', 'hourly', 'negotiable') NOT NULL DEFAULT 'fixed',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `status` ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  `visibility` ENUM('public', 'private', 'invite_only') NOT NULL DEFAULT 'public',
  `deadline` TIMESTAMP NULL,
  `duration` VARCHAR(50) COMMENT 'e.g., 1-2 weeks, 1 month',
  `experienceLevel` ENUM('entry', 'intermediate', 'expert') DEFAULT 'intermediate',
  `skills` TEXT COMMENT 'JSON array of required skills',
  `attachments` TEXT COMMENT 'JSON array of file URLs',
  `requirements` TEXT,
  `completedAt` TIMESTAMP NULL,
  -- Engagement stats
  `viewCount` INT DEFAULT 0,
  `applicationCount` INT DEFAULT 0,
  `likeCount` INT DEFAULT 0,
  `commentCount` INT DEFAULT 0,
  `saveCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_projects_clientId` (`clientId`),
  INDEX `idx_projects_status` (`status`),
  INDEX `idx_projects_visibility` (`visibility`),
  FULLTEXT INDEX `idx_projects_search` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: projectApplications
-- Description: Candidatures des freelances aux projets
-- ===========================================
CREATE TABLE IF NOT EXISTS `projectApplications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `freelancerId` INT NOT NULL,
  `coverLetter` TEXT NOT NULL,
  `proposedBudget` DECIMAL(12,2),
  `proposedDuration` VARCHAR(50),
  `attachments` TEXT COMMENT 'JSON array of portfolio/sample URLs',
  `status` ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  `clientNote` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_applications_projectId` (`projectId`),
  INDEX `idx_applications_freelancerId` (`freelancerId`),
  INDEX `idx_applications_status` (`status`),
  UNIQUE INDEX `idx_applications_unique` (`projectId`, `freelancerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: projectLikes
-- Description: Likes sur les projets
-- ===========================================
CREATE TABLE IF NOT EXISTS `projectLikes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX `idx_projectLikes_unique` (`projectId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: projectComments
-- Description: Commentaires sur les projets
-- ===========================================
CREATE TABLE IF NOT EXISTS `projectComments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  `parentId` INT COMMENT 'For replies',
  `content` TEXT NOT NULL,
  `isEdited` BOOLEAN DEFAULT FALSE,
  `likeCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_comments_projectId` (`projectId`),
  INDEX `idx_comments_userId` (`userId`),
  INDEX `idx_comments_parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: projectSaves
-- Description: Projets sauvegardés/bookmarkés
-- ===========================================
CREATE TABLE IF NOT EXISTS `projectSaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isImportant` BOOLEAN DEFAULT FALSE,
  `note` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX `idx_projectSaves_unique` (`projectId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: commentLikes
-- Description: Likes sur les commentaires
-- ===========================================
CREATE TABLE IF NOT EXISTS `commentLikes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `commentId` INT NOT NULL,
  `userId` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX `idx_commentLikes_unique` (`commentId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: orders
-- Description: Commandes passées par les acheteurs
-- ===========================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `serviceId` INT NOT NULL,
  `buyerId` INT NOT NULL,
  `sellerId` INT NOT NULL,
  `projectId` INT,
  `title` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `status` ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'pending',
  `requirements` TEXT,
  `deliveryDate` TIMESTAMP NULL,
  `completedAt` TIMESTAMP NULL,
  `paymentStatus` ENUM('pending', 'paid', 'refunded', 'released') NOT NULL DEFAULT 'pending',
  `paymentMethod` ENUM('stripe', 'paypal', 'bank_transfer', 'wallet'),
  `paymentReference` VARCHAR(255),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_orders_buyerId` (`buyerId`),
  INDEX `idx_orders_sellerId` (`sellerId`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_paymentStatus` (`paymentStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: wallets
-- Description: Portefeuilles utilisateurs
-- ===========================================
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL UNIQUE,
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `pendingBalance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_wallets_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: transactions
-- Description: Transactions financières
-- ===========================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `walletId` INT NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'payment', 'earning', 'refund', 'fee') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `paymentMethod` ENUM('stripe', 'paypal', 'bank_transfer', 'wallet'),
  `phoneNumber` VARCHAR(20),
  `reference` VARCHAR(255),
  `externalReference` VARCHAR(255),
  `description` TEXT,
  `orderId` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_transactions_userId` (`userId`),
  INDEX `idx_transactions_walletId` (`walletId`),
  INDEX `idx_transactions_status` (`status`),
  INDEX `idx_transactions_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: reviews
-- Description: Avis sur les services
-- ===========================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `serviceId` INT NOT NULL,
  `orderId` INT NOT NULL,
  `userId` INT NOT NULL,
  `sellerId` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_reviews_serviceId` (`serviceId`),
  INDEX `idx_reviews_sellerId` (`sellerId`),
  INDEX `idx_reviews_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: conversations
-- Description: Conversations entre utilisateurs
-- ===========================================
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `participant1Id` INT NOT NULL,
  `participant2Id` INT NOT NULL,
  `lastMessage` TEXT,
  `lastMessageAt` TIMESTAMP NULL,
  `readByParticipant1` BOOLEAN DEFAULT TRUE,
  `readByParticipant2` BOOLEAN DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_conversations_participant1` (`participant1Id`),
  INDEX `idx_conversations_participant2` (`participant2Id`),
  UNIQUE INDEX `idx_conversations_participants` (`participant1Id`, `participant2Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: messages
-- Description: Messages dans les conversations
-- ===========================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversationId` INT NOT NULL,
  `senderId` INT NOT NULL,
  `content` TEXT NOT NULL,
  `attachments` TEXT COMMENT 'JSON array of attachment URLs',
  `isRead` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_messages_conversationId` (`conversationId`),
  INDEX `idx_messages_senderId` (`senderId`),
  INDEX `idx_messages_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: favorites
-- Description: Services favoris/sauvegardés
-- ===========================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `serviceId` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX `idx_favorites_unique` (`userId`, `serviceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: notifications
-- Description: Notifications utilisateurs
-- ===========================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `type` ENUM('order', 'message', 'payment', 'review', 'system', 'project', 'application') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT,
  `link` VARCHAR(255),
  `isRead` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_notifications_userId` (`userId`),
  INDEX `idx_notifications_isRead` (`isRead`),
  INDEX `idx_notifications_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- FOREIGN KEYS (Optionnel - pour l'intégrité référentielle)
-- ===========================================
-- Décommentez ces lignes si vous souhaitez activer les contraintes de clés étrangères

-- ALTER TABLE `services` ADD CONSTRAINT `fk_services_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `services` ADD CONSTRAINT `fk_services_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL;
-- ALTER TABLE `projects` ADD CONSTRAINT `fk_projects_clientId` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_buyerId` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `wallets` ADD CONSTRAINT `fk_wallets_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `reviews` ADD CONSTRAINT `fk_reviews_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `messages` ADD CONSTRAINT `fk_messages_conversationId` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `favorites` ADD CONSTRAINT `fk_favorites_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `notifications` ADD CONSTRAINT `fk_notifications_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- ===========================================
-- FIN DU SCHÉMA
-- ===========================================
