import { relations, sql } from 'drizzle-orm';
import { pgTable, varchar, timestamp, text, integer, boolean, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRole = pgEnum('user_role', ['admin', 'manager', 'member']);
export const credentialType = pgEnum('credential_type', [
    'password',
    'login_password',
    'api_key',
    'oauth_token',
    'ssh_key',
    'ssl_certificate',
    'env_variable',
    'database_credential',
    'access_key',
    'encryption_key',
    'jwt_token',
    'two_factor_secret',
    'webhook_secret',
    'smtp_credential',
    'ftp_credential',
    'vpn_credential',
    'dns_credential',
    'device_key',
    'key_value',
    'custom',
    'other',
]);
export const pricingType = pgEnum('pricing_type', ['recurring', 'one_time']);
export const pricingPlanInterval = pgEnum('pricing_plan_interval', ['year', 'month', 'week', 'day']);
export const subscriptionStatus = pgEnum('subscription_status', ['unpaid', 'past_due', 'incomplete_expired', 'incomplete', 'canceled', 'active', 'trialing']);

// Spaces
export const spaces = pgTable('spaces', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Users
export const users = pgTable('users', {
    id: uuid('id').primaryKey().notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    billingAddress: jsonb('billing_address'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    paymentMethod: jsonb('payment_method'),
    email: text('email'),
    role: userRole('role').notNull().default('member'),
});

export const userSpaces = pgTable(
    'user_spaces',
    {
        userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
        spaceId: uuid('space_id').references(() => spaces.id, { onDelete: 'cascade' }),
        role: userRole('role').notNull().default('member'),
    },
    (table) => {
        return {
            pk: sql`PRIMARY KEY (${table.userId}, ${table.spaceId})`,
        };
    }
);

// Credentials
export const customCredentialTypes = pgTable('custom_credential_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    spaceId: uuid('space_id').references(() => spaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    schema: jsonb('schema').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const credentials = pgTable('credentials', {
    id: uuid('id').primaryKey().defaultRandom(),
    spaceId: uuid('space_id').references(() => spaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    type: credentialType('type').notNull(),
    subtype: varchar('subtype', { length: 255 }),
    customTypeId: uuid('custom_type_id').references(() => customCredentialTypes.id),
    encryptedData: jsonb('encrypted_data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    maxViews: integer('max_views').default(1),
    viewCount: integer('view_count').default(0).notNull(),
});

export const credentialAccessLogs = pgTable('credential_access_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    credentialId: uuid('credential_id').references(() => credentials.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    accessedAt: timestamp('accessed_at', { withTimezone: true }).defaultNow().notNull(),
});

// Payment and Product
export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().notNull(),
    stripeCustomerId: text('stripe_customer_id'),
});

export const products = pgTable('products', {
    id: text('id').primaryKey().notNull(),
    active: boolean('active'),
    name: text('name'),
    description: text('description'),
    image: text('image'),
    metadata: jsonb('metadata'),
});

export const prices = pgTable('prices', {
    id: text('id').primaryKey().notNull(),
    productId: text('product_id').references(() => products.id),
    active: boolean('active'),
    description: text('description'),
    unitAmount: integer('unit_amount'),
    currency: text('currency'),
    type: pricingType('type'),
    interval: pricingPlanInterval('interval'),
    intervalCount: integer('interval_count'),
    trialPeriodDays: integer('trial_period_days'),
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

// Other
export const activityNotifications = pgTable('activity_notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    spaceId: uuid('space_id').references(() => spaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
});

// Relations
export const spacesRelations = relations(spaces, ({ many }) => ({
    userSpaces: many(userSpaces),
    credentials: many(credentials),
    activityNotifications: many(activityNotifications),
}));

export const usersRelations = relations(users, ({ many }) => ({
    userSpaces: many(userSpaces),
    subscriptions: many(subscriptions),
    credentialAccessLogs: many(credentialAccessLogs),
    activityNotifications: many(activityNotifications),
}));

export const credentialsRelations = relations(credentials, ({ one, many }) => ({
    space: one(spaces, {
        fields: [credentials.spaceId],
        references: [spaces.id],
    }),
    customType: one(customCredentialTypes, {
        fields: [credentials.customTypeId],
        references: [customCredentialTypes.id],
    }),
    accessLogs: many(credentialAccessLogs),
}));

export const customCredentialTypesRelations = relations(customCredentialTypes, ({ one, many }) => ({
    space: one(spaces, {
        fields: [customCredentialTypes.spaceId],
        references: [spaces.id],
    }),
    credentials: many(credentials),
}));

export const productsRelations = relations(products, ({ many }) => ({
    prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
    product: one(products, {
        fields: [prices.productId],
        references: [products.id],
    }),
}));

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertSpace = typeof spaces.$inferInsert;
export type SelectSpace = typeof spaces.$inferSelect;

export type InsertUserSpace = typeof userSpaces.$inferInsert;
export type SelectUserSpace = typeof userSpaces.$inferSelect;

export type InsertCredential = typeof credentials.$inferInsert;
export type SelectCredential = typeof credentials.$inferSelect;

export type InsertCustomCredentialType = typeof customCredentialTypes.$inferInsert;
export type SelectCustomCredentialType = typeof customCredentialTypes.$inferSelect;

export type InsertCredentialAccessLog = typeof credentialAccessLogs.$inferInsert;
export type SelectCredentialAccessLog = typeof credentialAccessLogs.$inferSelect;

export type InsertCustomer = typeof customers.$inferInsert;
export type SelectCustomer = typeof customers.$inferSelect;

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

export type InsertPrice = typeof prices.$inferInsert;
export type SelectPrice = typeof prices.$inferSelect;

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;

export type InsertActivityNotification = typeof activityNotifications.$inferInsert;
export type SelectActivityNotification = typeof activityNotifications.$inferSelect;
