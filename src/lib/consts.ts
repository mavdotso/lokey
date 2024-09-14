export const MAX_WORKSPACE_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB

/* PLANS AND PRICING */
export const MAX_FREE_WORKSPACES = 2;

export const WORKSPACE_PLAN_LIMITS = {
    FREE: {
        secretsPerMonth: 10,
        secretRequestsAndChats: 10,
        secretAttachmentSize: 5 * 1024 * 1024, // 5 MB
        teamSize: 1,
    },
    TEAM: {
        secretsPerMonth: Infinity,
        secretRequestsAndChats: Infinity,
        secretAttachmentSize: 100 * 1024 * 1024, // 100 MB
        teamSize: 5,
        apiAccess: true,
    },
};
