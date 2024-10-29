import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  password: text("password").notNull(),
  created_at: text().default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text().$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// tokens table
export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id"),
  token: text("token"),
  expires_at: text("expires_at"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// tokens relations
export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.user_id],
    references: [users.id],
  }),
}));
