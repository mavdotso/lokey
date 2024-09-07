import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

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
