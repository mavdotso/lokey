import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';
import { canCreateWorkspace } from './limits';
import { createInvite, setInviteExpired } from './invites';
import { planTypeValidator, roleTypeValidator } from './schema';

export const createWorkspace = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const user = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), identity))
            .unique();
        if (!user) {
            throw new Error('User not found');
        }

        if (args.planType === 'FREE') {
            const canCreate = await canCreateWorkspace(ctx.db, user._id);
            if (!canCreate) {
                throw new Error('You have reached the maximum number of free workspaces');
            }
        }

        const isUnique = await isSlugUnique(ctx, { slug: args.slug });
        if (!isUnique) {
            throw new Error('The slug is not unique');
        }

        const workspaceId = await ctx.db.insert('workspaces', {
            ...args,
            ownerId: identity,
            planType: args.planType,
        });

        const newInvite = await createInvite(ctx, {
            workspaceId,
            role: 'MEMBER',
        });

        if (newInvite.success && newInvite.data) {
            await ctx.db.patch(workspaceId, {
                defaultInvite: newInvite.data.inviteId,
            });
        }

        await ctx.db.insert('userWorkspaces', {
            userId: user._id,
            workspaceId: workspaceId,
            role: 'ADMIN',
        });

        return { workspaceId };
    },
});

export const getUserWorkspaces = query({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const ownedWorkspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('ownerId'), identity))
            .collect();

        const userWorkspaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), identity))
            .collect();

        const memberWorkspaces = await Promise.all(userWorkspaces.map(async (uw) => await ctx.db.get(uw.workspaceId)));

        const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];
        const uniqueWorkspaces = Array.from(new Set(allWorkspaces.map((w) => w?._id)))
            .map((id) => allWorkspaces.find((w) => w?._id === id))
            .filter((w): w is NonNullable<typeof w> => w !== null && w !== undefined);

        return uniqueWorkspaces;
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
        return ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('slug'), args.slug))
            .first();
    },
});

export const getWorkspaceBySlug = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        return ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('slug'), args.slug))
            .first();
    },
});

export const inviteUserToWorkspace = mutation({
    args: {
        _id: v.id('workspaces'),
        userId: v.id('users'),
        role: roleTypeValidator,
    },
    handler: async (ctx, args) => {
        const inviterId = await getViewerId(ctx);
        if (!inviterId) {
            throw new Error('Log in to invite users');
        }

        const inviterWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), inviterId))
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
            .first();

        if (!inviterWorkspace || inviterWorkspace.role !== 'ADMIN') {
            throw new Error('Unauthorized: Only admins can invite users to this workspace');
        }

        const invitedUser = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), args.userId))
            .first();

        if (!invitedUser) {
            throw new Error('Invited user not found');
        }

        const existingMembership = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
            .first();

        if (existingMembership) {
            throw new Error('User is already part of the workspace');
        }

        await ctx.db.insert('userWorkspaces', {
            userId: args.userId,
            workspaceId: args._id,
            role: args.role,
        });

        return { success: true, message: 'User successfully invited to the workspace' };
    },
});

export const kickUserFromWorkspace = mutation({
    args: {
        _id: v.id('workspaces'),
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const requesterId = await getViewerId(ctx);
        if (!requesterId) {
            throw new Error('Log in to manage workspace members');
        }

        const userWorkspace = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
            .first();

        if (!userWorkspace) {
            throw new Error('User is not a member of the workspace');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Cannot find the workspace');
        }

        if (workspace.ownerId === args.userId) {
            throw new Error('Cannot remove the workspace owner');
        }

        await ctx.db.delete(userWorkspace._id);

        return { success: true, message: 'User successfully removed from the workspace' };
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
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Log in to edit workspaces');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        if (workspace.ownerId !== identity) {
            throw new Error('Unauthorized: You are not the owner of this workspace');
        }

        await ctx.db.patch(args._id, args.updates);

        return { success: true, message: 'Workspace updated successfully' };
    },
});

export const getWorkspaceUsers = query({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const associatedUsers = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
            .collect();

        if (!associatedUsers || associatedUsers.length === 0) {
            throw new Error('No users are associated with this workspace');
        }

        const users = await Promise.all(
            associatedUsers.map(async (associatedUser) => {
                return ctx.db.get(associatedUser.userId);
            })
        );

        const validUsers = users.filter((user): user is NonNullable<typeof user> => user !== null);

        return { success: true, users: validUsers };
    },
});

export const getWorkspaceName = query({
    args: { _id: v.id('workspaces') },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args._id);
        return workspace?.name || '';
    },
});

export const updateWorkspaceLogo = mutation({
    args: {
        _id: v.id('workspaces'),
        storageId: v.id('_storage'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        if (workspace.ownerId !== identity) {
            throw new Error('Unauthorized: You are not the owner of this workspace');
        }

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) {
            throw new Error('Failed to get image URL');
        }

        await ctx.db.patch(args._id, { logo: imageUrl });

        return { success: true, message: 'Workspace logo updated successfully' };
    },
});

export const deleteWorkspace = mutation({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        if (workspace.ownerId !== identity) {
            throw new Error('Unauthorized: Only the workspace owner can delete the workspace');
        }

        await ctx.db.delete(args._id);

        const userWorkspaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
            .collect();

        for (const userWorkspace of userWorkspaces) {
            await ctx.db.delete(userWorkspace._id);
        }

        return { success: true, message: 'Workspace deleted successfully' };
    },
});

export const updateWorkspaceInviteCode = mutation({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        if (workspace.ownerId !== identity) {
            throw new Error('Unauthorized: You are not the owner of this workspace');
        }

        if (workspace.defaultInvite) {
            const expireResult = await setInviteExpired(ctx, { _id: workspace.defaultInvite });
            if (!expireResult.success) {
                throw new Error(`Failed to expire previous invite.`);
            }
        }

        const newInvite = await createInvite(ctx, {
            workspaceId: args._id,
            role: 'MEMBER',
        });

        if (!newInvite.success || !newInvite.data) {
            throw new Error('Failed to create new invite');
        }

        await ctx.db.patch(args._id, {
            defaultInvite: newInvite.data.inviteId,
        });

        return {
            success: true,
            message: 'Workspace invite code updated successfully',
            inviteCode: newInvite.data.inviteCode,
        };
    },
});
