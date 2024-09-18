import { httpRouter } from 'convex/server';
import { ActionCtx, httpAction } from './_generated/server';
import Stripe from 'stripe';
import { stripe } from './stripe';
import { Doc } from './_generated/dataModel';
import { CurrencyType, IntervalType } from './types';
import { api, internal } from './_generated/api';
import { z } from 'zod';
import { PLANS } from './schema';

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
                        const workspaceId = await ctx.runQuery(internal.stripe.getWorkspaceIdByCustomerId, { customerId: subscription.customer as string });
                        await ctx.runAction(api.stripe.manageSubscriptionStatusChange, {
                            subscriptionId: subscription.id,
                            customerId: subscription.customer as string,
                            createAction: event.type === 'customer.subscription.created',
                            workspaceId,
                        });
                        break;
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        if (checkoutSession.mode === 'subscription') {
                            const subscriptionId = checkoutSession.subscription as string;
                            const customerId = checkoutSession.customer as string;
                            const workspaceId = await ctx.runQuery(internal.stripe.getWorkspaceIdByCustomerId, { customerId });
                            await ctx.runAction(api.stripe.manageSubscriptionStatusChange, {
                                subscriptionId,
                                customerId,
                                createAction: true,
                                workspaceId,
                            });
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
