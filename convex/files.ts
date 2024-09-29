import { internal } from './_generated/api';
import { action, internalAction } from './_generated/server';
import { getViewerId } from './auth';

export const getUploadUrl = action({
    args: {},
    handler: async (ctx) => {
        const identity = await getViewerId(ctx);

        if (identity === null) {
            throw new Error('User is not authenticated');
        }

        const uploadUrl: string = await ctx.runAction(internal.files.generateUploadUrl);

        return uploadUrl;
    },
});

export const generateUploadUrl = internalAction({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
