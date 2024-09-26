import { defineSchema, defineTable } from 'convex/server';
import { v, Validator } from 'convex/values';

/* APP */
export const CREDENTIALS_TYPES = {
    PASSWORD: 'PASSWORD',
    LOGIN_PASSWORD: 'LOGIN_PASSWORD',
    API_KEY: 'API_KEY',
    OAUTH_TOKEN: 'OAUTH_TOKEN',
    SSH_KEY: 'SSH_KEY',
    SSL_CERTIFICATE: 'SSL_CERTIFICATE',
    ENV_VARIABLE: 'ENV_VARIABLE',
    DATABASE_CREDENTIALS: 'DATABASE_CREDENTIALS',
    ACCESS_KEY: 'ACCESS_KEY',
    ENCRYPTION_KEY: 'ENCRYPTION_KEY',
    JWT_TOKEN: 'JWT_TOKEN',
    TWO_FACTOR_SECRET: 'TWO_FACTOR_SECRET',
    WEBHOOK_SECRET: 'WEBHOOK_SECRET',
    SMTP_CREDENTIALS: 'SMTP_CREDENTIALS',
    FTP_CREDENTIALS: 'FTP_CREDENTIALS',
    VPN_CREDENTIALS: 'VPN_CREDENTIALS',
    DNS_CREDENTIALS: 'DNS_CREDENTIALS',
    DEVICE_KEY: 'DEVICE_KEY',
    KEY_VALUE: 'KEY_VALUE',
    CUSTOM: 'CUSTOM',
    OTHER: 'OTHER',
} as const;
export const ROLES = { ADMIN: 'ADMIN', MANAGER: 'MANAGER', MEMBER: 'MEMBER' } as const;
export const PLANS = { FREE: 'FREE', TEAM: 'TEAM' } as const;
export const INVITES = { ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED', EXPIRED: 'EXPIRED', PENDING: 'PENDING' } as const;
export const CREDENTIALS_REQUEST_STATUS = { PENDING: 'PENDING', REJECTED: 'REJECTED', FULFILLED: 'FULFILLED' } as const;

/* STRIPE */
export const CURRENCIES = { USD: 'usd', EUR: 'eur' } as const;
export const INTERVALS = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' } as const;
export const PRICING = { RECURRING: 'recurring', ONE_TIME: 'one_time' } as const;
export const SUBSCRIPTION_STATUS = {
    PAUSED: 'paused',
    UNPAID: 'unpaid',
    PAST_DUE: 'past_due',
    INCOMPLETE_EXPIRED: 'incomplete_expired',
    INCOMPLETE: 'incomplete',
    CANCELED: 'canceled',
    ACTIVE: 'active',
    TRIALING: 'trialing',
} as const;

/* VALIDATORS */

export const roleTypeValidator = v.union(...Object.values(ROLES).map(v.literal));
export const credentialsTypeValidator = v.union(...Object.values(CREDENTIALS_TYPES).map(v.literal));
export const inviteTypeValidator = v.union(...Object.values(INVITES).map(v.literal));
export const currencyValidator = v.union(...Object.values(CURRENCIES).map(v.literal));
export const intervalValidator = v.union(...Object.values(INTERVALS).map(v.literal));
export const planTypeValidator = v.union(...Object.values(PLANS).map(v.literal));
export const pricingTypeValidator = v.union(...Object.values(PRICING).map(v.literal));
export const subscriptionStatusValidator = v.union(...Object.values(SUBSCRIPTION_STATUS).map(v.literal));
export const credentialsRequestStatusValidator = v.union(...Object.values(CREDENTIALS_REQUEST_STATUS).map(v.literal));

/* SCHEMA */
export const workspaceSchema = {
    ownerId: v.id('users'),
    name: v.string(),
    slug: v.string(),
    iconId: v.string(),
    logo: v.optional(v.string()),
    defaultInvite: v.optional(v.id('workspaceInvites')),
    planType: planTypeValidator,
    customer: v.optional(v.id('customers')),
    currentSubscription: v.optional(v.id('subscriptions')),
};

const userWorkspaceSchema = {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: roleTypeValidator,
};

const credentialsSchema = {
    workspaceId: v.optional(v.id('workspaces')),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.id('users')),
    type: credentialsTypeValidator,
    encryptedData: v.string(),
    privateKey: v.string(),
    updatedAt: v.string(),
    expiresAt: v.optional(v.string()),
    maxViews: v.optional(v.number()),
    viewCount: v.number(),
};

const credentialsRequestSchema = {
    workspaceId: v.id('workspaces'),
    createdBy: v.id('users'),
    name: v.string(),
    description: v.string(),
    updatedAt: v.string(),
    credentials: v.array(
        v.object({
            name: v.string(),
            description: v.optional(v.string()),
            type: credentialsTypeValidator,
            encryptedValue: v.optional(v.string()),
        })
    ),
    status: credentialsRequestStatusValidator,
    fulfilledBy: v.optional(v.id('users')),
    fulfilledAt: v.optional(v.string()),
    encryptedPrivateKey: v.string(),
};

