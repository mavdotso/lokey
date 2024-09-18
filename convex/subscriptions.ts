import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { currencyValidator, planTypeValidator, pricesValidator, pricingTypeValidator } from './schema';

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

export const createSubscription = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        priceId: v.id('prices'),
        status: v.union(v.literal('active'), v.literal('unpaid'), v.literal('past_due'), v.literal('incomplete_expired'), v.literal('incomplete'), v.literal('canceled'), v.literal('trialing')),
        currentPeriodStart: v.string(),
        currentPeriodEnd: v.string(),
        cancelAtPeriodEnd: v.boolean(),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const existingSubscription = await ctx.db
            .query('subscriptions')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        if (existingSubscription) {
            throw new Error('Subscription already exists for this workspace');
        }

        const subscriptionId = await ctx.db.insert('subscriptions', {
            workspaceId: args.workspaceId,
            priceId: args.priceId,
            status: args.status,
            currentPeriodStart: args.currentPeriodStart,
            currentPeriodEnd: args.currentPeriodEnd,
            cancelAtPeriodEnd: args.cancelAtPeriodEnd,
            planType: args.planType,
            created: new Date().toISOString(),
            // TODO: fix this wtf
            usageLimits: {
                secretsPerMonth: 0,
                secretRequestsAndChats: 0,
                secretAttachmentSize: 0,
                customDomain: false,
                teamSize: 1,
                apiAccess: false,
            },
            stripeId: '',
            currency: 'USD',
            interval: 'MONTH',
            planId: '',
            priceStripeId: '',
        });
        return { subscriptionId };
    },
});

export const updateSubscription = mutation({
    args: {
        subscriptionId: v.id('subscriptions'),
        updates: v.object({
            priceId: v.optional(v.id('prices')),
            status: v.optional(
                v.union(v.literal('active'), v.literal('unpaid'), v.literal('past_due'), v.literal('incomplete_expired'), v.literal('incomplete'), v.literal('canceled'), v.literal('trialing'))
            ),
            currentPeriodStart: v.optional(v.string()),
            currentPeriodEnd: v.optional(v.string()),
            cancelAtPeriodEnd: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const subscription = await ctx.db.get(args.subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        await ctx.db.patch(args.subscriptionId, args.updates);

        return { success: true };
    },
});

export const cancelSubscription = mutation({
    args: {
        subscriptionId: v.id('subscriptions'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const subscription = await ctx.db.get(args.subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        await ctx.db.patch(args.subscriptionId, {
            status: 'canceled',
            cancelAtPeriodEnd: true,
        });

        return { success: true };
    },
});

export const getSubscriptionByWorkspaceId = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query('subscriptions')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        return subscription;
    },
});

export const getPriceById = query({
    args: { priceId: v.id('prices') },
    handler: async (ctx, args) => {
        const price = await ctx.db.get(args.priceId);
        if (!price) {
            throw new Error('Price not found');
        }
        return price;
    },
});

export const getAllPrices = query({
    args: {},
    handler: async (ctx) => {
        return ctx.db.query('prices').collect();
    },
});

export const createPrice = mutation({
    args: {
        productId: v.id('products'),
        // TODO: type here or in the schema may be incorrect
        type: pricesValidator,
        unitAmount: v.number(),
        currency: currencyValidator,
        recurring: v.optional(
            v.object({
                interval: v.string(),
                intervalCount: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const priceId = await ctx.db.insert('prices', {
            productId: args.productId,
            type: args.type,
            unitAmount: args.unitAmount,
            currency: args.currency,
        });

        return { priceId };
    },
});
