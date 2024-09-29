import { query, mutation, internalQuery, internalMutation, action } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getViewerId } from './auth';
import { Id } from './_generated/dataModel';
import { credentialsRequestStatusValidator, credentialsTypeValidator } from './schema';
import { api, internal } from './_generated/api';

export const getCredentialsRequestById = query({
    args: { credentialsRequestId: v.id('credentialsRequests') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.credentialsRequestId);
    },
});

export const getWorkspaceCredentialsRequests = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        return ctx.db
            .query('credentialsRequests')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();
    },
});

export const createCredentialsRequest = internalMutation({
    args: {
        workspaceId: v.id('workspaces'),
        createdBy: v.id('users'),
        name: v.string(),
        description: v.string(),
        credentials: v.array(
            v.object({
                name: v.string(),
                description: v.optional(v.string()),
                type: credentialsTypeValidator,
                encryptedValue: v.optional(v.string()),
            })
        ),
        encryptedPrivateKey: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('credentialsRequests', {
            workspaceId: args.workspaceId,
            createdBy: args.createdBy,
            name: args.name,
            description: args.description,
            credentials: args.credentials,
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            encryptedPrivateKey: args.encryptedPrivateKey,
        });
    },
});

export const patchCredentialsRequest = internalMutation({
    args: {
        credentialsRequestId: v.id('credentialsRequests'),
        updates: v.object({
            workspaceId: v.optional(v.id('workspaces')),
            createdBy: v.optional(v.id('users')),
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            updatedAt: v.optional(v.string()),
            status: v.optional(credentialsRequestStatusValidator),
            credentials: v.optional(
                v.array(
                    v.object({
                        name: v.string(),
                        description: v.optional(v.string()),
                        type: credentialsTypeValidator,
                        encryptedValue: v.optional(v.string()),
                    })
                )
            ),
            fulfilledBy: v.optional(v.id('users')),
            fulfilledAt: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.credentialsRequestId, {
            ...args.updates,
            updatedAt: new Date().toISOString(),
        });
    },
});

export const newCredentialsRequest = action({
    args: {
        workspaceId: v.id('workspaces'),
        name: v.string(),
        description: v.string(),
        credentials: v.array(
            v.object({
                name: v.string(),
                description: v.optional(v.string()),
                type: credentialsTypeValidator,
            })
        ),
        encryptedPrivateKey: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (!identity) {
            throw new ConvexError('Not authenticated');
        }

        const credentialsRequest: Id<'credentialsRequests'> = await ctx.runMutation(internal.credentialsRequests.createCredentialsRequest, {
            ...args,
            createdBy: identity,
        });

        return { requestId: credentialsRequest };
    },
});

export const fulfillCredentialsRequest = action({
    args: {
        credentialsRequestId: v.id('credentialsRequests'),
        fulfilledCredentials: v.array(
            v.object({
                name: v.string(),
                type: credentialsTypeValidator,
                encryptedValue: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const request = await ctx.runQuery(api.credentialsRequests.getCredentialsRequestById, { credentialsRequestId: args.credentialsRequestId });

        if (!request) {
            throw new ConvexError('Credentials request not found');
        }

        if (request.status !== 'PENDING') {
            throw new ConvexError('Credentials request is not pending');
        }

        const updatedCredentials = request.credentials.map((cred) => {
            const fulfilledCred = args.fulfilledCredentials.find((fc) => fc.name === cred.name);
            return fulfilledCred ? { ...cred, encryptedValue: fulfilledCred.encryptedValue } : cred;
        });

        await ctx.runMutation(internal.credentialsRequests.patchCredentialsRequest, {
            credentialsRequestId: request._id,
            updates: {
                status: 'FULFILLED',
                fulfilledAt: new Date().toISOString(),
                credentials: updatedCredentials,
            },
        });

        return { success: true };
    },
});

export const rejectCredentialsRequest = action({
    args: { credentialsRequestId: v.id('credentialsRequests') },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (!identity) {
            return { success: false, error: 'Log in to edit credentials' };
        }

        const request = await ctx.runQuery(api.credentialsRequests.getCredentialsRequestById, { credentialsRequestId: args.credentialsRequestId });

        if (!request || request.status !== 'PENDING') {
            return { success: false, error: 'Invalid or already processed request' };
        }

        try {
            await ctx.runMutation(internal.credentialsRequests.patchCredentialsRequest, {
                credentialsRequestId: args.credentialsRequestId,
                updates: { status: 'REJECTED', fulfilledBy: identity, fulfilledAt: new Date().toISOString() },
            });

            return { success: true };
        } catch (error) {
            console.error('Error rejecting credentials request:', error);
            return { success: false, error: 'Failed to reject credentials request' };
        }
    },
});
