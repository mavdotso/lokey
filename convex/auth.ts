import { Auth } from 'convex/server';

export async function getViewerId(ctx: { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        return null;
    }
    return identity;
}
