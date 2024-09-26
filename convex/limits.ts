import { action, DatabaseReader } from './_generated/server';
import { Id } from './_generated/dataModel';
import { PlanType, UsageLimit, Workspace } from './types';
import { getPlanLimits, MAX_FREE_WORKSPACES } from '@/lib/config/plan-limits';
import { api, internal } from './_generated/api';
import { v } from 'convex/values';

// Helper function to get the current subscription and usage limits
async function getCurrentSubscription(db: DatabaseReader, workspaceId: Id<'workspaces'>): Promise<{ planType: PlanType; usageLimits: UsageLimit } | null> {
    const workspace = await db.get(workspaceId);

    if (!workspace) return null;

    const subscription = workspace.currentSubscription ? await db.get(workspace.currentSubscription) : null;

    return {
        planType: workspace.planType,
        usageLimits: subscription?.usageLimits ?? getPlanLimits(workspace.planType),
    };
}

// Helper function to get current month's usage
async function getCurrentMonthUsage(db: DatabaseReader, workspaceId: Id<'workspaces'>) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return await db
        .query('usageTracking')
        .filter((q) => q.eq(q.field('workspaceId'), workspaceId))
        .filter((q) => q.eq(q.field('month'), currentMonth))
        .first();
}

// Check if user can create a new secret
export async function canCreateSecret(db: DatabaseReader, workspaceId: Id<'workspaces'>): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, workspaceId);
    if (!subscription) return false;

    const usage = await getCurrentMonthUsage(db, workspaceId);
    if (!usage) return true; // No usage record means they haven't created any secrets yet

    return usage.secretsCreated < subscription.usageLimits.secretsPerMonth;
}

// Check if user can perform a secret request or secure chat
export async function canPerformSecretRequestOrChat(db: DatabaseReader, workspaceId: Id<'workspaces'>): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, workspaceId);
    if (!subscription) return false;

    const usage = await getCurrentMonthUsage(db, workspaceId);
    if (!usage) return true; // No usage record means they haven't performed any requests yet

    return usage.secretRequestsAndChats < subscription.usageLimits.secretRequestsAndChats;
}

// Check if user can upload an attachment of a given size
export async function canUploadAttachment(db: DatabaseReader, workspaceId: Id<'workspaces'>, attachmentSize: number): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, workspaceId);
    if (!subscription) return false;

    return attachmentSize <= subscription.usageLimits.secretAttachmentSize;
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
export async function hasFeatureAccess(db: DatabaseReader, workspaceId: Id<'workspaces'>, feature: keyof typeof featureAccessLevels): Promise<boolean> {
    const subscription = await getCurrentSubscription(db, workspaceId);
    if (!subscription) return false;

    return planHasAccess(subscription.planType, feature);
}

export const canCreateWorkspace = action({
    args: {
        _id: v.id('users'),
    },
    handler: async (ctx, args) => {
        const userWorkspaces: Workspace[] = await ctx.runQuery(api.workspaces.getUserWorkspaces, { userId: args._id });

        if (userWorkspaces.length >= MAX_FREE_WORKSPACES) {
            const freeWorkspaces = await Promise.all(
                userWorkspaces.map(async (uw): Promise<boolean> => {
                    if (!uw._id) return false;
                    const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: uw._id });
                    return workspace?.planType === 'FREE';
                })
            );
            const freeWorkspaceCount = freeWorkspaces.filter(Boolean).length;
            return freeWorkspaceCount < 2;
        }

        return true;
    },
});
