import { Id } from './_generated/dataModel';

export type Space = {
    _id?: Id<'workspaces'>;
    _creationTime?: number;
    spaceOwner: string;
    title: string;
    iconId: string;
    data?: string;
    inTrash?: string;
    logo?: string;
};

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

export type UserRole = {
    _id?: Id<'userRoles'>;
    _creationTime?: number;
    userId: Id<'users'>;
    role: 'admin' | 'manager' | 'member';
};

export type UserSpace = {
    _id?: Id<'userSpaces'>;
    _creationTime?: number;
    userId: Id<'users'>;
    workspaceId: Id<'workspaces'>;
    role: 'admin' | 'manager' | 'member';
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
    customTypeId?: Id<'customCredentialsTypes'>;
    encryptedData: any;
    updatedAt: string;
    expiresAt?: string;
    maxViews?: number;
    viewCount: number;
};

export type CredentialsAccessLog = {
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

export type ActivityNotification = {
    _id?: Id<'activityNotifications'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    userId: Id<'users'>;
    message: string;
    readAt?: string;
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

export type Session = {
    _id?: Id<'sessions'>;
    _creationTime?: number;
    userId: Id<'users'>;
    expires: number;
    sessionToken: string;
};

export type VerificationToken = {
    _id?: Id<'verificationTokens'>;
    _creationTime?: number;
    identifier: string;
    token: string;
    expires: number;
};
