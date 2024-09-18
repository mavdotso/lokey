import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { currencyValidator, intervalValidator, planTypeValidator, pricingTypeValidator, subscriptionStatusValidator } from './schema';

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
        status: subscriptionStatusValidator,
        currentPeriodStart: v.number(),
        currentPeriodEnd: v.number(),
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
            created: new Date().toISOString(),
            usageLimits: {
                secretsPerMonth: 0,
                secretRequestsAndChats: 0,
                secretAttachmentSize: 0,
                customDomain: false,
                teamSize: 1,
                apiAccess: false,
            },
            quantity: 1,
            stripeId: '',
        });
        return { subscriptionId };
    },
});

export const updateSubscription = mutation({
    args: {
        subscriptionId: v.id('subscriptions'),
        updates: v.object({
            priceId: v.optional(v.id('prices')),
            status: subscriptionStatusValidator,
            currentPeriodStart: v.optional(v.number()),
            currentPeriodEnd: v.optional(v.number()),
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
        type: pricingTypeValidator,
        unitAmount: v.number(),
        currency: currencyValidator,
        recurring: v.object({
            interval: intervalValidator,
            intervalCount: v.number(),
        }),
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
            active: true,
            stripeId: '',
            interval: args.recurring.interval,
        });

        return { priceId };
    },
});
