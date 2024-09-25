import { api } from '@/convex/_generated/api';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import { cookies } from 'next/headers';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Id } from '@/convex/_generated/dataModel';

export default async function Dashboard() {
    const session = await auth();
    const cookieStore = cookies();

    if (!session || !session.user) redirect('/')

    const inviteCode = cookieStore.get('inviteCode')?.value;
    const workspaces = await fetchQuery(api.workspaces.TEMP_getUserWorkspaces, { _id: session.user.id as Id<"users"> });
    const defaultWorkspace = await fetchQuery(api.users.getUserDefaultWorkspace, { _id: session.user.id as Id<"users"> });

    if (inviteCode) {
        await fetchMutation(api.invites.joinWorkspaceByInviteCode, { inviteCode });
    }

    if (!workspaces || workspaces.length === 0) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateWorkspaceDialog isOpen={true} />
            </div>
        );
    } else {
        const redirectWorkspace = defaultWorkspace || workspaces[0];
        redirect(`/dashboard/${redirectWorkspace.slug}/credentials`);
    }
}