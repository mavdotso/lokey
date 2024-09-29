import { action } from './_generated/server';
import { Workspace } from './types';
import { MAX_FREE_WORKSPACES } from '@/lib/config/plan-limits';
import { api, internal } from './_generated/api';
import { v } from 'convex/values';

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
