CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`image` text,
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participant1Id` int NOT NULL,
	`participant2Id` int NOT NULL,
	`lastMessage` text,
	`lastMessageAt` timestamp,
	`readByParticipant1` boolean DEFAULT true,
	`readByParticipant2` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`attachments` text,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XOF',
	`status` enum('pending','in_progress','delivered','completed','cancelled','disputed') NOT NULL DEFAULT 'pending',
	`requirements` text,
	`deliveryDate` timestamp,
	`completedAt` timestamp,
	`paymentStatus` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`paymentIntent` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`sellerId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`description` text NOT NULL,
	`shortDescription` varchar(300),
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XOF',
	`deliveryTime` int NOT NULL,
	`revisions` int DEFAULT 1,
	`coverImage` text,
	`images` text,
	`features` text,
	`requirements` text,
	`tags` text,
	`status` enum('draft','active','paused','deleted') NOT NULL DEFAULT 'active',
	`totalOrders` int DEFAULT 0,
	`totalStars` int DEFAULT 0,
	`starCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100) DEFAULT 'Bénin';--> statement-breakpoint
ALTER TABLE `users` ADD `isSeller` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `users` ADD `languages` text;--> statement-breakpoint
ALTER TABLE `users` ADD `responseTime` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `completedOrders` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `rating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `totalReviews` int DEFAULT 0;