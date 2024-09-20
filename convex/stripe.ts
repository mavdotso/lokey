import { v } from 'convex/values';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { Customer, PlanName, Price, Product, Subscription } from './types';
import Stripe from 'stripe';
import { getURL } from '@/lib/utils';
import { currencyValidator, intervalValidator, planTypeValidator, pricingTypeValidator, subscriptionSchema, subscriptionStatusValidator } from './schema';
import { getViewerId } from './auth';
import { api, internal } from './_generated/api';
import { getPlanLimits, WORKSPACE_PLAN_LIMITS } from '@/lib/config/plan-limits';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20',
    typescript: true,
    appInfo: {
        name: 'Lokey',
        version: '0.1.0',
    },
});

export const getProducts = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query('products')
            .filter((q) => q.eq(q.field('active'), true))
            .order('desc')
            .collect();

        return products;
    },
});

export const getPrices = query({
    args: {},
    handler: async (ctx) => {
        const prices = await ctx.db
            .query('prices')
            .filter((q) => q.eq(q.field('active'), true))
            .order('desc')
            .collect();

        // Fetch associated product data for each price
        const pricesWithProducts = await Promise.all(
            prices.map(async (price) => {
                const product = await ctx.db.get(price.productId);
                return { ...price, product };
            })
        );

        return pricesWithProducts;
    },
});

// Get a product from Stripe dashboard
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

// Get price from dashboard
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

export const createOrRetrieveCustomer = action({
    args: {
        email: v.string(),
        userId: v.id('users'),
    },
    handler: async (ctx, args): Promise<string> => {
        console.log('INSIDE createOrRetrieveCustomer');
        try {
            const user = await ctx.runQuery(api.users.getUser, { _id: args.userId });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.customerId) {
                const customer = await ctx.runQuery(api.stripe.getCustomerById, { customerId: user.customerId });
                if (customer && customer.stripeCustomerId) {
                    return customer.stripeCustomerId;
                }
            }

            const stripeCustomerId = await ctx.runAction(api.stripe.createStripeCustomer, {
                email: args.email,
                userId: args.userId,
            });

            if (!stripeCustomerId) {
                throw new Error('Failed to create Stripe customer');
            }

            const customerId = await ctx.runMutation(internal.stripe.insertCustomer, { userId: user._id, stripeCustomerId });

            if (customerId) {
                await ctx.runMutation(api.users.updateUser, {
                    userId: args.userId,
                    updates: { customerId },
                });
            }

            console.log(`New customer created and inserted for ${args.userId}.`);
            return stripeCustomerId;
        } catch (error) {
            console.error('Error in createOrRetrieveCustomer:', error);
            throw new Error('Failed to create or retrieve customer');
        }
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

        const planName = subscription.metadata.planName;

        if (!planName || !(planName in WORKSPACE_PLAN_LIMITS)) {
            throw new Error(`Invalid or missing plan name: ${planName}`);
        }

        const workspace = await ctx.runQuery(internal.stripe.getWorkspaceByStripeSubscriptionId, {
            stripeSubscriptionId: args.subscriptionId,
        });

        if (!workspace || workspace._id !== args.workspaceId) {
            throw new Error('Workspace mismatch or not found');
        }

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
            usageLimits: getPlanLimits(planName as PlanName),
        };

        let subscriptionId: Id<'subscriptions'>;
        const existingSubscription = await ctx.runQuery(internal.stripe.getSubscriptionByStripeId, { stripeId: args.subscriptionId });

        if (existingSubscription) {
            await ctx.runMutation(internal.stripe.updateSubscription, { id: existingSubscription._id, data: subscriptionData });
            subscriptionId = existingSubscription._id;
        } else {
            subscriptionId = await ctx.runMutation(internal.stripe.insertSubscription, { data: subscriptionData });
        }

        // Update the workspace with the new subscription
        await ctx.runMutation(internal.stripe.updateWorkspaceSubscription, {
            workspaceId: args.workspaceId,
            subscriptionId: subscriptionId,
            planType: planName as PlanName,
        });

        console.log(`Inserted/updated subscription [${subscription.id}] for workspace [${args.workspaceId}]`);

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

export const createStripeBillingPortalSession = action({
    args: {
        stripeCustomerId: v.string(),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const { url } = await stripe.billingPortal.sessions.create({
            customer: args.stripeCustomerId,
            return_url: `${getURL()}/dashboard/`,
        });
        return { url };
    },
});

export const prepareBillingPortalSession = action({
    args: { userId: v.id('users') },
    handler: async (ctx, args): Promise<{ stripeCustomerId: string }> => {
        try {
            const user = await ctx.runQuery(api.users.getUser, { _id: args.userId });

            console.log('STEP1: User ', user);

            if (!user) {
                throw new Error('User not found');
            }

            let customer: Customer | null;

            if (!user.customerId) {
                console.log('No customer ID. Creating a new customer...');
                // Create a new customer if the user doesn't have one
                const stripeCustomerId = await ctx.runAction(api.stripe.createStripeCustomer, {
                    email: user.email,
                    userId: args.userId,
                });

                console.log('New customer:', stripeCustomerId);

                if (!stripeCustomerId) {
                    console.log('Failed to create customer');
                    throw new Error('Failed to create customer');
                }

                // Insert the new customer into the Convex database
                customer = await ctx.runMutation(internal.stripe.insertCustomer, {
                    stripeCustomerId: stripeCustomerId,
                    userId: args.userId,
                });

                if (!customer) {
                    throw new Error('Newly created customer not found');
                }

                // Update user with new customerId
                await ctx.runMutation(api.users.updateUser, { userId: args.userId, updates: { customerId: customer } });
            } else {
                customer = await ctx.runQuery(api.stripe.getCustomerById, { customerId: user.customerId });
                if (!customer) {
                    throw new Error('Customer not found');
                }
            }

            if (!customer.stripeCustomerId) {
                throw new Error('Customer has no Stripe ID');
            }

            return { stripeCustomerId: customer.stripeCustomerId };
        } catch (error) {
            console.error('Error in prepareBillingPortalSession:', error);
            throw new Error('Failed to prepare billing portal session');
        }
    },
});

export const createCheckoutSession = action({
    args: {
        userId: v.id('users'),
        priceId: v.string(),
        quantity: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args): Promise<{ sessionId: string }> => {
        const user = await ctx.runQuery(api.users.getUser, { _id: args.userId });

        if (!user) {
            throw new Error('User not found');
        }

        const customerIdOrUndefined = await createOrRetrieveCustomer(ctx, { email: user.email, userId: args.userId });

        if (!customerIdOrUndefined) {
            throw new Error('Failed to create or retrieve customer');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            customer: customerIdOrUndefined,
            line_items: [
                {
                    price: args.priceId,
                    quantity: args.quantity || 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            subscription_data: { metadata: args.metadata },
            success_url: `${getURL()}/dashboard`,
            cancel_url: `${getURL()}/dashboard`,
        });

        return { sessionId: session.id };
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
            usageLimits: getPlanLimits(args.planType),
            quantity: 1,
            stripeId: '',
        });
        return { subscriptionId };
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

export const getWorkspaceIdByCustomerId = internalQuery({
    args: { customerId: v.string() },
    handler: async (ctx, args) => {
        const customer = await ctx.db
            .query('customers')
            .withIndex('stripeCustomerId', (q) => q.eq('stripeCustomerId', args.customerId))
            .unique();

        if (!customer) {
            throw new Error('Customer not found');
        }

        const workspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('customer'), customer._id))
            .collect();

        if (!workspaces) {
            throw new Error('Workspaces not found for customer');
        }

        return workspaces;
    },
});

export const getWorkspaceByStripeSubscriptionId = internalQuery({
    args: { stripeSubscriptionId: v.string() },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query('subscriptions')
            .withIndex('stripeId', (q) => q.eq('stripeId', args.stripeSubscriptionId))
            .unique();

        if (!subscription) return null;

        return await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('currentSubscription'), subscription._id))
            .unique();
    },
});

