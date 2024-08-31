import { db } from '@/db';
import { passwordLinksTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

        await db.delete(passwordLinksTable).where(eq(passwordLinksTable.id, id));

        return new Response(JSON.stringify({ password: passwordLink.password }));
    } catch (error) {
        console.error('Error retrieving password:', error);
        return new Response('An error occurred while retrieving the password', { status: 500 });
    }
}
