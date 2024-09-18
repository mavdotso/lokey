import { Id } from './_generated/dataModel';
import { CREDENTIALS_TYPES, CURRENCIES, INTERVALS, INVITES, PLANS, PRICING, ROLES, SUBSCRIPTION_STATUS } from './schema';

export type CredentialsType = (typeof CREDENTIALS_TYPES)[keyof typeof CREDENTIALS_TYPES];
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
export type PlanType = (typeof PLANS)[keyof typeof PLANS];
export type InviteType = (typeof INVITES)[keyof typeof INVITES];
export type CurrencyType = (typeof CURRENCIES)[keyof typeof CURRENCIES];
export type IntervalType = (typeof INTERVALS)[keyof typeof INTERVALS];
export type PricingType = (typeof PRICING)[keyof typeof PRICING];
export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/* APP TYPES */
export type Workspace = {
    _id?: Id<'workspaces'>;
    _creationTime?: number;
    ownerId: Id<'users'>;
    name: string;
    slug: string;
    iconId: string;
    logo?: string;
    defaultInvite?: Id<'workspaceInvites'>;
    planType: PlanType;
    customer?: Id<'customers'>;
    currentSubscription?: Id<'subscriptions'>;
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

export type CredentialsRequest = {
    _id?: Id<'credentialsRequests'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    createdBy: Id<'users'>;
    name: string;
    description: string;
    credentials: Array<{
        name: string;
        description?: string;
        type: CredentialsType;
        encryptedValue?: string;
    }>;
    status: 'pending' | 'fulfilled' | 'rejected';
    updatedAt: string;
    fulfilledBy?: Id<'users'>;
    fulfilledAt?: string;
    encryptedPrivateKey: string;
};

export type WorkspaceInvite = {
    _id?: Id<'workspaceInvites'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    invitedBy: Id<'users'>;
    invitedUserId?: Id<'users'>;
    invitedEmail?: string;
    role: RoleType;
    status: InviteType;
    expiresAt?: string;
    inviteCode?: string;
};

export type UsageLimit = {
    secretsPerMonth: number;
    secretRequestsAndChats: number;
    secretAttachmentSize: number;
    customDomain: boolean;
    teamSize: number;
    apiAccess: boolean;
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
    stripeCustomerId: string;
};

export type Product = {
    _id?: Id<'products'>;
    _creationTime?: number;
    stripeId: string;
    active: boolean;
    name: string;
    description?: string;
    image?: string;
    metadata?: any;
    prices?: Id<'prices'>[];
};

export type Price = {
    _id?: Id<'prices'>;
    _creationTime?: number;
    stripeId: string;
    productId: Id<'products'>;
    active: boolean;
    description?: string;
    unitAmount: number;
    currency: CurrencyType;
    type: PricingType;
    interval: IntervalType;
    intervalCount?: number;
    trialPeriodDays?: number;
    metadata?: any;
};

export type Subscription = {
    _id?: Id<'subscriptions'>;
    _creationTime?: number;
    workspaceId: Id<'workspaces'>;
    status: SubscriptionStatusType;
    priceId: Id<'prices'>;
    quantity: number;
    cancelAtPeriodEnd: boolean;
    created: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    endedAt?: string;
    cancelAt?: string;
    canceledAt?: string;
    trialStart?: string;
    trialEnd?: string;
    usageLimits: UsageLimit;
    stripeId: string;
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
    twoFactorEnabled: boolean;
    lastLogin?: string;
    defaultWorkspace?: Id<'workspaces'>;
    customerId?: Id<'customers'>;
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
