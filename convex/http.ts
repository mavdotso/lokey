import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import Stripe from 'stripe';
import { stripe } from './stripe';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';

const http = httpRouter();

const relevantEvents = new Set([
    'product.created',
    'product.updated',
    'price.created',
    'price.updated',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
]);

http.route({
    path: '/.well-known/openid-configuration',
    method: 'GET',
    handler: httpAction(async () => {
        return new Response(
            JSON.stringify({
                issuer: process.env.CONVEX_SITE_URL,
                jwks_uri: process.env.CONVEX_SITE_URL + '/.well-known/jwks.json',
                authorization_endpoint: process.env.CONVEX_SITE_URL + '/oauth/authorize',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=15, stale-while-revalidate=15, stale-if-error=86400',
                },
            }
        );
    }),
});

http.route({
    path: '/.well-known/jwks.json',
    method: 'GET',
    handler: httpAction(async () => {
        if (process.env.JWKS === undefined) {
            throw new Error('Missing JWKS Convex environment variable');
        }
        return new Response(process.env.JWKS, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=15, stale-while-revalidate=15, stale-if-error=86400',
            },
        });
    }),
});

http.route({
    path: '/stripe/webhook',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get('Stripe-Signature');
        if (!signature) throw new Error('Missing Stripe signature');

        const payload = await request.text();
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err) {
            console.error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
            return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`, { status: 400 });
        }

        if (relevantEvents.has(event.type)) {
            try {
                switch (event.type) {
                    case 'product.created':
                    case 'product.updated':
                        await ctx.runMutation(internal.stripe.upsertProductRecord, { product: event.data.object });
                        break;
                    case 'price.created':
                    case 'price.updated':
                        await ctx.runMutation(internal.stripe.upsertPriceRecord, { price: event.data.object });
                        break;
                    case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':
                        const subscription = event.data.object as Stripe.Subscription;
                        const workspaces = await ctx.runQuery(internal.stripe.getWorkspaceIdByCustomerId, { customerId: subscription.customer as string });

                        if (event.type === 'customer.subscription.deleted') {
                            // For deletion, we should only update the workspace that had this specific subscription
                            const workspaceWithSubscription = await ctx.runQuery(internal.stripe.getWorkspaceByStripeSubscriptionId, {
                                stripeSubscriptionId: subscription.id,
                            });

                            if (workspaceWithSubscription) {
                                await ctx.runAction(api.stripe.manageSubscriptionStatusChange, {
                                    subscriptionId: subscription.id,
                                    customerId: subscription.customer as string,
                                    createAction: false,
                                    workspaceId: workspaceWithSubscription._id,
                                });
                            }
                        } else {
                            // For creation and updates, we'll process all workspaces
                            for (const workspace of workspaces) {
                                await ctx.runAction(api.stripe.manageSubscriptionStatusChange, {
                                    subscriptionId: subscription.id,
                                    customerId: subscription.customer as string,
                                    createAction: event.type === 'customer.subscription.created',
                                    workspaceId: workspace._id,
                                });
                            }
                        }
                        break;
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        if (checkoutSession.mode === 'subscription') {
                            const subscriptionId = checkoutSession.subscription as string;
                            const customerId = checkoutSession.customer as string;

                            // Get workspaceId from metadata
                            const workspaceId = checkoutSession.metadata?.workspaceId;

                            if (workspaceId) {
                                await ctx.runAction(api.stripe.manageSubscriptionStatusChange, {
                                    subscriptionId,
                                    customerId,
                                    createAction: true,
                                    workspaceId: workspaceId as Id<'workspaces'>,
                                });
                            } else {
                                console.error('No workspaceId found in checkout session metadata');
                            }
                        }
                        break;
                    default:
                        throw new Error('Unhandled relevant event!');
                }
            } catch (error) {
                console.error(error);
                return new Response('Webhook error: "Webhook handler failed. View logs."', { status: 400 });
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    }),
});

export default http;
