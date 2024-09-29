import { action, internalMutation, internalQuery, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { planTypeValidator, roleTypeValidator } from './schema';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { UserWorkspace, Workspace, WorkspaceInvite } from './types';
import { getViewerId } from './auth';

export const newWorkspace = action({
    args: {
        name: v.string(),
        slug: v.string(),
        iconId: v.string(),
        logo: v.optional(v.string()),
        planType: planTypeValidator,
    },
    handler: async (ctx, args) => {
        const userId = await getViewerId(ctx);

        if (!userId) {
            return { success: false, error: 'User not found' };
        }

        if (args.planType === 'FREE') {
            const canCreate = await ctx.runAction(api.limits.canCreateWorkspace, { _id: userId });

            if (!canCreate) {
                return { success: false, error: 'You have reached the maximum number of free workspaces' };
            }
        }

        const isUnique = await ctx.runQuery(api.workspaces.isSlugUnique, { slug: args.slug });

        if (!isUnique) {
            return { success: false, error: 'The slug is not unique' };
        }

        try {
            const newWorkspace: Id<'workspaces'> = await ctx.runMutation(internal.workspaces.createWorkspace, { ...args, ownerId: userId });

            const newInvite = await ctx.runMutation(internal.workspaceInvites.INTERNAL_createInvite, { workspaceId: newWorkspace, invitedBy: userId, role: 'MEMBER' });

            await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: newWorkspace, updates: { defaultInvite: newInvite } });
            await ctx.runMutation(internal.workspaces.createWorkspaceAdmin, { userId: userId, workspaceId: newWorkspace });

            return { success: true, workspaceId: newWorkspace };
        } catch (error) {
            console.error('Error creating workspace:', error);
            return { success: false, error: 'Failed to create workspace' };
        }
    },
});

export const inviteUserToWorkspace = action({
    args: {
        userId: v.id('users'),
        workspaceId: v.id('workspaces'),
        role: roleTypeValidator,
    },
    handler: async (ctx, args) => {
        const inviterUserId = await getViewerId(ctx);

        if (!inviterUserId) {
            return { success: false, error: 'Unauthenticated' };
        }

        const inviterWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: inviterUserId, workspaceId: args.workspaceId });

        if (!inviterWorkspace || inviterWorkspace.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only admins can invite users to this workspace' };
        }

        const invitedUser = await ctx.runQuery(api.users.getUser, { userId: args.userId });

        if (!invitedUser) {
            return { success: false, error: 'Invited user not found' };
        }

        const existingMembership = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.userId, workspaceId: args.workspaceId });

        if (existingMembership) {
            return { success: false, error: 'User is already part of the workspace' };
        }

        try {
            await ctx.runMutation(internal.workspaceInvites.addUserToWorkspace, {
                _id: args.userId,
                workspaceId: args.workspaceId,
                role: args.role,
            });

            return { success: true, message: 'User successfully invited to the workspace' };
        } catch (error) {
            console.error('Error inviting user to workspace:', error);
            return { success: false, error: 'Failed to invite user to workspace' };
        }
    },
});

