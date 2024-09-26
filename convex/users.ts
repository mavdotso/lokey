import { action, internalMutation, mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getViewerId } from './auth';
import { roleTypeValidator } from './schema';
import { api, internal } from './_generated/api';

export const getUser = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            defaultWorkspace: user.defaultWorkspace,
            customerId: user.customerId,
        };
    },
});

export const getUserRole = query({
    args: { userId: v.id('users'), workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const userWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        return userWorkspace ? userWorkspace.role : null;
    },
});

export const checkUserPermission = query({
    args: {
        workspaceId: v.id('workspaces'),
        requiredRole: roleTypeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            return { hasPermission: false, message: 'User is not authenticated' };
        }

        const userWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), identity))
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        if (!userWorkspace) {
            return { hasPermission: false, message: 'User is not a member of this workspace' };
        }

        const roleHierarchy = { ADMIN: 3, MANAGER: 2, MEMBER: 1 };
        const hasPermission = roleHierarchy[userWorkspace.role] >= roleHierarchy[args.requiredRole];

        return { hasPermission, userRole: userWorkspace.role };
    },
});

export const updateUser = mutation({
    args: {
        userId: v.id('users'),
        updates: v.object({
            name: v.optional(v.string()),
            email: v.optional(v.string()),
            defaultWorkspace: v.optional(v.id('workspaces')),
            customerId: v.optional(v.id('customers')),
        }),
    },
    handler: async (ctx, args) => {
        const { userId, updates } = args;

        const user = await ctx.db.get(userId);

        if (!user) {
            throw new ConvexError('User not found');
        }

        if (updates.defaultWorkspace) {
            const userWorkspace = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), userId))
                .filter((q) => q.eq(q.field('workspaceId'), updates.defaultWorkspace))
                .first();

            if (!userWorkspace) {
                throw new ConvexError('User is not a member of the selected default workspace');
            }
        }

        await ctx.db.patch(userId, updates);

        return { success: true, message: 'User profile updated successfully' };
    },
});

export const editUser = mutation({
    args: {
        updates: v.object({
            name: v.optional(v.string()),
            email: v.optional(v.string()),
            defaultWorkspace: v.optional(v.id('workspaces')),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Log in to edit user profile');
        }

        const user = await ctx.db.get(identity);
        if (!user) {
            throw new ConvexError('User not found');
        }

        if (args.updates.defaultWorkspace) {
            const userWorkspace = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), identity))
                .filter((q) => q.eq(q.field('workspaceId'), args.updates.defaultWorkspace))
                .first();

            if (!userWorkspace) {
                throw new ConvexError('User is not a member of the selected default workspace');
            }
        }

        await ctx.db.patch(identity, args.updates);

        return { success: true, message: 'User profile updated successfully' };
    },
});

export const updateUserAvatar = mutation({
    args: {
        storageId: v.id('_storage'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('User is not authenticated');
        }

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) {
            throw new ConvexError('Failed to get image URL');
        }

        await ctx.db.patch(identity, { image: imageUrl });

        return { success: true, message: 'User avatar updated successfully', imageUrl };
    },
});

export const deleteUser = action({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });

        if (!user) {
            throw new ConvexError('User not found');
        }

        const userWorkspaces = await ctx.runQuery(api.workspaces.getUserWorkspaces, { userId: args.userId });

        for (const userWorkspace of userWorkspaces) {
            await ctx.runMutation(internal.users.removeUserFromWorkspace, { removeUser: args.userId, workspaceId: userWorkspace._id });
        }

        await ctx.runMutation(internal.users.deleteUserAccount, { userId: args.userId });

        return { success: true, message: 'User account deleted successfully' };
    },
});

export const deleteUserAccount = internalMutation({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.userId);
    },
});

export const removeUserFromWorkspace = internalMutation({
    args: {
        removeUser: v.id('users'),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const userWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.removeUser))
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        if (userWorkspace) {
            await ctx.db.delete(userWorkspace._id);
        }
    },
});

export const getUserDefaultUserWorkspace = query({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user || !user.defaultWorkspace) {
            return null;
        }

        const workspace = await ctx.db.get(user.defaultWorkspace);
        return workspace || null;
    },
});
