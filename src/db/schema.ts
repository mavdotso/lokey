import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const passwordLinksTable = pgTable('password_links', {
    id: varchar('id').primaryKey(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
});

export type InsertPasswordLink = typeof passwordLinksTable.$inferInsert;
export type SelectPasswordLink = typeof passwordLinksTable.$inferSelect;
