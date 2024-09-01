import { query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

export const getSpacesByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userSpaces = await ctx.db
            .query('userSpaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect();

        const spaces = await Promise.all(userSpaces.map(async (userSpace) => await ctx.db.get(userSpace.spaceId)));

        return spaces.filter(Boolean);
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

export const getCredential = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('_id'), args.id))
            .first();
    },
});
