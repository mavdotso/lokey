import { query } from './_generated/server';
import { v } from 'convex/values';

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
            return { data: null, error: 'Error' };
        }
    },
});
