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

export const respondToInvite = mutation({
    args: {
        _id: v.id('workspaceInvites'),
        response: v.union(v.literal('accepted'), v.literal('rejected')),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const user = await getUser(ctx, { _id: identity });

            if (!user) return { success: false, message: 'User not found' };

            const invite = await ctx.db.get(args._id);

            if (!invite) return { success: false, message: 'Invite not found' };
            if (invite.invitedUserId && invite.invitedUserId !== user._id) return { success: false, message: 'Unauthorized' };
            if (invite.invitedEmail && invite.invitedEmail !== user.email) return { success: false, message: 'Unauthorized' };

            await ctx.db.patch(args._id, { status: args.response });

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
        role: v.union(v.literal('manager'), v.literal('member')),
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

        const workspace = await ctx.db
            .query('workspaces')
            .filter((q) => q.eq(q.field('inviteCode'), args.inviteCode))
            .first();

        if (!workspace) {
            throw new Error('Invalid invite code');
        }

        const existingMembership = await ctx.db
            .query('userWorkspaces')
            .filter((q) => q.eq(q.field('userId'), identity))
            .filter((q) => q.eq(q.field('workspaceId'), workspace._id))
            .first();

        if (existingMembership) {
            throw new Error('You are already a member of this workspace');
        }

        await ctx.db.insert('userWorkspaces', {
            userId: identity,
            workspaceId: workspace._id,
            role: 'member',
        });

        return { success: true, message: 'Successfully joined the workspace' };
    },
});