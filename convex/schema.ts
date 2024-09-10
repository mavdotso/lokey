import { defineSchema, defineTable } from 'convex/server';
import { v, Validator } from 'convex/values';
import { credentialsTypeValidator, roleTypeValidator } from './types';

const userRole = roleTypeValidator;
const credentialsType = credentialsTypeValidator;
const pricingType = v.union(v.literal('recurring'), v.literal('one_time'));
const pricingPlanInterval = v.union(v.literal('year'), v.literal('month'), v.literal('week'), v.literal('day'));
const subscriptionStatus = v.union(
    v.literal('unpaid'),
    v.literal('past_due'),
    v.literal('incomplete_expired'),
    v.literal('incomplete'),
    v.literal('canceled'),
    v.literal('active'),
    v.literal('trialing')
);

const workspaceSchema = {
    workspaceOwner: v.id('users'),
    name: v.string(),
    slug: v.string(),
    iconId: v.string(),
    logo: v.optional(v.string()),
};

const userRoleSchema = {
    userId: v.id('users'),
    role: userRole,
};

const userWorkspaceSchema = {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: userRole,
};

const customCredentialsTypeSchema = {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    schema: v.any(),
    updatedAt: v.string(),
};

const credentialsSchema = {
    workspaceId: v.optional(v.id('workspaces')),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.id('users')),
    type: credentialsType,
    subtype: v.optional(v.string()),
    customTypeId: v.optional(v.id('customCredentialsTypes')),
    encryptedData: v.string(),
    privateKey: v.string(),
    updatedAt: v.string(),
    expiresAt: v.optional(v.string()),
    maxViews: v.optional(v.number()),
    viewCount: v.number(),
};

const credentialsAccessLogSchema = {
    credentialsId: v.id('credentials'),
    userId: v.optional(v.id('users')),
    accessedAt: v.string(),
};

const activityNotificationSchema = {
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    message: v.string(),
    readAt: v.optional(v.string()),
};

const workspaceInviteSchema = {
    workspaceId: v.id('workspaces'),
    invitedBy: v.id('users'),
    invitedUserId: v.optional(v.id('users')),
    invitedEmail: v.optional(v.string()),
    role: userRole,
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('rejected')),
    expiresAt: v.string(),
    inviteCode: v.optional(v.string()),
};

/* STRIPE SCHEMA */
const customerSchema = {
    stripeCustomerId: v.optional(v.string()),
};

const productSchema = {
    active: v.optional(v.boolean()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    metadata: v.optional(v.any()),
};

const priceSchema = {
    productId: v.optional(v.id('products')),
    active: v.optional(v.boolean()),
    description: v.optional(v.string()),
    unitAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    type: v.optional(pricingType),
    interval: v.optional(pricingPlanInterval),
    intervalCount: v.optional(v.number()),
    trialPeriodDays: v.optional(v.number()),
    metadata: v.optional(v.any()),
};

const subscriptionSchema = {
    userId: v.id('users'),
    status: v.optional(subscriptionStatus),
    metadata: v.optional(v.any()),
    priceId: v.optional(v.id('prices')),
    quantity: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    created: v.string(),
    currentPeriodStart: v.string(),
    currentPeriodEnd: v.string(),
    endedAt: v.optional(v.string()),
    cancelAt: v.optional(v.string()),
    canceledAt: v.optional(v.string()),
    trialStart: v.optional(v.string()),
    trialEnd: v.optional(v.string()),
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

// Define tables
const schema = defineSchema({
    workspaces: defineTable(workspaceSchema),
    users: defineTable(userSchema).index('email', ['email']),
    userRoles: defineTable(userRoleSchema).index('userId', ['userId']),
    sessions: defineTable(sessionSchema).index('sessionToken', ['sessionToken']).index('userId', ['userId']),
    accounts: defineTable(accountSchema).index('providerAndAccountId', ['provider', 'providerAccountId']).index('userId', ['userId']),
    userWorkspaces: defineTable(userWorkspaceSchema),
    customCredentialsTypes: defineTable(customCredentialsTypeSchema),
    credentials: defineTable(credentialsSchema),
    credentialsAccessLog: defineTable(credentialsAccessLogSchema),
    workspaceInvites: defineTable(workspaceInviteSchema).index('workspaceId', ['workspaceId']).index('invitedUserId', ['invitedUserId']).index('invitedEmail', ['invitedEmail']),
    customers: defineTable(customerSchema),
    products: defineTable(productSchema),
    prices: defineTable(priceSchema),
    subscriptions: defineTable(subscriptionSchema),
    activityNotifications: defineTable(activityNotificationSchema),
    authenticators: defineTable(authenticatorSchema).index('userId', ['userId']).index('credentialID', ['credentialID']),
    verificationTokens: defineTable(verificationTokenSchema).index('identifierToken', ['identifier', 'token']),
});

export { accountSchema, authenticatorSchema, sessionSchema, userSchema, verificationTokenSchema, userRoleSchema };

export default schema;
