import { query } from './_generated/server';
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
