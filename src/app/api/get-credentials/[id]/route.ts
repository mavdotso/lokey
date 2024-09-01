import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { credentials } from '@/lib/db/schema';
import { decrypt } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const [credential] = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);

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

        const encryptedData = credential.encryptedData as string;
        const decryptedPassword = decrypt(encryptedData);

        // Increment view count
        await db
            .update(credentials)
            .set({
                viewCount: credential.viewCount + 1,
                updatedAt: now,
            })
            .where(eq(credentials.id, id));

        // Check if this view has caused the credential to expire
        if (credential.maxViews && credential.viewCount + 1 >= credential.maxViews) {
            await db.update(credentials).set({ expiresAt: now }).where(eq(credentials.id, id));
        }

        return new Response(JSON.stringify({ password: decryptedPassword }));
    } catch (error) {
        console.error('Error retrieving password:', error);
        return new Response('An error occurred while retrieving the password', { status: 500 });
    }
}
