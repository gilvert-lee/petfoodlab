CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`country` text,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `guides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body` text NOT NULL,
	`category` text DEFAULT 'basics' NOT NULL,
	`cover_url` text,
	`published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guides_slug_unique` ON `guides` (`slug`);--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`aliases` text,
	`group` text DEFAULT 'other' NOT NULL,
	`concern` text DEFAULT 'none' NOT NULL,
	`summary` text,
	`body` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ingredients_slug_unique` ON `ingredients` (`slug`);--> statement-breakpoint
CREATE TABLE `product_ingredients` (
	`product_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`position` integer NOT NULL,
	`raw_name` text NOT NULL,
	PRIMARY KEY(`product_id`, `position`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pi_ingredient_idx` ON `product_ingredients` (`ingredient_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`brand_id` integer,
	`species` text NOT NULL,
	`category` text NOT NULL,
	`life_stage` text,
	`image_url` text,
	`ingredients_raw` text,
	`protein` real,
	`fat` real,
	`fiber` real,
	`moisture` real,
	`ash` real,
	`calcium` real,
	`phosphorus` real,
	`kcal_per_100g` real,
	`weight_options` text,
	`price_note` text,
	`commentary` text,
	`pros` text,
	`cons` text,
	`suitable_for` text,
	`affiliate_url` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_species_cat_idx` ON `products` (`species`,`category`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`nickname` text NOT NULL,
	`pet_name` text,
	`pet_breed` text,
	`pet_age_years` real,
	`pet_weight_kg` real,
	`rating` integer NOT NULL,
	`feeding_weeks` integer,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`,`status`);