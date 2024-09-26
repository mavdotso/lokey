import { query, mutation, internalQuery, internalMutation, action } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getViewerId } from './auth';
import { Id } from './_generated/dataModel';
import { credentialsRequestStatusValidator, credentialsTypeValidator } from './schema';
import { api, internal } from './_generated/api';

export const newCredentials = action({
    args: {
        workspaceId: v.optional(v.id('workspaces')),
        name: v.string(),
        description: v.optional(v.string()),
        type: credentialsTypeValidator,
        encryptedData: v.string(),
        privateKey: v.string(),
        expiresAt: v.optional(v.string()),
        maxViews: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        const credentialsId: Id<'credentials'> = await ctx.runMutation(internal.credentials.createCredentials, { ...args, createdBy: identity || undefined });

        return credentialsId;
    },
});

export const incrementCredentialsViewCount = action({
    args: { credentialsId: v.id('credentials') },
    handler: async (ctx, args) => {
        const credentials = await ctx.runQuery(api.credentials.getCredentialsById, { credentialsId: args.credentialsId });

        if (!credentials) {
            throw new ConvexError('Credentials not found');
        }

        const newViewCount = (credentials.viewCount || 0) + 1;

        const updates: any = {
            viewCount: newViewCount,
            updatedAt: new Date().toISOString(),
        };

        if (credentials.maxViews && newViewCount > credentials.maxViews) {
            updates.expiresAt = new Date().toISOString();
        }

        const updatedCredentials = await ctx.runMutation(internal.credentials.patchCredentials, { credentialsId: args.credentialsId, updates });

        if (updatedCredentials) {
            return { success: true };
        } else {
            return { success: false };
        }
    },
});

export const retrieveCredentials = query({
    args: {
        _id: v.id('credentials'),
        publicKey: v.string(),
    },
    handler: async (ctx, args) => {
        const credential = await ctx.db.get(args._id);

        if (!credential) {
            throw new ConvexError('Credential not found');
        }

        const now = new Date();

        const isExpired = (credential.expiresAt && new Date(credential.expiresAt) <= now) || (credential.maxViews !== undefined && credential.viewCount >= credential.maxViews);

        if (isExpired) {
            return { isExpired: true };
        }

        return {
            isExpired: false,
            encryptedData: credential.encryptedData,
            privateKey: credential.privateKey,
        };
    },
});

export const removeCredentials = mutation({
    args: { _id: v.id('credentials') },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Log in to remove credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new ConvexError('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new ConvexError('Unauthorized: You are not the owner of this credential');
        }

        await ctx.db.delete(args._id);
        return { success: true };
    },
});

export const editCredentials = mutation({
    args: {
        _id: v.id('credentials'),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            expiresAt: v.optional(v.string()),
            maxViews: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Log in to edit credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new ConvexError('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new ConvexError('Unauthorized: You are not the owner of this credential');
        }

        await ctx.db.patch(args._id, {
            ...args.updates,
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
    },
});

export const setExpired = mutation({
    args: {
        _id: v.id('credentials'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Log in to edit credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new ConvexError('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new ConvexError('Unauthorized: You are not the owner of this credential');
        }

        await ctx.db.patch(args._id, {
            expiresAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
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

        const credentialsRequest: Id<"credentialsRequests"> = await ctx.runMutation(internal.credentials.createCredentialsRequest, {
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
        const request = await ctx.runQuery(api.credentials.getCredentialsRequestById, { credentialsRequestId: args.credentialsRequestId });

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

        await ctx.runMutation(internal.credentials.patchCredentialsRequest, {
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
            throw new ConvexError('Log in to edit credentials');
        }

        const request = await ctx.runQuery(api.credentials.getCredentialsRequestById, { credentialsRequestId: args.credentialsRequestId });

        if (!request || request.status !== 'PENDING') {
            throw new ConvexError('Invalid or already processed request');
        }

        await ctx.runMutation(internal.credentials.patchCredentialsRequest, {
            credentialsRequestId: args.credentialsRequestId,
            updates: { status: 'REJECTED', fulfilledBy: identity, fulfilledAt: new Date().toISOString() },
        });

        return { success: true };
    },
});

export const getCredentialsById = query({
    args: { credentialsId: v.id('credentials') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.credentialsId);
    },
});

export const getCredentialsRequestById = query({
    args: { credentialsRequestId: v.id('credentialsRequests') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.credentialsRequestId);
    },
});

export const getWorkspaceCredentials = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        return ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();
    },
});

export const getCredentialsRequests = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        return ctx.db
            .query('credentialsRequests')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();
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

export const createCredentials = internalMutation({
    args: {
        workspaceId: v.optional(v.id('workspaces')),
        name: v.string(),
        description: v.optional(v.string()),
        type: credentialsTypeValidator,
        encryptedData: v.string(),
        privateKey: v.string(),
        expiresAt: v.optional(v.string()),
        maxViews: v.optional(v.number()),
        createdBy: v.optional(v.id('users')),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('credentials', {
            workspaceId: args.workspaceId,
            name: args.name,
            description: args.description,
            type: args.type,
            encryptedData: args.encryptedData,
            privateKey: args.privateKey,
            updatedAt: new Date().toISOString(),
            expiresAt: args.expiresAt,
            maxViews: args.maxViews,
            viewCount: 0,
            createdBy: args.createdBy,
        });
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

export const patchCredentials = internalMutation({
    args: {
        credentialsId: v.id('credentials'),
        updates: v.object({
            workspaceId: v.id('workspaces'),
            name: v.string(),
            description: v.optional(v.string()),
            createdBy: v.optional(v.id('users')),
            type: credentialsTypeValidator,
            expiresAt: v.optional(v.string()),
            maxViews: v.optional(v.number()),
            viewCount: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.credentialsId, {
            ...args.updates,
            updatedAt: new Date().toISOString(),
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

export const deleteCredentials = internalMutation({
    args: {
        credentialsId: v.id('credentials'),
    },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.credentialsId);
    },
});
