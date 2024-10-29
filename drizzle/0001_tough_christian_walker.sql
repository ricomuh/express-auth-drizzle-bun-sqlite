CREATE TABLE `tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`token` text,
	`expires_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "password", "created_at", "updated_at") SELECT "id", "name", "email", "password", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);