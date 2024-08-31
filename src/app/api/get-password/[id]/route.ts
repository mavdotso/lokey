import { db } from '@/db';
import { passwordLinksTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'defaultEncryptionKey';

function deriveKey(password: string): Buffer {
    return crypto.pbkdf2Sync(password, 'salt', 100000, 32, 'sha256');
}

const key = deriveKey(ENCRYPTION_KEY);

function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const [passwordLink] = await db.select().from(passwordLinksTable).where(eq(passwordLinksTable.id, id)).limit(1);

        if (!passwordLink) {
            return new Response('Link not found or already used', { status: 404 });
        }

        if (new Date(passwordLink.expiresAt) < new Date()) {
            await db.delete(passwordLinksTable).where(eq(passwordLinksTable.id, id));
            return new Response('Link has expired', { status: 410 });
        }

        const decryptedPassword = decrypt(passwordLink.password);

        await db.delete(passwordLinksTable).where(eq(passwordLinksTable.id, id));

        return new Response(JSON.stringify({ password: decryptedPassword }));
    } catch (error) {
        console.error('Error retrieving password:', error);
        return new Response('An error occurred while retrieving the password', { status: 500 });
    }
}
