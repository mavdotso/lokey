import { mutation } from "./_generated/server";
import { getViewerId } from "./auth";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        return await ctx.storage.generateUploadUrl();
    },
});