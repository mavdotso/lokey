import { query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

export const getSpacesByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const workspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('workspaceOwner'), args.userId))
            .collect();

        return workspaces.filter(Boolean);
    },
});

export const getFirstUserSpace = query({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const workspace = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('workspaceOwner'), identity))
            .first();

        return workspace ? { data: workspace, error: null } : { data: null, error: 'No workspace found for user' };
    },
});

export const getUserSubscriptionStatus = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        try {
            const subscription = await ctx.db
                .query('subscriptions')
                .filter((q) => q.eq(q.field('userId'), args.userId))
                .first();

            if (subscription && subscription.priceId) {
                const price = await ctx.db.get(subscription.priceId);
                return { data: { ...subscription, price }, error: null };
            } else {
                return { data: null, error: null };
            }
        } catch (error) {
            console.log(error);
            return { data: null, error: 'Error' };
        }
    },
});
