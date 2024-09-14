import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

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

export const roleTypes = ['admin', 'manager', 'member'] as const;
export type RoleType = (typeof roleTypes)[number];
export const roleTypeValidator = v.union(...roleTypes.map(v.literal));

export type Workspace = {
    _id?: Id<'workspaces'>;
    _creationTime?: number;
    workspaceOwner: Id<'users'>;
    name: string;
    slug: string;
    iconId: string;
    logo?: string;
    inviteCode: string;
};

export type UserRole = {
    _id?: Id<'userRoles'>;
    _creationTime?: number;
    userId: Id<'users'>;
    role: RoleType;
};

export type UserWorkspace = {
    _id?: Id<'userWorkspaces'>;
    _creationTime?: number;
    userId: Id<'users'>;
    workspaceId: Id<'workspaces'>;
    role: RoleType;
};

export type CustomCredentialsType = {
    _id?: Id<'customCredentialsTypes'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    name: string;
    description?: string;
    schema: any;
    updatedAt: string;
};

export type Credentials = {
    _id?: Id<'credentials'>;
    _creationTime?: number;
    workspaceId?: Id<'workspaces'>;
    name: string;
    description?: string;
    createdBy?: Id<'users'>;
    type: CredentialsType;
    subtype?: string;
    customTypeId?: Id<'customCredentialsTypes'>;
    encryptedData: string;
    privateKey: string;
    updatedAt: string;
    expiresAt?: string;
    maxViews?: number;
    viewCount: number;
};

export type CredentialsAccessLog = {
    _id?: Id<'credentialsAccessLog'>;
    _creationTime?: number;
    credentialsId: Id<'credentials'>;
    userId?: Id<'users'>;
    accessedAt: string;
};

export type ActivityNotification = {
    _id?: Id<'activityNotifications'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    userId: Id<'users'>;
    message: string;
    readAt?: string;
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
    userId: Id<'users'>;
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
