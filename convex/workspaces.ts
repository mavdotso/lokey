import { action, internalMutation, internalQuery, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { planTypeValidator, roleTypeValidator } from './schema';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { WorkspaceInvite } from './types';

export const newWorkspace = action({
    args: {
        userId: v.id('users'),
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });

        if (!user) {
            throw new ConvexError('User not found');
        }

        if (args.planType === 'FREE') {
            const canCreate = await ctx.runAction(api.limits.canCreateWorkspace, { _id: user._id });

            if (!canCreate) {
                throw new ConvexError('You have reached the maximum number of free workspaces');
            }
        }

        const isUnique = await ctx.runQuery(api.workspaces.isSlugUnique, { slug: args.slug });

        if (!isUnique) {
            throw new ConvexError('The slug is not unique');
        }

        const newWorkspace: Id<'workspaces'> = await ctx.runMutation(internal.workspaces.createWorkspace, { ...args, ownerId: args.userId });

        if (!newWorkspace) {
            throw new ConvexError("Couldn't create workspace");
        }

        const newInvite = await ctx.runMutation(internal.workspaceInvites.INTERNAL_createInvite, { workspaceId: newWorkspace, invitedBy: user._id, role: 'MEMBER' });

        if (!newInvite) {
            throw new ConvexError("Couldn't create invite");
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: newWorkspace, updates: { defaultInvite: newInvite } });
        await ctx.runMutation(internal.workspaces.createWorkspaceAdmin, { userId: user._id, workspaceId: newWorkspace });

        return newWorkspace;
    },
});

export const inviteUserToWorkspace = action({
    args: {
        inviterUserId: v.id('users'),
        userId: v.id('users'),
        workspaceId: v.id('workspaces'),
        role: roleTypeValidator,
    },
    handler: async (ctx, args) => {
        const inviterWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.inviterUserId, workspaceId: args.workspaceId });

        if (!inviterWorkspace || inviterWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const invitedUser = await ctx.runQuery(api.users.getUser, { userId: args.userId });

        if (!invitedUser) {
            throw new ConvexError('Invited user not found');
        }

        const existingMembership = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.userId, workspaceId: args.workspaceId });

        if (existingMembership) {
            throw new ConvexError('User is already part of the workspace');
        }

        await ctx.runMutation(internal.workspaceInvites.addUserToWorkspace, {
            _id: args.userId,
            workspaceId: args.workspaceId,
            role: args.role,
        });

        return { success: true, message: 'User successfully invited to the workspace' };
    },
});

export const kickUserFromWorkspace = action({
    args: {
        workspaceId: v.id('workspaces'),
        adminUserId: v.id('users'),
        kickedUserId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.adminUserId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const existingMembership = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.kickedUserId, workspaceId: args.workspaceId });

        if (!existingMembership) {
            throw new ConvexError('User is not a member of the workspace');
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId === args.kickedUserId) {
            throw new ConvexError('Cannot remove the workspace owner');
        }

        await ctx.runMutation(internal.users.removeUserFromWorkspace, { removeUser: args.kickedUserId, workspaceId: args.workspaceId });

        return { success: true, message: 'User successfully removed from the workspace' };
    },
});

export const updateWorkspace = action({
    args: {
        workspaceId: v.id('workspaces'),
        adminId: v.id('users'),
        updates: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            iconId: v.optional(v.string()),
            logo: v.optional(v.string()),
            storageId: v.optional(v.id('_storage')),
        }),
    },
    handler: async (ctx, args) => {
        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.adminId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: args.workspaceId, updates: args.updates });

        return { success: true, message: 'Workspace updated successfully' };
    },
});

export const updateWorkspaceLogo = action({
    args: {
        workspaceId: v.id('workspaces'),
        adminId: v.id('users'),
        storageId: v.id('_storage'),
    },
    handler: async (ctx, args) => {
        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.adminId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        const imageUrl = await ctx.storage.getUrl(args.storageId);

        if (!imageUrl) {
            throw new ConvexError('Failed to get image URL');
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: args.workspaceId, updates: { logo: imageUrl } });

        return { success: true, message: 'Workspace logo updated successfully' };
    },
});

