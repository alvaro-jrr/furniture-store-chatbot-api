CREATE TABLE `employees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`phone_number` varchar(256) NOT NULL,
	`role` enum('WORKER','ADMINISTRATIVE') NOT NULL,
	`address` varchar(256),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`hourly_rate` decimal(10,1),
	CONSTRAINT `equipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`description` varchar(256) NOT NULL,
	`hourly_rate` decimal(10,1),
	CONSTRAINT `labors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`message` varchar(256) NOT NULL,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` varchar(256),
	`sales_price` decimal(10,2) NOT NULL DEFAULT '0',
	`production_cost` decimal(10,2) NOT NULL DEFAULT '0',
	`stock` int unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products_equipments` (
	`product_id` int NOT NULL,
	`equipment_id` int NOT NULL,
	`hours` int unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `products_labors` (
	`product_id` int NOT NULL,
	`labor_id` int NOT NULL,
	`hours` int unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `products_resources` (
	`product_id` int NOT NULL,
	`resource_id` int NOT NULL,
	`hours` int unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `replies` (
	`id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`text` text NOT NULL,
	CONSTRAINT `replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`type` enum('INPUT','RAW_MATERIAL') NOT NULL,
	`unit_price` decimal(10,2) NOT NULL DEFAULT '0',
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `labors` ADD CONSTRAINT `labors_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_equipments` ADD CONSTRAINT `products_equipments_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_equipments` ADD CONSTRAINT `products_equipments_equipment_id_equipments_id_fk` FOREIGN KEY (`equipment_id`) REFERENCES `equipments`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_labors` ADD CONSTRAINT `products_labors_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_labors` ADD CONSTRAINT `products_labors_labor_id_labors_id_fk` FOREIGN KEY (`labor_id`) REFERENCES `labors`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_resources` ADD CONSTRAINT `products_resources_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_resources` ADD CONSTRAINT `products_resources_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `replies` ADD CONSTRAINT `replies_id_messages_id_fk` FOREIGN KEY (`id`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;