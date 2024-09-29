import { api } from '@/convex/_generated/api';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import { cookies } from 'next/headers';
import { fetchAction, fetchQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Id } from '@/convex/_generated/dataModel';
import { deleteCookie } from "cookies-next";

export default async function Dashboard() {
    const session = await auth();
    const cookieStore = cookies();

    if (!session || !session.user) redirect('/')

    const inviteCode = cookieStore.get('inviteCode')?.value;
    const redirectResult = await fetchAction(api.workspaces.getUserRedirectWorkspace, { userId: session.user.id as Id<"users"> });

    if (inviteCode) {
        await fetchAction(api.workspaceInvites.joinWorkspaceByInviteCode, { userId: session.user.id as Id<"users">, inviteCode });
        deleteCookie('inviteCode');
    }

    if (!redirectResult.success || !redirectResult.workspace) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateWorkspaceDialog isOpen={true} />
            </div>
        );
    } else {
        redirect(`/dashboard/${redirectResult.workspace.slug}/credentials`);
    }
}