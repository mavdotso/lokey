import { DatabaseReader } from './_generated/server';
import { Id } from './_generated/dataModel';
import { PlanType, UsageLimit } from './types';

// Helper function to get the current subscription and usage limits
async function getCurrentSubscription(db: DatabaseReader, userId: Id<'users'>): Promise<{ planType: PlanType; usageLimits: UsageLimit } | null> {
    const subscription = await db
        .query('subscriptions')
        .filter((q) => q.eq(q.field('userId'), userId))
        .order('desc')
        .first();

    if (!subscription) return null;

    return {
        planType: subscription.planType,
        usageLimits: subscription.usageLimits,
    };
}

// Helper function to get current month's usage
async function getCurrentMonthUsage(db: DatabaseReader, userId: Id<'users'>, workspaceId: Id<'workspaces'>) {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    return await db
        .query('usageTracking')
        .filter((q) => q.eq(q.field('userId'), userId))
        .filter((q) => q.eq(q.field('workspaceId'), workspaceId))
        .filter((q) => q.eq(q.field('month'), currentMonth))
        .first();
}

// Check if user can create a new secret
export async function canCreateSecret(db: DatabaseReader, userId: Id<'users'>, workspaceId: Id<'workspaces'>): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, userId);
    if (!subscription) return false;

    const usage = await getCurrentMonthUsage(db, userId, workspaceId);
    if (!usage) return true; // No usage record means they haven't created any secrets yet

    return usage.secretsCreated < subscription.usageLimits.secretsPerMonth;
}

// Check if user can perform a secret request or secure chat
export async function canPerformSecretRequestOrChat(db: DatabaseReader, userId: Id<'users'>, workspaceId: Id<'workspaces'>): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, userId);
    if (!subscription) return false;

    const usage = await getCurrentMonthUsage(db, userId, workspaceId);
    if (!usage) return true; // No usage record means they haven't performed any requests yet

    return usage.secretRequestsAndChats < subscription.usageLimits.secretRequestsAndChats;
}

// Check if user can upload an attachment of a given size
export async function canUploadAttachment(db: DatabaseReader, userId: Id<'users'>, attachmentSize: number): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, userId);
    if (!subscription) return false;

    return attachmentSize <= subscription.usageLimits.secretAttachmentSize;
}

// Check if user can add a new team member
export async function canAddTeamMember(db: DatabaseReader, userId: Id<'users'>, workspaceId: Id<'workspaces'>): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, userId);
    if (!subscription) return false;

    const teamMembers = await db
        .query('userWorkspaces')
        .filter((q) => q.eq(q.field('workspaceId'), workspaceId))
        .collect();

    return teamMembers.length < subscription.usageLimits.teamSize;
}

// Define feature access levels
const featureAccessLevels: Record<string, PlanType[]> = {
    customDomain: ['TEAM'],
    sso: ['TEAM'],
    whiteLabeling: ['TEAM'],
    advancedAuditLogs: ['TEAM'],
    geoBlocking: ['TEAM'],
};

// Helper function to check if a plan has access to a feature
function planHasAccess(planType: PlanType, feature: keyof typeof featureAccessLevels): boolean {
    return featureAccessLevels[feature].includes(planType);
}

// Check if user has access to a specific feature
export async function hasFeatureAccess(db: DatabaseReader, userId: Id<'users'>, feature: keyof typeof featureAccessLevels): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, userId);
    if (!subscription) return false;

    return planHasAccess(subscription.planType, feature);
}
