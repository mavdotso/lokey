import { query } from './_generated/server';
import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { getViewerId } from './auth';
import { credentialsTypeValidator } from './types';

export const getCredential = query({
    args: { _id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('_id'), args._id))
            .first();
    },
});

export const getUserCredentials = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userSpaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect();

        const workspaceIds = userSpaces.map((space) => space.workspaceId);

        const credentials = await ctx.db
            .query('credentials')
            .filter((q) => q.or(...workspaceIds.map((id) => q.eq(q.field('workspaceId'), id))))
            .collect();

        return credentials;
    },
});

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
        subtype: v.optional(v.string()),
        customTypeId: v.optional(v.id('customCredentialsTypes')),
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
            subtype: args.subtype,
            customTypeId: args.customTypeId,
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
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const credential = await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('_id'), args.id))
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
    },
});

export const editCredentials = mutation({
    args: {
        _id: v.id('credentials'),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            type: v.optional(credentialsTypeValidator),
            subtype: v.optional(v.string()),
            customTypeId: v.optional(v.id('customCredentialsTypes')),
            encryptedData: v.optional(v.string()),
            privateKey: v.optional(v.string()),
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
    },
});
