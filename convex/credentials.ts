import { query } from './_generated/server';
import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { getViewerId } from './auth';
import { credentialsTypeValidator } from './types';

export const getWorkspaceCredentials = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const credentials = await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();

        return credentials;
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
        const credential = await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('_id'), args._id))
            .first();

        if (!credential) {
            throw new Error('Credential not found');
        }

        const newViewCount = (credential.viewCount || 0) + 1;
        const updates: any = {
            viewCount: newViewCount,
            updatedAt: new Date().toISOString(),
        };

        // Check if maxViews is set and has been exceeded
        if (credential.maxViews && newViewCount > credential.maxViews) {
            updates.expiresAt = new Date().toISOString();
        }

        await ctx.db.patch(credential._id, updates);
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
        try {
            const identity = await getViewerId(ctx);

            if (!identity) {
                return { success: false, message: 'Log in to remove credentials' };
            }

            const credential = await ctx.db.get(args._id);

            if (!credential) {
                return { success: false, message: 'Credential not found' };
            }

            if (credential.createdBy !== identity) {
                return { success: false, message: 'Unauthorized: You are not the owner of this credential' };
            }

            await ctx.db.delete(args._id);

            return { success: true, message: 'Credential removed successfully' };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
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
        try {
            const identity = await getViewerId(ctx);

            if (!identity) {
                return { success: false, message: 'Log in to edit credentials' };
            }

            const credential = await ctx.db.get(args._id);

            if (!credential) {
                return { success: false, message: 'Credential not found' };
            }

            if (credential.createdBy !== identity) {
                return { success: false, message: 'Unauthorized: You are not the owner of this credential' };
            }

            await ctx.db.patch(args._id, {
                ...args.updates,
                updatedAt: new Date().toISOString(),
            });

            return { success: true, message: 'Credential updated successfully' };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const setExpired = mutation({
    args: {
        _id: v.id('credentials'),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) {
                return { success: false, message: 'Log in to edit credentials' };
            }

            const credential = await ctx.db.get(args._id);

            if (!credential) {
                return { success: false, message: 'Credential not found' };
            }

            if (credential.createdBy !== identity) {
                return { success: false, message: 'Unauthorized: You are not the owner of this credential' };
            }

            await ctx.db.patch(args._id, {
                expiresAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return { success: true, message: 'Credential expiration updated successfully' };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const createCredentialRequest = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        type: credentialsTypeValidator,
        description: v.string(),
        fields: v.array(
            v.object({
                name: v.string(),
                description: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Unauthorized');
        }

        const credentialRequestId = await ctx.db.insert('credentialRequests', {
            workspaceId: args.workspaceId,
            createdBy: identity,
            type: args.type,
            description: args.description,
            fields: args.fields,
            status: 'pending',
        });

        return { credentialRequestId };
    },
});

export const getCredentialRequests = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const requests = await ctx.db
            .query('credentialRequests')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();

        return requests;
    },
});

export const fulfillCredentialRequest = mutation({
    args: {
        requestId: v.id('credentialRequests'),
        credentials: v.object({
            name: v.string(),
            description: v.optional(v.string()),
            type: credentialsTypeValidator,
            encryptedData: v.string(),
            privateKey: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Unauthorized');
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new Error('Credential request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Credential request is no longer pending');
        }

        // Create the new credential
        const credentialId = await ctx.db.insert('credentials', {
            workspaceId: request.workspaceId,
            name: args.credentials.name,
            description: args.credentials.description,
            type: args.credentials.type,
            encryptedData: args.credentials.encryptedData,
            privateKey: args.credentials.privateKey,
            updatedAt: new Date().toISOString(),
            viewCount: 0,
            createdBy: identity,
        });

        // Update the request status
        await ctx.db.patch(args.requestId, {
            status: 'fulfilled',
            fulfilledBy: identity,
            fulfilledAt: new Date().toISOString(),
        });

        return { credentialId };
    },
});

export const rejectCredentialRequest = mutation({
    args: { requestId: v.id('credentialRequests') },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Unauthorized');
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new Error('Credential request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Credential request is no longer pending');
        }

        await ctx.db.patch(args.requestId, {
            status: 'rejected',
            fulfilledBy: identity,
            fulfilledAt: new Date().toISOString(),
        });

        return { success: true };
    },
});
