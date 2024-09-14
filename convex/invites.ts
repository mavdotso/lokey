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
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const user = await getUser(ctx, { _id: identity });

            if (!user) return { success: false, message: 'User not found' };

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

            return { success: true, message: 'Invite created successfully', data: { inviteId, inviteCode } };
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

export const getInviteById = query({
    args: { _id: v.string() },
    handler: async (ctx, args) => {
        const invite = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('_id'), args._id))
            .first();

        if (!invite) {
            return null;
        }

        return invite;
    },
});

export const getInviteByCode = query({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        console.log('Searching for invite with code:', args.inviteCode);
        const invite = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('inviteCode'), args.inviteCode))
            .first();

        console.log('Found invite:', invite);

        if (!invite) {
            return null;
        }

        const workspace = await ctx.db.get(invite.workspaceId);

        console.log('Found workspace:', workspace);

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

        await ctx.db.patch(invite._id, { status: 'accepted' });

        return { success: true, message: 'Successfully joined the workspace' };
    },
});

export const getWorkspaceInvites = query({
    args: { workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const invites = await ctx.db
            .query('workspaceInvites')
            .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
            .filter((q) => q.eq(q.field('status'), 'pending'))
            .collect();

        return invites;
    },
});

export const setInviteExpired = mutation({
    args: {
        _id: v.id('workspaceInvites'),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await getViewerId(ctx);

            if (!identity) return { success: false, message: 'Not authenticated' };

            const invite = await ctx.db.get(args._id);

            if (!invite) return { success: false, message: 'Invite not found' };

            if (invite.status !== 'pending') {
                return { success: false, message: 'Invite is not in pending status' };
            }

            await ctx.db.patch(args._id, { status: 'expired' });

            return { success: true, message: 'Invite set as expired successfully' };
        } catch (error: any) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
    },
});
