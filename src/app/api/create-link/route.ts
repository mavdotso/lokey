import { ConvexHttpClient } from 'convex/browser';
import { encrypt, getURL } from '@/lib/utils';
import crypto from 'crypto';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { password, expiration } = json;

        if (!password) {
            return new Response('Password is required', { status: 400 });
        }

        const encryptedPassword = encrypt(password);

        const expirationDays = parseInt(expiration) || 1;
        const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

        const { credentialId } = await convex.mutation(api.mutations.createCredential, {
            name: 'Shared Password',
            description: 'Temporary shared password',
            type: 'password',
            encryptedData: encryptedPassword,
            expiresAt: expiresAt.toISOString(),
        });

        const BASE_URL = getURL();

        return new Response(
            JSON.stringify({
                link: `${BASE_URL}/shared/${credentialId}`,
            })
        );
    } catch (error) {
        console.error('Error creating link:', error);
        return new Response('An error occurred while creating the link', { status: 500 });
    }
}
