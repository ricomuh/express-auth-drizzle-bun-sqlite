ALTER TABLE `reset_passwords` ADD `code` text;--> statement-breakpoint
ALTER TABLE `reset_passwords` DROP COLUMN `token`;