const workspaceInviteSchema = {
    workspaceId: v.id('workspaces'),
    invitedBy: v.id('users'),
    invitedUserId: v.optional(v.id('users')),
    invitedEmail: v.optional(v.string()),
    role: roleTypeValidator,
    status: inviteTypeValidator,
    expiresAt: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
};

const usageLimitSchema = {
    secretsPerMonth: v.number(),
    secretRequestsAndChats: v.number(),
    secretAttachmentSize: v.number(),
    customDomain: v.boolean(),
    teamSize: v.number(),
    apiAccess: v.boolean(),
};

const usageTrackingSchema = {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    month: v.string(),
    secretsCreated: v.number(),
    secretRequestsAndChats: v.number(),
    largestAttachmentSize: v.number(),
};

/* STRIPE SCHEMA */
const customerSchema = {
    userId: v.id('users'),
    stripeCustomerId: v.string(),
};

const productSchema = {
    stripeId: v.string(),
    active: v.boolean(),
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    metadata: v.optional(v.any()),
    prices: v.optional(v.array(v.id('prices'))),
};

const priceSchema = {
    stripeId: v.string(),
    productId: v.id('products'),
    active: v.boolean(),
    description: v.optional(v.string()),
    unitAmount: v.number(),
    currency: currencyValidator,
    type: pricingTypeValidator,
    interval: intervalValidator,
    intervalCount: v.optional(v.number()),
    trialPeriodDays: v.optional(v.number()),
    metadata: v.optional(v.any()),
};

const subscriptionSchema = {
    workspaceId: v.id('workspaces'),
    status: subscriptionStatusValidator,
    priceId: v.id('prices'),
    quantity: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    created: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    endedAt: v.optional(v.string()),
    cancelAt: v.optional(v.string()),
    canceledAt: v.optional(v.string()),
    trialStart: v.optional(v.string()),
    trialEnd: v.optional(v.string()),
    usageLimits: v.object(usageLimitSchema),
    stripeId: v.string(),
};

/* NEXTAUTH SCHEMA*/
const userSchema = {
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
    billingAddress: v.optional(v.any()),
    paymentMethod: v.optional(v.any()),
    updatedAt: v.optional(v.string()),
    twoFactorEnabled: v.boolean(),
    lastLogin: v.optional(v.string()),
    defaultWorkspace: v.optional(v.id('workspaces')),
    customerId: v.optional(v.id('customers')),
};

const sessionSchema = {
    userId: v.id('users'),
    expires: v.number(),
    sessionToken: v.string(),
};

const accountSchema = {
    userId: v.id('users'),
    type: v.union(v.literal('email'), v.literal('oidc'), v.literal('oauth'), v.literal('webauthn')),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string() as Validator<Lowercase<string>>),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
};

const verificationTokenSchema = {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
};

const authenticatorSchema = {
    credentialID: v.string(),
    userId: v.id('users'),
    providerAccountId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    credentialDeviceType: v.string(),
    credentialBackedUp: v.boolean(),
    transports: v.optional(v.string()),
};

const schema = defineSchema({
    workspaces: defineTable(workspaceSchema),
    users: defineTable(userSchema).index('email', ['email']).index('customerId', ['customerId']),
    sessions: defineTable(sessionSchema).index('sessionToken', ['sessionToken']).index('userId', ['userId']),
    accounts: defineTable(accountSchema).index('providerAndAccountId', ['provider', 'providerAccountId']).index('userId', ['userId']),
    userWorkspaces: defineTable(userWorkspaceSchema),
    credentials: defineTable(credentialsSchema),
    credentialsRequests: defineTable(credentialsRequestSchema).index('workspaceId', ['workspaceId']).index('createdBy', ['createdBy']).index('status', ['status']),
    workspaceInvites: defineTable(workspaceInviteSchema).index('workspaceId', ['workspaceId']).index('invitedUserId', ['invitedUserId']).index('invitedEmail', ['invitedEmail']),
    customers: defineTable(customerSchema).index('stripeCustomerId', ['stripeCustomerId']),
    products: defineTable(productSchema).index('stripeId', ['stripeId']),
    prices: defineTable(priceSchema).index('productId', ['productId']).index('stripeId', ['stripeId']),
    subscriptions: defineTable(subscriptionSchema).index('workspaceId', ['workspaceId']).index('stripeId', ['stripeId']),
    usageTracking: defineTable(usageTrackingSchema).index('userIdAndMonth', ['userId', 'month']).index('workspaceIdAndMonth', ['workspaceId', 'month']),
    authenticators: defineTable(authenticatorSchema).index('userId', ['userId']).index('credentialID', ['credentialID']),
    verificationTokens: defineTable(verificationTokenSchema).index('identifierToken', ['identifier', 'token']),
});

export { accountSchema, authenticatorSchema, sessionSchema, userSchema, verificationTokenSchema, subscriptionSchema };

export default schema;
