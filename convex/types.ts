import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

/* CREDENTIALS TYPES */
export const credentialsTypes = [
    'password',
    'login_password',
    'api_key',
    'oauth_token',
    'ssh_key',
    'ssl_certificate',
    'env_variable',
    'database_credentials',
    'access_key',
    'encryption_key',
    'jwt_token',
    'two_factor_secret',
    'webhook_secret',
    'smtp_credentials',
    'ftp_credentials',
    'vpn_credentials',
    'dns_credentials',
    'device_key',
    'key_value',
    'custom',
    'other',
] as const;
export type CredentialsType = (typeof credentialsTypes)[number];
export const credentialsTypeValidator = v.union(...credentialsTypes.map(v.literal));

/* USER ROLES TYPES */
export const roleTypes = ['admin', 'manager', 'member'] as const;
export type RoleType = (typeof roleTypes)[number];
export const roleTypeValidator = v.union(...roleTypes.map(v.literal));

/* PLAN TYPES */
export const planTypes = ['FREE', 'TEAM'] as const;
export type PlanType = (typeof planTypes)[number];
export const planTypeValidator = v.union(...planTypes.map(v.literal));

/* APP TYPES */
export type Workspace = {
    _id?: Id<'workspaces'>;
    _creationTime?: number;
    ownerId: Id<'users'>;
    name: string;
    slug: string;
    iconId: string;
    logo?: string;
    inviteCode: string;
    planType: PlanType;
    customer?: Id<'customers'>;
};

export type UserWorkspace = {
    _id?: Id<'userWorkspaces'>;
    _creationTime?: number;
    userId: Id<'users'>;
    workspaceId: Id<'workspaces'>;
    role: RoleType;
};

export type Credentials = {
    _id?: Id<'credentials'>;
    _creationTime?: number;
    workspaceId?: Id<'workspaces'>;
    name: string;
    description?: string;
    createdBy?: Id<'users'>;
    type: CredentialsType;
    encryptedData: string;
    privateKey: string;
    updatedAt: string;
    expiresAt?: string;
    maxViews?: number;
    viewCount: number;
};

export type WorkspaceInvite = {
    _id?: Id<'workspaceInvites'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    invitedBy: Id<'users'>;
    invitedUserId?: Id<'users'>;
    invitedEmail?: string;
    role: RoleType;
    status: 'pending' | 'accepted' | 'rejected';
    expiresAt: string;
    inviteCode?: string;
};

export type UsageLimit = {
    secretsPerMonth: number;
    secretRequestsAndChats: number;
    secretAttachmentSize: number;
    teamSize: number;
};

export type UsageTracking = {
    _id?: Id<'usageTracking'>;
    _creationTime?: number;
    userId: Id<'users'>;
    workspaceId: Id<'workspaces'>;
    month: string; // Format: "YYYY-MM"
    secretsCreated: number;
    secretRequestsAndChats: number;
    largestAttachmentSize: number;
};

/* STRIPE TYPES */

export type Customer = {
    _id?: Id<'customers'>;
    _creationTime?: number;
    stripeCustomerId?: string;
};

export type Product = {
    _id?: Id<'products'>;
    _creationTime?: number;
    active?: boolean;
    name?: string;
    description?: string;
    image?: string;
    metadata?: any;
};

export type Price = {
    _id?: Id<'prices'>;
    _creationTime?: number;
    productId?: Id<'products'>;
    active?: boolean;
    description?: string;
    unitAmount?: number;
    currency?: string;
    type?: 'recurring' | 'one_time';
    interval?: 'year' | 'month' | 'week' | 'day';
    intervalCount?: number;
    trialPeriodDays?: number;
    metadata?: any;
};

export type Subscription = {
    _id?: Id<'subscriptions'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    status?: 'unpaid' | 'past_due' | 'incomplete_expired' | 'incomplete' | 'canceled' | 'active' | 'trialing';
    metadata?: any;
    priceId?: Id<'prices'>;
    quantity?: number;
    cancelAtPeriodEnd?: boolean;
    created: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    endedAt?: string;
    cancelAt?: string;
    canceledAt?: string;
    trialStart?: string;
    trialEnd?: string;
    planType: PlanType;
    usageLimits: UsageLimit;
};

/* NEXTAUTH TYPES */

export type User = {
    _id?: Id<'users'>;
    _creationTime?: number;
    email: string;
    name?: string;
    emailVerified?: number;
    image?: string;
    billingAddress?: any;
    paymentMethod?: any;
    updatedAt?: string;
};

export type Session = {
    _id?: Id<'sessions'>;
    _creationTime?: number;
    userId: Id<'users'>;
    expires: number;
    sessionToken: string;
};

export type Account = {
    _id?: Id<'accounts'>;
    _creationTime?: number;
    userId: Id<'users'>;
    type: 'email' | 'oidc' | 'oauth' | 'webauthn';
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
};

export type VerificationToken = {
    _id?: Id<'verificationTokens'>;
    _creationTime?: number;
    identifier: string;
    token: string;
    expires: number;
};

export type Authenticator = {
    _id?: Id<'authenticators'>;
    _creationTime?: number;
    credentialID: string;
    userId: Id<'users'>;
    providerAccountId: string;
    credentialPublicKey: string;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports?: string;
};
