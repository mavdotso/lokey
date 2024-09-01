import { Id } from './_generated/dataModel';

export type Space = {
    _id?: Id<'spaces'>;
    _creationTime?: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    spaceOwner: string;
    iconId?: string;
    data?: string;
    inTrash?: boolean;
    logo?: string;
};

export type User = {
    _id?: Id<'users'>;
    _creationTime?: number;
    fullName?: string;
    avatarUrl?: string;
    billingAddress?: Record<string, any>;
    updatedAt?: string;
    paymentMethod?: Record<string, any>;
    email?: string;
    role: 'admin' | 'manager' | 'member';
};

export type UserSpace = {
    _id?: Id<'userSpaces'>;
    _creationTime?: number;
    userId: Id<'users'>;
    spaceId: Id<'spaces'>;
    role: 'admin' | 'manager' | 'member';
};

export type CustomCredentialType = {
    _id?: Id<'customCredentialTypes'>;
    _creationTime?: number;
    spaceId: Id<'spaces'>;
    name: string;
    description?: string;
    schema: any;
    createdAt: string;
    updatedAt: string;
};

export type Credential = {
    _id?: Id<'credentials'>;
    _creationTime?: number;
    spaceId: Id<'spaces'>;
    name: string;
    description?: string;
    type:
        | 'password'
        | 'login_password'
        | 'api_key'
        | 'oauth_token'
        | 'ssh_key'
        | 'ssl_certificate'
        | 'env_variable'
        | 'database_credential'
        | 'access_key'
        | 'encryption_key'
        | 'jwt_token'
        | 'two_factor_secret'
        | 'webhook_secret'
        | 'smtp_credential'
        | 'ftp_credential'
        | 'vpn_credential'
        | 'dns_credential'
        | 'device_key'
        | 'key_value'
        | 'custom'
        | 'other';
    subtype?: string;
    customTypeId?: Id<'customCredentialTypes'>;
    encryptedData: any;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    maxViews?: number;
    viewCount: number;
};

export type CredentialAccessLog = {
    _id?: Id<'credentialAccessLogs'>;
    _creationTime?: number;
    credentialId: Id<'credentials'>;
    userId?: Id<'users'>;
    accessedAt: string;
};

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
    metadata?: Record<string, any>;
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
    metadata?: Record<string, any>;
};

export type Subscription = {
    _id?: Id<'subscriptions'>;
    _creationTime?: number;
    userId: Id<'users'>;
    status?: 'unpaid' | 'past_due' | 'incomplete_expired' | 'incomplete' | 'canceled' | 'active' | 'trialing';
    metadata?: Record<string, any>;
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

export type ActivityNotification = {
    _id?: Id<'activityNotifications'>;
    _creationTime?: number;
    spaceId: Id<'spaces'>;
    userId: Id<'users'>;
    message: string;
    createdAt: string;
    readAt?: string;
};
