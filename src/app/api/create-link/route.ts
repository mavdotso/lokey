import { db } from '@/lib/db';
import { credentials } from '@/lib/db/schema';
import { encrypt, getURL } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { password, expiration } = json;

        if (!password) {
            return new Response('Password is required', { status: 400 });
        }

        const id = crypto.randomBytes(16).toString('hex');
        const encryptedPassword = encrypt(password);

        const expirationDays = parseInt(expiration) || 1;
        const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

        await db.insert(credentials).values({
            id,
            name: 'Shared Password',
            description: 'Temporary shared password',
            type: 'password',
            encryptedData: encryptedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt,
            viewCount: 0,
        });

        const BASE_URL = getURL();

        return new Response(
            JSON.stringify({
                link: `${BASE_URL}/shared/${id}`,
            })
        );
    } catch (error) {
        console.error('Error creating link:', error);
        return new Response('An error occurred while creating the link', { status: 500 });
    }
}
