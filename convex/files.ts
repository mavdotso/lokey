import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { getViewerId } from "./auth";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new ConvexError('User is not authenticated');
        }

        return await ctx.storage.generateUploadUrl();
    },
});