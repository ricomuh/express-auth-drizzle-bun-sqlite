PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reset_passwords` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text,
	`expires_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_reset_passwords`("uuid", "user_id", "code", "expires_at", "created_at", "updated_at") SELECT "uuid", "user_id", "code", "expires_at", "created_at", "updated_at" FROM `reset_passwords`;--> statement-breakpoint
DROP TABLE `reset_passwords`;--> statement-breakpoint
ALTER TABLE `__new_reset_passwords` RENAME TO `reset_passwords`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tokens` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_tokens`("uuid", "user_id", "token", "expires_at", "created_at", "updated_at") SELECT "uuid", "user_id", "token", "expires_at", "created_at", "updated_at" FROM `tokens`;--> statement-breakpoint
DROP TABLE `tokens`;--> statement-breakpoint
ALTER TABLE `__new_tokens` RENAME TO `tokens`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`email_verified_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("uuid", "name", "email", "password", "email_verified_at", "created_at", "updated_at") SELECT "uuid", "name", "email", "password", "email_verified_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);