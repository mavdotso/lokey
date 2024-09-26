import { ConvexError, v } from 'convex/values';
import { action, internalMutation, mutation, query } from './_generated/server';
import { nanoid } from 'nanoid';
import { getViewerId } from './auth';
import { getUser } from './users';
import { getURL } from '@/lib/utils';
import { inviteTypeValidator, roleTypeValidator } from './schema';
import { api, internal } from './_generated/api';

export const createInvite = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        invitedUserId: v.optional(v.id('users')),
        invitedEmail: v.optional(v.string()),
        role: roleTypeValidator,
        expiresAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new ConvexError('User not found');
        }

        const inviteCode = nanoid(10);

        const inviteId = await ctx.db.insert('workspaceInvites', {
            workspaceId: args.workspaceId,
            invitedBy: user._id,
            invitedUserId: args.invitedUserId,
            invitedEmail: args.invitedEmail,
            role: args.role,
            status: 'PENDING',
            expiresAt: args.expiresAt,
            inviteCode,
        });

        return { success: true, data: { inviteId, inviteCode } };
    },
});

export const respondToInvite = mutation({
    args: {
        _id: v.id('workspaceInvites'),
        response: inviteTypeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new ConvexError('User not found');
        }

        const invite = await ctx.db.get(args._id);
        if (!invite) {
            throw new ConvexError('Invite not found');
        }

        if (invite.invitedUserId && invite.invitedUserId !== user._id) {
            throw new ConvexError('Unauthorized');
        }
        if (invite.invitedEmail && invite.invitedEmail !== user.email) {
            throw new ConvexError('Unauthorized');
        }

        await ctx.db.patch(args._id, { status: args.response });

        if (args.response === 'ACCEPTED') {
            await ctx.db.insert('userWorkspaces', {
                userId: user._id,
                workspaceId: invite.workspaceId,
                role: invite.role,
            });
        }

        return { success: true };
    },
});

export const generateInviteLink = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        role: roleTypeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new ConvexError('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new ConvexError('User not found');
        }

        const inviteCode = nanoid(10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await ctx.db.insert('workspaceInvites', {
            workspaceId: args.workspaceId,
            invitedBy: user._id,
            role: args.role,
            status: 'PENDING',
            expiresAt: expiresAt.toISOString(),
            inviteCode,
        });

        const inviteLink = `${getURL()}/invite/${inviteCode}`;
        return { inviteLink };
    },
});

export const getInviteById = query({
    args: { _id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('_id'), args._id))
            .first();
    },
});

export const getInviteByCode = query({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        const invite = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('inviteCode'), args.inviteCode))
            .first();

        if (!invite) {
            return null;
        }

        const workspace = await ctx.db.get(invite.workspaceId);

        if (!workspace) {
            return null;
        }

        return {
            _id: invite._id,
            workspaceId: workspace._id,
            workspaceName: workspace.name,
            inviteCode: invite.inviteCode,
            status: invite.status,
            role: invite.role,
            invitedEmail: invite.invitedEmail,
        };
    },
});

export const joinWorkspaceByInviteCode = action({
    args: { _id: v.id('users'), inviteCode: v.string() },
    handler: async (ctx, args) => {
        const invite = await ctx.runQuery(api.invites.getInviteByCode, { inviteCode: args.inviteCode });

        if (!invite) {
            throw new ConvexError('Invalid invite code');
        }

        if (invite.status !== 'PENDING') {
            throw new ConvexError('This invite has already been processed');
        }

        const existingMembership = await ctx.runQuery(api.workspaces.getUserWorkspaces, { userId: args._id });

        if (existingMembership) {
            throw new ConvexError('You are already a member of this workspace');
        }

        await ctx.runMutation(internal.invites.addUserToWorkspace, { _id: args._id, workspaceId: invite.workspaceId, role: invite.role });

        if (invite.invitedEmail) {
            await ctx.runMutation(internal.invites.patchInviteStatus, { inviteId: invite._id, status: 'ACCEPTED' });
        }

        return { success: true };
    },
});

export const expireInvite = action({
    args: {
        _id: v.id('workspaceInvites'),
    },
    handler: async (ctx, args) => {
        const invite = await ctx.runQuery(api.invites.getInviteById, { _id: args._id });
        if (!invite) {
            throw new ConvexError('Invite not found');
        }

        if (invite.status !== 'PENDING') {
            throw new ConvexError('Invite is already expired or processed');
        }

        const result = await ctx.runMutation(internal.invites.patchInviteStatus, { inviteId: args._id, status: 'EXPIRED' });

        if (!result.success) {
            throw new ConvexError('Failed to expire the invite');
        }

        return { success: true };
    },
});

export const getWorkspaceInvites = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        return ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .filter((q) => q.eq(q.field('status'), 'pending'))
            .collect();
    },
});

export const INTERNAL_createInvite = internalMutation({
    args: {
        workspaceId: v.id('workspaces'),
        invitedBy: v.id('users'),
        invitedUserId: v.optional(v.id('users')),
        invitedEmail: v.optional(v.string()),
        role: roleTypeValidator,
        expiresAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const inviteCode = nanoid(10);
        return await ctx.db.insert('workspaceInvites', {
            workspaceId: args.workspaceId,
            invitedBy: args.invitedBy,
            invitedUserId: args.invitedUserId,
            invitedEmail: args.invitedEmail,
            role: args.role,
            status: 'PENDING',
            expiresAt: args.expiresAt,
            inviteCode,
        });
    },
});

export const addUserToWorkspace = internalMutation({
    args: { _id: v.id('users'), workspaceId: v.id('workspaces'), role: roleTypeValidator },
    handler: async (ctx, args) => {
        return await ctx.db.insert('userWorkspaces', {
            userId: args._id,
            workspaceId: args.workspaceId,
            role: args.role,
        });
    },
});

export const patchInviteStatus = internalMutation({
    args: {
        inviteId: v.id('workspaceInvites'),
        status: inviteTypeValidator,
    },
    handler: async (ctx, args) => {
        const { inviteId, status } = args;
        await ctx.db.patch(inviteId, { status });
        return { success: true };
    },
});
