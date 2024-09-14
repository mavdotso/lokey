import InviteUserReact, { InviteUserText } from '@/emails/invite-user';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
    const { to, invitedByUsername, workspaceName, inviteLink } = await req.json();

    console.log(to, invitedByUsername, workspaceName, inviteLink);

    const from = process.env.EMAIL_FROM;

    if (!to || !invitedByUsername || !workspaceName || !inviteLink || !from) {
        return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from,
            to: [to],
            subject: `Join ${workspaceName} on Lokey`,
            react: InviteUserReact({ invitedByUsername, workspaceName, inviteLink }),
            text: InviteUserText({ invitedByUsername, workspaceName, inviteLink }),
        });

        if (error) {
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
