import { query } from './_generated/server';
import { v } from 'convex/values';

export const getUser = query({
    args: { _id: v.id('users') },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args._id);

        console.log(user);

        if (!user) {
            return null;
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
        };
    },
});