export const createStripeCustomer = action({
    args: { email: v.string(), userId: v.id('users') },
    handler: async (ctx, args) => {
        const customerData: Stripe.CustomerCreateParams = {
            metadata: {
                userId: args.userId,
            },
            email: args.email,
        };

        const customer = await stripe.customers.create(customerData);
        return customer.id;
    },
});

export const getCustomerById = query({
    args: { customerId: v.id('customers') },
    handler: async (ctx, args): Promise<Customer | null> => {
        return await ctx.db.get(args.customerId);
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

export const getUserByCustomerId = internalQuery({
    args: { customerId: v.id('customers') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('customerId', (q) => q.eq('customerId', args.customerId))
            .unique();
    },
});

export const insertCustomer = internalMutation({
    args: { userId: v.id('users'), stripeCustomerId: v.string() },
    handler: async (ctx, args) => {
        const customerId = await ctx.db.insert('customers', {
            userId: args.userId,
            stripeCustomerId: args.stripeCustomerId,
        });

        await ctx.db.patch(args.userId, {
            customerId: customerId,
        });
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

export const updateWorkspaceSubscription = internalMutation({
    args: {
        workspaceId: v.id('workspaces'),
        subscriptionId: v.id('subscriptions'),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.workspaceId, {
            currentSubscription: args.subscriptionId,
            planType: args.planType,
        });
    },
});

export const insertSubscription = internalMutation({
    args: { data: v.object(subscriptionSchema) },
    handler: async (ctx, { data }) => {
        const id = await ctx.db.insert('subscriptions', data);
        return id;
    },
});
