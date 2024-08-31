import { db } from '@/db';
import { passwordLinksTable } from '@/db/schema';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { password } = json;

        if (!password) {
            return new Response('Password is required', { status: 400 });
        }

        const id = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(passwordLinksTable).values({
            id,
            password,
            expiresAt,
        });

        const BASE_URL = process.env.NODE_ENV === 'production' ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';

        return new Response(
            JSON.stringify({
                link: `${BASE_URL}/share/${id}`,
            })
        );
    } catch (error) {
        console.error('Error creating link:', error);
        return new Response('An error occurred while creating the link', { status: 500 });
    }
}
