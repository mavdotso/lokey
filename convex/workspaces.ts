import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getViewerId } from './auth';
import { createInvite } from './invites';
import { planTypeValidator, roleTypeValidator } from './schema';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';

export const createWorkspace = action({
    args: {
        userId: v.id('users'),
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getUser, { _id: args.userId });

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

        const newWorkspace: Id<'workspaces'> = await ctx.runMutation(internal.workspaces.INTERNAL_createWorkspace, { ...args, ownerId: args.userId });

        if (!newWorkspace) {
            throw new ConvexError("Couldn't create workspace");
        }

        const newInvite = await ctx.runMutation(internal.invites.INTERNAL_createInvite, { workspaceId: newWorkspace, invitedBy: user._id, role: 'MEMBER' });

        if (!newWorkspace) {
            throw new ConvexError("Couldn't create invite");
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { _id: newWorkspace, updates: { defaultInvite: newInvite } });
        await ctx.runMutation(internal.workspaces.createWorkspaceAdmin, { userId: user._id, workspaceId: newWorkspace });

        return newWorkspace;
    },
});

export const getUserWorkspaces = query({
    args: {
        _id: v.id('users'),
    },
    handler: async (ctx, args) => {
        const ownedWorkspaces = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('ownerId'), args._id))
            .collect();

        const userWorkspaces = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), args._id))
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

        const invitedUser = await ctx.runQuery(api.users.getUser, { _id: args.userId });

        if (!invitedUser) {
            throw new ConvexError('Invited user not found');
        }

        const existingMembership = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.userId, workspaceId: args.workspaceId });

        if (existingMembership) {
            throw new ConvexError('User is already part of the workspace');
        }

        await ctx.runMutation(internal.invites.addUserToWorkspace, {
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

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { _id: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId === args.kickedUserId) {
            throw new ConvexError('Cannot remove the workspace owner');
        }

        // TODO: check if this is right
        await ctx.runMutation(internal.workspaces.removeUserFromWorkspace, { removedUser: args.kickedUserId });

        return { success: true, message: 'User successfully removed from the workspace' };
    },
});

export const editWorkspace = action({
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

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { _id: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        await ctx.runMutation(internal.workspaces.patchWorkspace, { _id: args.workspaceId, updates: args.updates });

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
            throw new ConvexError('Workspace not found');
        }

        const associatedUsers = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('workspaceId'), args._id))
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

export const getWorkspaceName = query({
    args: { _id: v.id('workspaces') },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args._id);
        return workspace?.name || '';
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

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { _id: args.workspaceId });

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

        await ctx.runMutation(internal.workspaces.patchWorkspace, { _id: args.workspaceId, updates: { logo: imageUrl } });

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

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { _id: args.workspaceId });

        if (!workspace) {
            throw new ConvexError('Cannot find the workspace');
        }

        if (workspace.ownerId !== args.adminId) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        await ctx.runMutation(internal.workspaces.deleteWorkspace, { _id: args.workspaceId });

        const workspaceUsers = await ctx.runQuery(api.workspaces.getWorkspaceUsers, { _id: args.workspaceId });

        // TODO: check if this is right
        for (const userWorkspace of workspaceUsers.users) {
            await ctx.runMutation(internal.workspaces.removeUserFromWorkspace, { removedUser: userWorkspace._id });
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
            throw new ConvexError('User is not authenticated');
        }

        const workspace = await ctx.db.get(args._id);
        if (!workspace) {
            throw new ConvexError('Workspace not found');
        }

        if (workspace.ownerId !== identity) {
            throw new ConvexError('Unauthorized: You are not the owner of this workspace');
        }

        if (workspace.defaultInvite) {
            // TODO: internal.invites.patchInviteStatus
            await ctx.db.patch(workspace.defaultInvite, { status: 'EXPIRED' });
        }

        const newInvite = await createInvite(ctx, {
            workspaceId: args._id,
            role: 'MEMBER',
        });

        if (!newInvite.success || !newInvite.data) {
            throw new ConvexError('Failed to create new invite');
        }

        // TODO: patchWorkspace
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

export const removeUserFromWorkspace = internalMutation({
    args: {
        removedUser: v.id('users'),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.removedUser);
    },
});

export const INTERNAL_createWorkspace = internalMutation({
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

export const patchWorkspace = internalMutation({
    args: {
        _id: v.id('workspaces'),
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
        await ctx.db.patch(args._id, args.updates);
    },
});

export const getWorkspaceById = internalQuery({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args._id);
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

export const deleteWorkspace = internalMutation({
    args: {
        _id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
    },
});
