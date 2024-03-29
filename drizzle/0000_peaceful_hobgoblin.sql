CREATE TABLE `clients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(256) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`address` varchar(256) NOT NULL,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_email_unique` UNIQUE(`email`),
	CONSTRAINT `clients_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`phone_number` varchar(256) NOT NULL,
	`role` enum('WORKER','ADMINISTRATIVE') NOT NULL,
	`labor_description` varchar(256) NOT NULL,
	`hourly_rate` decimal(10,1) NOT NULL,
	`address` varchar(256),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`hourly_rate` decimal(10,1) NOT NULL,
	CONSTRAINT `equipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`text` text NOT NULL,
	`type` enum('USER','AI') NOT NULL,
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
CREATE TABLE `products_employees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`hours` int unsigned NOT NULL,
	CONSTRAINT `products_employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_employee_unique` UNIQUE(`product_id`,`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `products_equipments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`hours` int unsigned NOT NULL,
	CONSTRAINT `products_equipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_equipment_unique` UNIQUE(`product_id`,`equipment_id`)
);
--> statement-breakpoint
CREATE TABLE `products_resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`resource_id` bigint unsigned NOT NULL,
	`quantity` int unsigned NOT NULL,
	CONSTRAINT `products_resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_resource_unique` UNIQUE(`product_id`,`resource_id`)
);
--> statement-breakpoint
CREATE TABLE `products_sales` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`sales_id` bigint unsigned NOT NULL,
	`quantity` int unsigned NOT NULL,
	CONSTRAINT `products_sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_sale_unique` UNIQUE(`product_id`,`sales_id`)
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
CREATE TABLE `sales` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`client_id` bigint unsigned NOT NULL,
	`date` timestamp DEFAULT (now()),
	`total` decimal(10,2) NOT NULL,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` enum('ADMIN','USER') NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_employees` ADD CONSTRAINT `products_employees_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_employees` ADD CONSTRAINT `products_employees_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_equipments` ADD CONSTRAINT `products_equipments_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_equipments` ADD CONSTRAINT `products_equipments_equipment_id_equipments_id_fk` FOREIGN KEY (`equipment_id`) REFERENCES `equipments`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_resources` ADD CONSTRAINT `products_resources_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_resources` ADD CONSTRAINT `products_resources_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_sales` ADD CONSTRAINT `products_sales_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_sales` ADD CONSTRAINT `products_sales_sales_id_sales_id_fk` FOREIGN KEY (`sales_id`) REFERENCES `sales`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales` ADD CONSTRAINT `sales_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE restrict ON UPDATE no action;