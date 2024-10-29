CREATE TABLE `tokens` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text,
	`expires_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);