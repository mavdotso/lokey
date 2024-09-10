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
        role: v.union(v.literal('admin'), v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const user = await getUser(ctx, { _id: identity });

            if (!user) return { success: false, message: 'User not found' };
            if (!args.invitedUserId && !args.invitedEmail) return { success: false, message: 'Either invitedUserId or invitedEmail must be provided' };

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const inviteId = await ctx.db.insert('workspaceInvites', {
                workspaceId: args.workspaceId,
                invitedBy: user._id,
                invitedUserId: args.invitedUserId,
                invitedEmail: args.invitedEmail,
                role: args.role,
                status: 'pending',
                expiresAt: expiresAt.toISOString(),
            });

            return { success: true, message: 'Invite created successfully', data: inviteId };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const getInvitesByWorkspace = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('workspaceInvites')
            .withIndex('workspaceId', (q) => q.eq('workspaceId', args.workspaceId))
            .collect();
    },
});

export const getInvitesByUser = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('workspaceInvites')
            .withIndex('invitedUserId', (q) => q.eq('invitedUserId', args.userId))
            .collect();
    },
});

export const getInvitesByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('workspaceInvites')
            .withIndex('invitedEmail', (q) => q.eq('invitedEmail', args.email))
            .collect();
    },
});

export const respondToInvite = mutation({
    args: {
        inviteId: v.id('workspaceInvites'),
        response: v.union(v.literal('accepted'), v.literal('rejected')),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const user = await getUser(ctx, { _id: identity });

            if (!user) return { success: false, message: 'User not found' };

            const invite = await ctx.db.get(args.inviteId);

            if (!invite) return { success: false, message: 'Invite not found' };
            if (invite.invitedUserId && invite.invitedUserId !== user._id) return { success: false, message: 'Unauthorized' };
            if (invite.invitedEmail && invite.invitedEmail !== user.email) return { success: false, message: 'Unauthorized' };

            await ctx.db.patch(args.inviteId, { status: args.response });

            if (args.response === 'accepted') {
                await ctx.db.insert('userWorkspaces', {
                    userId: user._id,
                    workspaceId: invite.workspaceId,
                    role: invite.role,
                });
            }

            return { success: true, message: `Invite ${args.response} successfully` };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const generateInviteLink = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        role: v.union(v.literal('admin'), v.literal('manager'), v.literal('member')),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const user = await getUser(ctx, { _id: identity });

            if (!user) return { success: false, message: 'User not found' };

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

            return { success: true, message: 'Invite link generated successfully', data: inviteLink };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});

export const getInviteByCode = query({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('inviteCode'), args.inviteCode))
            .first();
    },
});
