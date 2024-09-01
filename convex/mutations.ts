import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getViewerId } from './auth';

export const createSpace = mutation({
    args: {
        title: v.string(),
        iconId: v.string(),
        data: v.optional(v.string()),
        inTrash: v.optional(v.string()),
        logo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const spaceId = await ctx.db.insert('spaces', {
            ...args,
            spaceOwner: identity.subject,
        });
        return { spaceId };
    },
});
