import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

export const createWorkspace = mutation({
    args: {
        title: v.string(),
        iconId: v.string(),
        data: v.optional(v.string()),
        inTrash: v.optional(v.string()),
        logo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        console.log(identity);

        const user = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), identity))
            .unique();

        if (!user) {
            throw new Error('User not found');
        }

        const workspaceId = await ctx.db.insert('workspaces', {
            ...args,
            workspaceOwner: identity,
        });

        await ctx.db.insert('userSpaces', {
            userId: user._id,
            workspaceId: workspaceId,
            role: 'admin', // Set the space creator as admin
        });

        return { workspaceId };
    },
});

export const getUserWorkspaces = query({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const workspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('workspaceOwner'), identity))
            .collect();

        return workspaces.filter(Boolean);
    },
});
