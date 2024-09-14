import MagicLinkEmailReact, { MagicLinkEmailText } from '@/emails/magic-link';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
    const { to, url, host } = await req.json();

    const from = process.env.EMAIL_FROM;

    if (!to || !url || !host || !from) {
        return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from,
            to: to,
            subject: `Sign in to ${host}`,
            react: MagicLinkEmailReact({ url, host }),
            text: MagicLinkEmailText({ url, host }),
        });

        if (error) {
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
