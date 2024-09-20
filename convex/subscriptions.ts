import { v } from 'convex/values';
import { query } from './_generated/server';

export const getWorkspaceSubscriptionStatus = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query('subscriptions')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        if (!subscription) {
            return null;
        }

        if (subscription.priceId) {
            const price = await ctx.db.get(subscription.priceId);
            return { ...subscription, price };
        }

        return subscription;
    },
});
