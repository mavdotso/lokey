import { v } from 'convex/values';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { Price, Product, Subscription } from './types';
import { internal } from './_generated/api';
import { subscriptionSchema } from './schema';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20',
    typescript: true,
    appInfo: {
        name: 'Lokey',
        version: '0.1.0',
    },
});

export const upsertProductRecord = internalMutation({
    args: { product: v.any() },
    handler: async (ctx, args) => {
        const product = args.product as Stripe.Product;

        const productData: Product = {
            active: product.active,
            name: product.name,
            description: product.description ?? undefined,
            image: product.images?.[0] ?? undefined,
            metadata: product.metadata,
            stripeId: product.id,
        };

        const existingProduct = await ctx.db
            .query('products')
            .withIndex('stripeId', (q) => q.eq('stripeId', product.id))
            .unique();

        if (existingProduct) {
            await ctx.db.patch(existingProduct._id, productData);
        } else {
            await ctx.db.insert('products', productData);
        }

        console.log('Product inserted/updated:', product.id);
    },
});

export const upsertPriceRecord = internalMutation({
    args: { price: v.any() },
    handler: async (ctx, args) => {
        const price = args.price as Stripe.Price;

        const product = await ctx.db
            .query('products')
            .withIndex('stripeId', (q) => q.eq('stripeId', price.product as string))
            .unique();

        if (!product) {
            throw new Error(`Product not found for price ${price.id}`);
        }

        const priceData: Price = {
            stripeId: price.id,
            productId: product._id,
            active: price.active,
            currency: price.currency as any,
            description: price.nickname ?? undefined,
            type: price.type,
            unitAmount: price.unit_amount ?? 0,
            interval: (price.recurring?.interval as any) ?? undefined,
            intervalCount: price.recurring?.interval_count ?? undefined,
            trialPeriodDays: price.recurring?.trial_period_days ?? undefined,
            metadata: price.metadata,
        };

        const existingPrice = await ctx.db
            .query('prices')
            .withIndex('stripeId', (q) => q.eq('stripeId', price.id))
            .unique();

        let priceId: Id<'prices'>;

        if (existingPrice) {
            await ctx.db.patch(existingPrice._id, priceData);
            priceId = existingPrice._id;
        } else {
            priceId = await ctx.db.insert('prices', priceData);
        }

        // Update the product's prices array
        await ctx.db.patch(product._id, {
            prices: [...(product.prices || []), priceId],
        } as any);

        console.log(`Price inserted/updated: ${price.id}`);
    },
});

export const createOrRetrieveCustomer = mutation({
    args: { email: v.string(), userId: v.id('users') },
    handler: async (ctx, args) => {
        const { email, userId } = args;

        const existingCustomer = await ctx.db
            .query('customers')
            .withIndex('stripeCustomerId', (q) => q.eq('stripeCustomerId', userId))
            .unique();

        if (existingCustomer) {
            return existingCustomer.stripeCustomerId;
        }

        const customerData: Stripe.CustomerCreateParams = {
            metadata: {
                userId: userId,
            },
            email,
        };

        const customer = await stripe.customers.create(customerData);

        await ctx.db.insert('customers', {
            stripeCustomerId: customer.id,
        });

        console.log(`New customer created and inserted for ${userId}.`);
        return customer.id;
    },
});

export const copyBillingDetailsToCustomer = internalMutation({
    args: { userId: v.id('users'), paymentMethod: v.any() },
    handler: async (ctx, args) => {
        const { userId, paymentMethod } = args;
        const { name, phone, address } = paymentMethod.billing_details;

        if (!name || !phone || !address) return;

        await stripe.customers.update(paymentMethod.customer as string, { name, phone, address });

        await ctx.db.patch(userId, {
            billingAddress: address,
            paymentMethod: paymentMethod[paymentMethod.type],
        });
    },
});

export const manageSubscriptionStatusChange = action({
    args: {
        subscriptionId: v.string(),
        customerId: v.string(),
        createAction: v.optional(v.boolean()),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const customerData = await ctx.runQuery(internal.stripe.getCustomerByStripeId, { stripeCustomerId: args.customerId });

        if (!customerData) throw new Error('Cannot find the customer');

        const subscription = await stripe.subscriptions.retrieve(args.subscriptionId, {
            expand: ['default_payment_method'],
        });

        const price = await ctx.runQuery(internal.stripe.getPriceByStripeId, {
            stripeId: subscription.items.data[0].price.id,
        });

        if (!price) throw new Error('Price not found');

        const subscriptionData: Subscription = {
            workspaceId: args.workspaceId,
            status: subscription.status as any,
            priceId: price._id,
            quantity: subscription.items.data[0].quantity ?? 1,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : undefined,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : undefined,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            created: new Date(subscription.created * 1000).toISOString(),
            endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : undefined,
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : undefined,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
            stripeId: subscription.id,
            usageLimits: {
                secretsPerMonth: 0,
                secretRequestsAndChats: 0,
                secretAttachmentSize: 0,
                customDomain: false,
                teamSize: 0,
                apiAccess: false,
            },
        };

        const existingSubscription = await ctx.runQuery(internal.stripe.getSubscriptionByStripeId, { stripeId: args.subscriptionId });

        if (existingSubscription) {
            await ctx.runMutation(internal.stripe.updateSubscription, { id: existingSubscription._id, data: subscriptionData });
        } else {
            await ctx.runMutation(internal.stripe.insertSubscription, { data: subscriptionData });
        }

        console.log(`Inserted/updated subscription [${subscription.id}] for customer [${args.customerId}]`);

        if (args.createAction && subscription.default_payment_method && customerData) {
            const user = await ctx.runQuery(internal.stripe.getUserByCustomerId, { customerId: customerData._id });
            if (user) {
                await ctx.runMutation(internal.stripe.copyBillingDetailsToCustomer, {
                    userId: user._id,
                    paymentMethod: subscription.default_payment_method as Stripe.PaymentMethod,
                });
            }
        }
    },
});

export const getCustomerByStripeId = internalQuery({
    args: { stripeCustomerId: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query('customers')
            .withIndex('stripeCustomerId', (q) => q.eq('stripeCustomerId', args.stripeCustomerId))
            .unique();
    },
});

export const getPriceByStripeId = internalQuery({
    args: { stripeId: v.string() },
    handler: async (ctx, { stripeId }) => {
        return ctx.db
            .query('prices')
            .withIndex('stripeId', (q) => q.eq('stripeId', stripeId))
            .unique();
    },
});

export const getSubscriptionByStripeId = internalQuery({
    args: { stripeId: v.string() },
    handler: async (ctx, { stripeId }) => {
        return ctx.db
            .query('subscriptions')
            .withIndex('stripeId', (q) => q.eq('stripeId', stripeId))
            .unique();
    },
});

export const updateSubscription = internalMutation({
    args: { id: v.id('subscriptions'), data: v.object(subscriptionSchema) },
    handler: async (ctx, { id, data }) => {
        await ctx.db.patch(id, data);
    },
});

export const insertSubscription = internalMutation({
    args: { data: v.object(subscriptionSchema) },
    handler: async (ctx, { data }) => {
        await ctx.db.insert('subscriptions', data);
    },
});

export const getUserByCustomerId = internalQuery({
    args: { customerId: v.id('customers') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('customerId', (q) => q.eq('customerId', args.customerId))
            .unique();
    },
});
