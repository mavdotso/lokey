import { ConvexHttpClient } from 'convex/browser';
import { decrypt } from '@/lib/utils';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const credential = await convex.query(api.queries.getCredential, { id });

        if (!credential) {
            return new Response('Credential not found', { status: 404 });
        }

        const now = new Date();

        // Check time-based expiration
        if (credential.expiresAt && new Date(credential.expiresAt) < now) {
            return new Response('Credential has expired', { status: 410 });
        }

        // Check view-based expiration
        if (credential.maxViews && credential.viewCount >= credential.maxViews) {
            return new Response('Credential has reached maximum views', { status: 410 });
        }

        const decryptedPassword = decrypt(credential.encryptedData);

        // Increment view count and update
        await convex.mutation(api.mutations.incrementViewCount, { id });

        // Check if this view has caused the credential to expire
        if (credential.maxViews && credential.viewCount + 1 >= credential.maxViews) {
            await convex.mutation(api.mutations.setExpired, { id });
        }

        return new Response(JSON.stringify({ password: decryptedPassword }));
    } catch (error) {
        console.error('Error retrieving password:', error);
        return new Response('An error occurred while retrieving the password', { status: 500 });
    }
}
