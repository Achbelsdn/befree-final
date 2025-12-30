CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('order','message','payment','review','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text,
	`link` varchar(255),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`clientId` int NOT NULL,
	`freelancerId` int,
	`serviceId` int,
	`budget` decimal(12,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XOF',
	`status` enum('draft','open','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`deadline` timestamp,
	`completedAt` timestamp,
	`requirements` text,
	`attachments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`type` enum('deposit','withdrawal','payment','earning','refund','fee') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XOF',
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('mtn','moov','celtiis','card','wallet'),
	`phoneNumber` varchar(20),
	`reference` varchar(255),
	`externalReference` varchar(255),
	`description` text,
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`pendingBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`currency` varchar(10) NOT NULL DEFAULT 'XOF',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentStatus` enum('pending','paid','refunded','released') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` enum('mtn','moov','celtiis','card','wallet');--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentReference` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `paymentIntent`;