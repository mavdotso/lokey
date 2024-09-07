import { query } from './_generated/server';
import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { getViewerId } from './auth';
import { crypto } from '@/lib/utils';
import { credentialsTypeValidator } from './types';

export const getCredential = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('credentials')
            .filter((q) => q.eq(q.field('_id'), args.id))
            .first();
    },
});

export const getUserCredentials = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userSpaces = await ctx.db
            .query('userSpaces')
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

export const createCredentials = mutation({
    args: {
        workspaceId: v.optional(v.id('workspaces')),
        name: v.string(),
        description: v.optional(v.string()),
        type: credentialsTypeValidator,
        subtype: v.optional(v.string()),
        customTypeId: v.optional(v.id('customCredentialsTypes')),
        data: v.string(),
        expiresAt: v.optional(v.string()),
        maxViews: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        const encryptedData = crypto.encrypt(args.data);

        const credentialsId = await ctx.db.insert('credentials', {
            workspaceId: args.workspaceId,
            name: args.name,
            description: args.description,
            type: args.type,
            subtype: args.subtype,
            customTypeId: args.customTypeId,
            encryptedData,
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

export const decryptCredentials = mutation({
    args: { _id: v.id('credentials') },
    handler: async (ctx, args) => {
        const credential = await ctx.db.get(args._id);

        if (!credential) {
            throw new Error('Credential not found');
        }

        const now = new Date();

        const isExpired = (credential.expiresAt && new Date(credential.expiresAt) <= now) || (credential.maxViews && credential.viewCount >= credential.maxViews);

        if (isExpired) {
            return { isExpired: true };
        }

        try {
            const decryptedData = crypto.decrypt(credential.encryptedData);

            // TODO: Separate the functions fom each other
            await incrementCredentialsViewCount(ctx, { id: args._id });

            return { isExpired: false, data: decryptedData };
        } catch (error: any) {
            console.error('Decryption error:', error);
            throw new Error(`Failed to decrypt data: ${error.message}`);
        }
    },
});
