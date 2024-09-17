import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { credentialsTypeValidator } from './types';
import { Id } from './_generated/dataModel';

export const getCredentialsById = query({
    args: { credentialsId: v.id('credentials') },
    handler: async (ctx, args) => {
        const credentials = await ctx.db.get(args.credentialsId);
        if (!credentials) {
            throw new Error('Credentials not found');
        }
        return credentials;
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

export const createCredentials = mutation({
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
        const credentialsId = await ctx.db.insert('credentials', {
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
            createdBy: identity || undefined,
        });
        return { credentialsId };
    },
});

export const incrementCredentialsViewCount = mutation({
    args: { _id: v.id('credentials') },
    handler: async (ctx, args) => {
        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new Error('Credential not found');
        }

        const newViewCount = (credential.viewCount || 0) + 1;
        const updates: any = {
            viewCount: newViewCount,
            updatedAt: new Date().toISOString(),
        };

        if (credential.maxViews && newViewCount > credential.maxViews) {
            updates.expiresAt = new Date().toISOString();
        }

        await ctx.db.patch(args._id, updates);
        return { success: true };
    },
});

export type RetrieveCredentialsResult = { isExpired: true } | { isExpired: false; encryptedData: string; privateKey: string };

export const retrieveCredentials = query({
    args: {
        _id: v.id('credentials'),
        publicKey: v.string(),
    },
    handler: async (ctx, args): Promise<RetrieveCredentialsResult> => {
        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new Error('Credential not found');
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
            throw new Error('Log in to remove credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new Error('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new Error('Unauthorized: You are not the owner of this credential');
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
            throw new Error('Log in to edit credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new Error('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new Error('Unauthorized: You are not the owner of this credential');
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
            throw new Error('Log in to edit credentials');
        }

        const credential = await ctx.db.get(args._id);
        if (!credential) {
            throw new Error('Credential not found');
        }

        if (credential.createdBy !== identity) {
            throw new Error('Unauthorized: You are not the owner of this credential');
        }

        await ctx.db.patch(args._id, {
            expiresAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
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

export const createCredentialsRequest = mutation({
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
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) {
            throw new Error('Not authenticated');
        }

        const { workspaceId, description, credentials, encryptedPrivateKey } = args;

        const credentialsRequest = await ctx.db.insert('credentialsRequests', {
            workspaceId,
            createdBy: userId.subject as Id<'users'>,
            name: args.name,
            description,
            credentials,
            status: 'pending',
            updatedAt: new Date().toISOString(),
            encryptedPrivateKey,
        });

        return { requestId: credentialsRequest };
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

export const getCredentialsRequestById = query({
    args: { _id: v.id('credentialsRequests') },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args._id);
        if (!request) {
            throw new Error('Credential request not found');
        }
        return request;
    },
});

export const fulfillCredentialsRequest = mutation({
    args: {
        requestId: v.id('credentialsRequests'),
        fulfilledCredentials: v.array(
            v.object({
                name: v.string(),
                type: credentialsTypeValidator,
                encryptedValue: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { requestId, fulfilledCredentials } = args;

        const request = await ctx.db.get(requestId);
        if (!request) {
            throw new Error('Credentials request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Credentials request is not pending');
        }

        const updatedCredentials = request.credentials.map((cred) => {
            const fulfilledCred = fulfilledCredentials.find((fc) => fc.name === cred.name);
            return fulfilledCred ? { ...cred, encryptedValue: fulfilledCred.encryptedValue } : cred;
        });

        await ctx.db.patch(requestId, {
            status: 'fulfilled',
            fulfilledAt: new Date().toISOString(),
            credentials: updatedCredentials,
        });

        return { success: true };
    },
});

export const rejectCredentialsRequest = mutation({
    args: { requestId: v.id('credentialsRequests') },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Log in to edit credentials');
        }

        const request = await ctx.db.get(args.requestId);
        if (!request || request.status !== 'pending') {
            throw new Error('Invalid or already processed request');
        }

        await ctx.db.patch(args.requestId, {
            status: 'rejected',
            fulfilledBy: identity,
            fulfilledAt: new Date().toISOString(),
        });

        return { success: true };
    },
});
