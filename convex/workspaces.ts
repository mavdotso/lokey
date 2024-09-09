import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { User } from './types';

export const createWorkspace = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const user = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), identity))
            .unique();

        if (!user) {
            throw new Error('User not found');
        }

        const isUnique = await isSlugUnique(ctx, { slug: args.slug });

        if (!isUnique) {
            throw new Error('The slug is not unique');
        }

        const workspaceId = await ctx.db.insert('workspaces', {
            ...args,
            workspaceOwner: identity,
        });

        await ctx.db.insert('userWorkspaces', {
            userId: user._id,
            workspaceId: workspaceId,
            role: 'admin',
        });

        return { workspaceId };
    },
});

export const getUserWorkspaces = query({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const workspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('workspaceOwner'), identity))
            .collect();

        return workspaces.filter(Boolean);
    },
});

export const isSlugUnique = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const existingWorkspace = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('slug'), args.slug))
            .first();
        return existingWorkspace === null;
    },
});

export const getWorkspaceIdBySlug = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('slug'), args.slug))
            .first();
        return workspace;
    },
});

export const getWorkspaceBySlug = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('slug'), args.slug))
            .first();
        return workspace;
    },
});

export const inviteUserToWorkspace = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        userId: v.id('users'),
        role: v.union(v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        try {
            const inviterId = await getViewerId(ctx);

            if (!inviterId) {
                return { success: false, message: 'Log in to invite users' };
            }

            // Check if inviter has permission (admin or manager)
            const inviterWorkspace = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), inviterId))
                .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
                .first();

            if (!inviterWorkspace || !['admin', 'manager'].includes(inviterWorkspace.role)) {
                return { success: false, message: 'Unauthorized: You cannot invite users to this workspace' };
            }

            // Check if the invited user exists
            const invitedUser = await ctx.db
                .query('users')
                .filter((q) => q.eq(q.field('_id'), args.userId))
                .first();

            if (!invitedUser) {
                return { success: false, message: 'Invited user not found' };
            }

            // Check if the invited user is already part of the workspace
            const existingMembership = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), args.userId))
                .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
                .first();

            if (existingMembership) {
                return { success: false, message: 'User is already part of the workspace' };
            }

            // Add the invited user to the workspace
            await ctx.db.insert('userWorkspaces', {
                userId: args.userId,
                workspaceId: args.workspaceId,
                role: args.role,
            });

            return { success: true, message: 'User successfully invited to the workspace' };
        } catch (error: any) {
            return { success: false, message: `An error occurred: ${error.message}` };
        }
    },
});

export const kickUserFromWorkspace = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        try {
            const requesterId = await getViewerId(ctx);

            if (!requesterId) {
                return { success: false, message: 'Log in to manage workspace members' };
            }

            // Check if the requester has admin rights
            const requesterWorkspace = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), requesterId))
                .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
                .first();

            if (!requesterWorkspace || requesterWorkspace.role !== 'admin') {
                return { success: false, message: 'Unauthorized: Only admins can remove users from the workspace' };
            }

            // Check if the user to be kicked is in the workspace
            const userWorkspace = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('userId'), args.userId))
                .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
                .first();

            if (!userWorkspace) {
                return { success: false, message: 'User is not a member of the workspace' };
            }

            // Prevent kicking the workspace owner
            const workspace = await ctx.db.get(args.workspaceId);

            if (!workspace) {
                return { success: false, message: 'Cannot find the workspace' };
            }

            if (workspace.workspaceOwner === args.userId) {
                return { success: false, message: 'Cannot remove the workspace owner' };
            }

            // Remove the user from the workspace
            await ctx.db.delete(userWorkspace._id);

            return { success: true, message: 'User successfully removed from the workspace' };
        } catch (error: any) {
            return { success: false, message: `An error occurred: ${error.message}` };
        }
    },
});

export const editWorkspace = mutation({
    args: {
        _id: v.id('workspaces'),
        updates: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            iconId: v.optional(v.string()),
            logo: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) {
                return { success: false, message: 'Log in to edit workspaces' };
            }

            const workspace = await ctx.db.get(args._id);

            if (!workspace) {
                return { success: false, message: 'Workspace not found' };
            }

            if (workspace.workspaceOwner !== identity) {
                return { success: false, message: 'Unauthorized: You are not the owner of this workspace' };
            }

            await ctx.db.patch(args._id, {
                ...args.updates,
            });

            return { success: true, message: 'Workspace updated successfully' };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const getWorkspaceUsers = query({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        try {
            const workspace = await ctx.db.get(args._id);

            if (!workspace) {
                return { success: false, message: 'Workspace not found' };
            }

            // Get all user roles associated with the workspace
            const associatedUsers = await ctx.db
                .query('userWorkspaces')
                .filter((q) => q.eq(q.field('workspaceId'), args._id))
                .collect();

            if (!associatedUsers || associatedUsers.length === 0) {
                return { success: false, message: 'No users are associated with this workspace' };
            }

            const users = await Promise.all(
                associatedUsers.map(async (associatedUser) => {
                    const user = await ctx.db.get(associatedUser.userId);
                    return user;
                })
            );

            if (!users) {
                return { success: false, message: 'No users found' };
            }

            return { success: true, users: users };
        } catch (error: any) {
            return { success: false, message: `An error occurred: ${error.message}` };
        }
    },
});
