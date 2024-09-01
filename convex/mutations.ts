import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { crypto } from '@/lib/utils';

export const createSpace = mutation({
    args: {
        title: v.string(),
        iconId: v.string(),
        data: v.optional(v.string()),
        inTrash: v.optional(v.string()),
        logo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const spaceId = await ctx.db.insert('spaces', {
            ...args,
            spaceOwner: identity,
        });
        return { spaceId };
    },
});

export const assignUserRole = mutation({
    args: {
        userId: v.id('users'),
        role: v.union(v.literal('admin'), v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        // Optional: Check if the current user has permission to assign roles
        // This depends on your application's authorization logic
        // const currentUserRole = await ctx.db.query('userRoles')
        //     .filter(q => q.eq(q.field('userId'), identity.subject))
        //     .unique();
        // if (currentUserRole?.role !== 'admin') {
        //     throw new Error('Not authorized to assign roles');
        // }

        // Check if a role already exists for this user
        const existingRole = await ctx.db
            .query('userRoles')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .unique();

        if (existingRole) {
            // Update existing role
            await ctx.db.patch(existingRole._id, { role: args.role });
        } else {
            // Create new role
            await ctx.db.insert('userRoles', {
                userId: args.userId,
                role: args.role,
            });
        }

        return { success: true };
    },
});

export const createCredential = mutation({
    args: {
        spaceId: v.optional(v.id('spaces')),
        name: v.string(),
        description: v.optional(v.string()),
        type: v.union(
            v.literal('password'),
            v.literal('login_password'),
            v.literal('api_key'),
            v.literal('oauth_token'),
            v.literal('ssh_key'),
            v.literal('ssl_certificate'),
            v.literal('env_variable'),
            v.literal('database_credential'),
            v.literal('access_key'),
            v.literal('encryption_key'),
            v.literal('jwt_token'),
            v.literal('two_factor_secret'),
            v.literal('webhook_secret'),
            v.literal('smtp_credential'),
            v.literal('ftp_credential'),
            v.literal('vpn_credential'),
            v.literal('dns_credential'),
            v.literal('device_key'),
            v.literal('key_value'),
            v.literal('custom'),
            v.literal('other')
        ),
        subtype: v.optional(v.string()),
        customTypeId: v.optional(v.id('customCredentialTypes')),
        data: v.string(),
        expiresAt: v.optional(v.string()),
        maxViews: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const encryptedData = crypto.encrypt(args.data);

        const credentialId = await ctx.db.insert('credentials', {
            spaceId: args.spaceId,
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
        });
        return { credentialId };
    },
});

export const incrementViewCount = mutation({
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

export const decryptPassword = mutation({
    args: { _id: v.id('credentials') },
    handler: async (ctx, args) => {
        const credential = await ctx.db.get(args._id);

        if (!credential) {
            throw new Error('Credential not found');
        }

        console.log(credential);

        const now = new Date();
        const isExpired = (credential.expiresAt && new Date(credential.expiresAt) <= now) || (credential.maxViews && credential.viewCount >= credential.maxViews);

        if (isExpired) {
            return { isExpired: true };
        }

        try {
            const decryptedData = crypto.decrypt(credential.encryptedData);

            // Increment the view count
            const newViewCount = (credential.viewCount || 0) + 1;
            await ctx.db.patch(args._id, {
                viewCount: newViewCount,
                updatedAt: new Date().toISOString(),
            });

            // Check if this view has caused the credential to expire
            if (credential.maxViews && newViewCount >= credential.maxViews) {
                await ctx.db.patch(args._id, {
                    expiresAt: now.toISOString(),
                });
                return { isExpired: true };
            }

            return { isExpired: false, data: decryptedData };
        } catch (error: any) {
            console.error('Decryption error:', error);
            throw new Error(`Failed to decrypt data: ${error.message}`);
        }
    },
});
