import { PlanLimits, PlanName } from '@/convex/types';

export const MAX_WORKSPACE_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB

/* PLANS AND PRICING */
export const MAX_FREE_WORKSPACES = 2;

export const WORKSPACE_PLAN_LIMITS = {
    FREE: {
        secretsPerMonth: 10,
        secretRequestsAndChats: 10,
        secretAttachmentSize: 5 * 1024 * 1024, // 5 MB
        customDomain: false,
        teamSize: 1,
        apiAccess: false,
    },
    TEAM: {
        secretsPerMonth: Infinity,
        secretRequestsAndChats: Infinity,
        secretAttachmentSize: 100 * 1024 * 1024, // 100 MB
        customDomain: true,
        teamSize: 5,
        apiAccess: true,
    },
};

export function getPlanLimits(planName: PlanName): PlanLimits {
    return WORKSPACE_PLAN_LIMITS[planName];
}
