import { query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

export const getSpacesByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const spaces = await ctx.db
            .query('spaces')
            .filter((q) => q.eq(q.field('spaceOwner'), args.userId))
            .collect();

        return spaces.filter(Boolean);
    },
});

export const getFirstUserSpace = query({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const space = await ctx.db
            .query('spaces')
            .filter((q) => q.eq(q.field('spaceOwner'), identity))
            .first();

        return space ? { data: space, error: null } : { data: null, error: 'No space found for user' };
    },
});

export const getCredentialsByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userSpaces = await ctx.db
            .query('userSpaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect();

        const spaceIds = userSpaces.map((space) => space.spaceId);

        const credentials = await ctx.db
            .query('credentials')
            .filter((q) => q.or(...spaceIds.map((id) => q.eq(q.field('spaceId'), id))))
            .collect();

        return credentials.map((cred) => ({
            id: cred._id,
            name: cred.name,
            type: cred.type,
            updatedAt: cred.updatedAt,
        }));
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
