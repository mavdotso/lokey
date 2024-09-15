import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { roleTypeValidator } from './types';

export const getUser = query({
    args: { _id: v.id('users') },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args._id);

        if (!user) {
            return null;
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
        };
    },
});

export const getUserRole = query({
    args: { _id: v.id('users'), workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const userWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args._id))
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

        const roleHierarchy = { admin: 3, manager: 2, member: 1 };
        const hasPermission = roleHierarchy[userWorkspace.role] >= roleHierarchy[args.requiredRole];

        return { hasPermission, userRole: userWorkspace.role };
    },
});

export const editUser = mutation({
    args: {
        updates: v.object({
            name: v.optional(v.string()),
            email: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (!identity) {
            return { success: false, message: 'Log in to edit user profile' };
        }

        const user = await ctx.db.get(identity);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        await ctx.db.patch(identity, {
            ...args.updates,
        });

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
            return { success: false, message: 'User is not authenticated' };
        }

        await ctx.db.patch(identity, {
            image: args.storageId,
        });

        return { success: true, message: 'User avatar updated successfully' };
    },
});

export const deleteUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (!identity) {
            return { success: false, message: 'User is not authenticated' };
        }

        // Delete the user
        await ctx.db.delete(identity);

        // Delete all associated userWorkspaces
        const userWorkspaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), identity))
            .collect();

        for (const userWorkspace of userWorkspaces) {
            await ctx.db.delete(userWorkspace._id);
        }

        return { success: true, message: 'User account deleted successfully' };
    },
});
