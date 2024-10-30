import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// users table
export const users = sqliteTable("users", {
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  email_verified_at: text("email_verified_at"),
  created_at: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text().$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// tokens table
export const tokens = sqliteTable("tokens", {
  uuid: text("uuid").primaryKey(),
  user_id: text("user_id").notNull(),
  token: text("token").notNull(),
  expires_at: text("expires_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// reset_passwords table
export const resetPasswords = sqliteTable("reset_passwords", {
  uuid: text("uuid").primaryKey(),
  user_id: text("user_id").notNull(),
  code: text("code"),
  expires_at: text("expires_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// tokens relations
export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.user_id],
    references: [users.uuid],
  }),
}));

// reset_passwords relations
export const resetPasswordsRelations = relations(resetPasswords, ({ one }) => ({
  user: one(users, {
    fields: [resetPasswords.user_id],
    references: [users.uuid],
  }),
}));