export const removeWorkspace = action({
    args: {
        workspaceId: v.id('workspaces'),
        adminId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.adminId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        await ctx.runMutation(internal.workspaces.deleteWorkspace, { workspaceId: args.workspaceId });

        const workspaceUsers = await ctx.runQuery(api.workspaces.getWorkspaceUsers, { workspaceId: args.workspaceId });

        for (const user of workspaceUsers.users) {
            await ctx.runMutation(internal.users.removeUserFromWorkspace, { removeUser: user._id, workspaceId: args.workspaceId });
        }

        return { success: true, message: 'Workspace deleted successfully' };
    },
});

export const updateWorkspaceInviteCode = action({
    args: {
        workspaceId: v.id('workspaces'),
        adminId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.adminId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            throw new ConvexError('Unauthorized: Only admins can invite users to this workspace');
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        if (workspace.defaultInvite) {
            await ctx.runMutation(internal.workspaceInvites.patchInviteStatus, { inviteId: workspace.defaultInvite, status: 'EXPIRED' });
        }

        const newInvite: Id<'workspaceInvites'> = await ctx.runMutation(internal.workspaceInvites.INTERNAL_createInvite, { workspaceId: args.workspaceId, invitedBy: args.adminId, role: 'MEMBER' });

        if (!newInvite) {
            throw new ConvexError("Couldn't create invite");
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: workspace._id, updates: { defaultInvite: newInvite } });

        const invite = await ctx.runQuery(api.workspaceInvites.getInviteById, { _id: newInvite });

        if (!invite) {
            throw new ConvexError('Invite not found');
        }

        // TODO: Why does this work?
        const workspaceInvite: WorkspaceInvite = invite;

        return {
            success: true,
            message: 'Workspace invite code updated successfully',
            inviteCode: workspaceInvite.inviteCode,
        };
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

export const getWorkspaceName = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.workspaceId);
        return workspace?.name || '';
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

export const getWorkspaceUsers = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.workspaceId);

        if (!workspace) {
            throw new ConvexError('Workspace not found');
        }

        const associatedUsers = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();

        if (!associatedUsers || associatedUsers.length === 0) {
            throw new ConvexError('No users are associated with this workspace');
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

export const getUserWorkspaces = query({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const ownedWorkspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('ownerId'), args.userId))
            .collect();

        const userWorkspaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect();

        const memberWorkspaces = await Promise.all(userWorkspaces.map(async (uw) => await ctx.db.get(uw.workspaceId)));

        const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];
        const uniqueWorkspaces = Array.from(new Set(allWorkspaces.map((w) => w?._id)))
            .map((id) => allWorkspaces.find((w) => w?._id === id))
            .filter((w): w is NonNullable<typeof w> => w !== null && w !== undefined);

        return uniqueWorkspaces;
    },
});

export const createWorkspaceAdmin = internalMutation({
    args: {
        userId: v.id('users'),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('userWorkspaces', {
            userId: args.userId,
            workspaceId: args.workspaceId,
            role: 'ADMIN',
        });
    },
});

export const createWorkspace = internalMutation({
    args: {
        ownerId: v.id('users'),
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('workspaces', {
            ...args,
            ownerId: args.ownerId,
            planType: args.planType,
        });
    },
});

export const getWorkspaceById = internalQuery({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.workspaceId);
        if (!workspace) {
            throw new ConvexError('Workspace not found');
        }
        return workspace;
    },
});

export const getUserWorkspace = internalQuery({
    args: {
        userId: v.id('users'),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .first();
    },
});

export const patchWorkspace = internalMutation({
    args: {
        workspaceId: v.id('workspaces'),
        updates: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            iconId: v.optional(v.string()),
            logo: v.optional(v.string()),
            defaultInvite: v.optional(v.id('workspaceInvites')),
            planType: v.optional(planTypeValidator),
            customer: v.optional(v.id('customers')),
            currentSubscription: v.optional(v.id('subscriptions')),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.workspaceId, args.updates);
    },
});

export const deleteWorkspace = internalMutation({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.workspaceId);
    },
});
