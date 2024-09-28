import { query, mutation, internalMutation, action } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getViewerId } from './auth';
import { Id } from './_generated/dataModel';
import { credentialsTypeValidator } from './schema';
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

        const updates: {
            viewCount: number;
            updatedAt: string;
            expiresAt?: string;
        } = {
            viewCount: newViewCount,
            updatedAt: new Date().toISOString(),
        };

        if (credentials.maxViews && newViewCount > credentials.maxViews) {
            updates.expiresAt = new Date().toISOString();
        }

        const updatedCredentials = await ctx.runMutation(internal.credentials.patchCredentials, {
            credentialsId: args.credentialsId,
            updates,
        });

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

export const setCredentialsExpired = mutation({
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

export const getCredentialsById = query({
    args: { credentialsId: v.id('credentials') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.credentialsId);
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

export const patchCredentials = internalMutation({
    args: {
        credentialsId: v.id('credentials'),
        updates: v.object({
            workspaceId: v.optional(v.id('workspaces')),
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            createdBy: v.optional(v.id('users')),
            type: v.optional(credentialsTypeValidator),
            encryptedData: v.optional(v.string()),
            privateKey: v.optional(v.string()),
            updatedAt: v.string(),
            expiresAt: v.optional(v.string()),
            maxViews: v.optional(v.number()),
            viewCount: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.credentialsId, args.updates);
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
