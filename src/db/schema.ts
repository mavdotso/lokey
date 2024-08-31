import { relations, sql } from 'drizzle-orm';
import { pgTable, varchar, timestamp, text, integer, boolean, uuid, jsonb, bigint, pgEnum } from 'drizzle-orm/pg-core';

export const keyStatus = pgEnum('key_status', ['expired', 'invalid', 'valid', 'default']);
export const keyType = pgEnum('key_type', ['stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf']);
export const factorStatus = pgEnum('factor_status', ['verified', 'unverified']);
export const factorType = pgEnum('factor_type', ['webauthn', 'totp']);
export const aalLevel = pgEnum('aal_level', ['aal3', 'aal2', 'aal1']);
export const codeChallengeMethod = pgEnum('code_challenge_method', ['plain', 's256']);
export const pricingType = pgEnum('pricing_type', ['recurring', 'one_time']);
export const pricingPlanInterval = pgEnum('pricing_plan_interval', ['year', 'month', 'week', 'day']);
export const subscriptionStatus = pgEnum('subscription_status', ['unpaid', 'past_due', 'incomplete_expired', 'incomplete', 'canceled', 'active', 'trialing']);
export const equalityOp = pgEnum('equality_op', ['in', 'gte', 'gt', 'lte', 'lt', 'neq', 'eq']);
export const action = pgEnum('action', ['ERROR', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT']);

export const passwords = pgTable('passwords', {
    id: varchar('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    maxViews: integer('max_uses').notNull().default(1),
    viewCount: integer('use_count').notNull().default(0),
    hasBeenViewed: boolean('has_been_viewed').notNull().default(false),
});

export const users = pgTable('users', {
    id: uuid('id').primaryKey().notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    billingAddress: jsonb('billing_address'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    paymentMethod: jsonb('payment_method'),
    email: text('email'),
});

export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().notNull(),
    stripeCustomerId: text('stripe_customer_id'),
});

export const prices = pgTable('prices', {
    id: text('id').primaryKey().notNull(),
    productId: text('product_id').references(() => products.id),
    active: boolean('active'),
    description: text('description'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    unitAmount: bigint('unit_amount', { mode: 'number' }),
    currency: text('currency'),
    type: pricingType('type'),
    interval: pricingPlanInterval('interval'),
    intervalCount: integer('interval_count'),
    trialPeriodDays: integer('trial_period_days'),
    metadata: jsonb('metadata'),
});

export const products = pgTable('products', {
    id: text('id').primaryKey().notNull(),
    active: boolean('active'),
    name: text('name'),
    description: text('description'),
    image: text('image'),
    metadata: jsonb('metadata'),
});

export const subscriptions = pgTable('subscriptions', {
    id: text('id').primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    status: subscriptionStatus('status'),
    metadata: jsonb('metadata'),
    priceId: text('price_id').references(() => prices.id),
    quantity: integer('quantity'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end'),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
        .default(sql`now()`)
        .notNull(),
    currentPeriodStart: timestamp('current_period_start', {
        withTimezone: true,
        mode: 'string',
    })
        .default(sql`now()`)
        .notNull(),
    currentPeriodEnd: timestamp('current_period_end', {
        withTimezone: true,
        mode: 'string',
    })
        .default(sql`now()`)
        .notNull(),
    endedAt: timestamp('ended_at', {
        withTimezone: true,
        mode: 'string',
    }).default(sql`now()`),
    cancelAt: timestamp('cancel_at', {
        withTimezone: true,
        mode: 'string',
    }).default(sql`now()`),
    canceledAt: timestamp('canceled_at', {
        withTimezone: true,
        mode: 'string',
    }).default(sql`now()`),
    trialStart: timestamp('trial_start', {
        withTimezone: true,
        mode: 'string',
    }).default(sql`now()`),
    trialEnd: timestamp('trial_end', {
        withTimezone: true,
        mode: 'string',
    }).default(sql`now()`),
});

export const productsRelations = relations(products, ({ many }) => ({
    prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
    product: one(products, {
        fields: [prices.productId],
        references: [products.id],
    }),
}));

export type InsertPassword = typeof passwords.$inferInsert;
export type SelectPassword = typeof passwords.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertCustomer = typeof customers.$inferInsert;
export type SelectCustomer = typeof customers.$inferSelect;

export type InsertPrice = typeof prices.$inferInsert;
export type SelectPrice = typeof prices.$inferSelect;

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