export const kickUserFromWorkspace = action({
    args: {
        workspaceId: v.id('workspaces'),
        kickedUserId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const adminUserId = await getViewerId(ctx);

        if (!adminUserId) {
            return { success: false, error: 'Unauthenticated' };
        }

        const adminWorkspace = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: adminUserId, workspaceId: args.workspaceId });

        if (!adminWorkspace || adminWorkspace.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only admins can remove users from this workspace' };
        }

        const existingMembership = await ctx.runQuery(internal.workspaces.getUserWorkspace, { userId: args.kickedUserId, workspaceId: args.workspaceId });

        if (!existingMembership) {
            return { success: false, error: 'User is not a member of the workspace' };
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            return { success: false, error: 'Cannot find the workspace' };
        }

        if (workspace.ownerId === args.kickedUserId) {
            return { success: false, error: 'Cannot remove the workspace owner' };
        }

        try {
            await ctx.runMutation(internal.users.removeUserFromWorkspace, { removeUser: args.kickedUserId, workspaceId: args.workspaceId });
            return { success: true, message: 'User successfully removed from the workspace' };
        } catch (error) {
            console.error('Error removing user from workspace:', error);
            return { success: false, error: 'Failed to remove user from workspace' };
        }
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
            return { success: false, error: 'Unauthorized: Only admins can update this workspace' };
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            return { success: false, error: 'Cannot find the workspace' };
        }

        if (workspace.ownerId !== args.adminId) {
            return { success: false, error: 'Unauthorized: You are not the owner of this workspace' };
        }

        try {
            await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: args.workspaceId, updates: args.updates });
            return { success: true, message: 'Workspace updated successfully' };
        } catch (error) {
            console.error('Error updating workspace:', error);
            return { success: false, error: 'Failed to update workspace' };
        }
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
            return { success: false, error: 'Unauthorized: Only admins can update this workspace' };
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            return { success: false, error: 'Cannot find the workspace' };
        }

        if (workspace.ownerId !== args.adminId) {
            return { success: false, error: 'Unauthorized: You are not the owner of this workspace' };
        }

        try {
            const imageUrl = await ctx.storage.getUrl(args.storageId);

            if (!imageUrl) {
                return { success: false, error: 'Failed to get image URL' };
            }

            await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: args.workspaceId, updates: { logo: imageUrl } });
            return { success: true, message: 'Workspace logo updated successfully' };
        } catch (error) {
            console.error('Error updating workspace logo:', error);
            return { success: false, error: 'Failed to update workspace logo' };
        }
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
            return { success: false, error: 'Unauthorized: Only admins can remove this workspace' };
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            return { success: false, error: 'Cannot find the workspace' };
        }

        if (workspace.ownerId !== args.adminId) {
            return { success: false, error: 'Unauthorized: You are not the owner of this workspace' };
        }

        try {
            await ctx.runMutation(internal.workspaces.deleteWorkspace, { workspaceId: args.workspaceId });

            const workspaceUsers = await ctx.runQuery(api.workspaces.getWorkspaceUsers, { workspaceId: args.workspaceId });

            if (workspaceUsers.success && workspaceUsers.users) {
                for (const user of workspaceUsers.users) {
                    await ctx.runMutation(internal.users.removeUserFromWorkspace, { removeUser: user._id, workspaceId: args.workspaceId });
                }
            }

            return { success: true, message: 'Workspace deleted successfully' };
        } catch (error) {
            console.error('Error removing workspace:', error);
            return { success: false, error: 'Failed to remove workspace' };
        }
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
            return { success: false, error: 'Unauthorized: Only admins can update invite codes for this workspace' };
        }

        const workspace = await ctx.runQuery(internal.workspaces.getWorkspaceById, { workspaceId: args.workspaceId });

        if (!workspace) {
            return { success: false, error: 'Cannot find the workspace' };
        }

        if (workspace.ownerId !== args.adminId) {
            return { success: false, error: 'Unauthorized: You are not the owner of this workspace' };
        }

        try {
            if (workspace.defaultInvite) {
                await ctx.runMutation(internal.workspaceInvites.patchInviteStatus, { inviteId: workspace.defaultInvite, status: 'EXPIRED' });
            }

            const newInvite: Id<'workspaceInvites'> = await ctx.runMutation(internal.workspaceInvites.INTERNAL_createInvite, {
                workspaceId: args.workspaceId,
                invitedBy: args.adminId,
                role: 'MEMBER',
            });

            if (!newInvite) {
                return { success: false, error: "Couldn't create invite" };
            }

            await ctx.runMutation(internal.workspaces.patchWorkspace, { workspaceId: workspace._id, updates: { defaultInvite: newInvite } });

            const invite = await ctx.runQuery(api.workspaceInvites.getInviteById, { _id: newInvite });

            if (!invite) {
                return { success: false, error: 'Invite not found' };
            }

            const workspaceInvite: WorkspaceInvite = invite;

            return {
                success: true,
                message: 'Workspace invite code updated successfully',
                inviteCode: workspaceInvite.inviteCode,
            };
        } catch (error) {
            console.error('Error updating workspace invite code:', error);
            return { success: false, error: 'Failed to update workspace invite code' };
        }
    },
});

export const getUserRedirectWorkspace = action({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args): Promise<{ success: boolean; workspace?: Workspace; error?: string }> => {
        const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const defaultWorkspace: Workspace | null = await ctx.runQuery(api.users.getUserDefaultUserWorkspace, { userId: args.userId });

        if (defaultWorkspace) {
            return { success: true, workspace: defaultWorkspace };
        }

        const userWorkspaces: Workspace[] | null = await ctx.runQuery(api.workspaces.getUserWorkspaces, { userId: args.userId });

        if (!userWorkspaces || userWorkspaces.length === 0) {
            return { success: false, error: 'No workspaces found' };
        }

        return { success: true, workspace: userWorkspaces[0] };
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
            return { success: false, error: 'Workspace not found' };
        }

        const associatedUsers = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .collect();

        if (!associatedUsers || associatedUsers.length === 0) {
            return { success: false, error: 'No users are associated with this workspace' };
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
