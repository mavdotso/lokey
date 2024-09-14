import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

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

export const assignUserRole = mutation({
    args: {
        _id: v.id('users'),
        role: v.union(v.literal('admin'), v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) {
                return { success: false, message: 'User is not authenticated' };
            }

            // Check if the current user has permission to assign roles
            const currentUserRole = await ctx.db
                .query('userRoles')
                .filter((q) => q.eq(q.field('userId'), identity))
                .unique();

            if (!currentUserRole || currentUserRole.role !== 'admin') {
                return { success: false, message: 'Not authorized to assign roles' };
            }

            // Check if a role already exists for this user
            const existingRole = await ctx.db
                .query('userRoles')
                .filter((q) => q.eq(q.field('userId'), args._id))
                .unique();

            if (existingRole) {
                await ctx.db.patch(existingRole._id, { role: args.role });
            } else {
                await ctx.db.insert('userRoles', {
                    userId: args._id,
                    role: args.role,
                });
            }

            return { success: true, message: 'User role assigned successfully' };
        } catch (error: any) {
            return { success: false, message: `An error occurred: ${error.message}` };
        }
    },
});

export const getUserRole = query({
    args: { _id: v.id('users'), workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args._id))
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();

        if (!user) {
            return null;
        }

        return user.role;
    },
});
