import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { nanoid } from 'nanoid';
import { getViewerId } from './auth';
import { getUser } from './users';
import { getURL } from '@/lib/utils';

export const createInvite = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        invitedUserId: v.optional(v.id('users')),
        invitedEmail: v.optional(v.string()),
        role: v.union(v.literal('manager'), v.literal('member')),
        expiresAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new Error('User not found');
        }

        const inviteCode = nanoid(10);

        const inviteId = await ctx.db.insert('workspaceInvites', {
            workspaceId: args.workspaceId,
            invitedBy: user._id,
            invitedUserId: args.invitedUserId,
            invitedEmail: args.invitedEmail,
            role: args.role,
            status: 'pending',
            expiresAt: args.expiresAt,
            inviteCode,
        });

        return { success: true, data: { inviteId, inviteCode } };
    },
});

export const respondToInvite = mutation({
    args: {
        _id: v.id('workspaceInvites'),
        response: v.union(v.literal('accepted'), v.literal('rejected')),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new Error('User not found');
        }

        const invite = await ctx.db.get(args._id);
        if (!invite) {
            throw new Error('Invite not found');
        }

        if (invite.invitedUserId && invite.invitedUserId !== user._id) {
            throw new Error('Unauthorized');
        }
        if (invite.invitedEmail && invite.invitedEmail !== user.email) {
            throw new Error('Unauthorized');
        }

        await ctx.db.patch(args._id, { status: args.response });

        if (args.response === 'accepted') {
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
        role: v.union(v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const user = await getUser(ctx, { _id: identity });
        if (!user) {
            throw new Error('User not found');
        }

        const inviteCode = nanoid(10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await ctx.db.insert('workspaceInvites', {
            workspaceId: args.workspaceId,
            invitedBy: user._id,
            role: args.role,
            status: 'pending',
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
        const invite = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('_id'), args._id))
            .first();

        return invite || null;
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
        };
    },
});

export const joinWorkspaceByInviteCode = mutation({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('User is not authenticated');
        }

        const invite = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('inviteCode'), args.inviteCode))
            .first();

        if (!invite) {
            throw new Error('Invalid invite code');
        }

        if (invite.status !== 'pending') {
            throw new Error('This invite has already been processed');
        }

        const existingMembership = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), identity))
            .filter((q) => q.eq(q.field('workspaceId'), invite.workspaceId))
            .first();

        if (existingMembership) {
            throw new Error('You are already a member of this workspace');
        }

        await ctx.db.insert('userWorkspaces', {
            userId: identity,
            workspaceId: invite.workspaceId,
            role: invite.role,
        });

        if (invite.invitedEmail) {
            await ctx.db.patch(invite._id, { status: 'accepted' });
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

export const setInviteExpired = mutation({
    args: {
        _id: v.id('workspaceInvites'),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const invite = await ctx.db.get(args._id);
        if (!invite) {
            throw new Error('Invite not found');
        }

        await ctx.db.patch(args._id, { status: 'expired' });
        return { success: true };
    },
});
