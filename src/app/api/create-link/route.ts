import { db } from '@/db';
import { passwordLinksTable } from '@/db/schema';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'defaultEncryptionKey';

function deriveKey(password: string): Buffer {
    return crypto.pbkdf2Sync(password, 'salt', 100000, 32, 'sha256');
}

const key = deriveKey(ENCRYPTION_KEY);

function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { password } = json;

        if (!password) {
            return new Response('Password is required', { status: 400 });
        }

        const id = crypto.randomBytes(16).toString('hex');
        const encryptedPassword = encrypt(password);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(passwordLinksTable).values({
            id,
            password: encryptedPassword,
            expiresAt,
        });

        const BASE_URL = process.env.NODE_ENV === 'production' ? `https://${process.env.NEXT_PUBLIC_URL}` : 'http://localhost:3000';

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
