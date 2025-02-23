import { api } from '@/convex/_generated/api';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import { cookies } from 'next/headers';
import { fetchAction } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Id } from '@/convex/_generated/dataModel';

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const cookieStore = await cookies();
    const inviteCode = cookieStore.get('inviteCode')?.value;
    
    // Handle invite code first if it exists
    if (inviteCode) {
        await fetchAction(api.workspaceInvites.joinWorkspaceByInviteCode, {
            userId: session.user.id as Id<"users">,
            inviteCode
        });
        // Delete the invite code cookie after processing
        cookieStore.set('inviteCode', '', { maxAge: 0, path: '/' });
    }

    // Get redirect workspace after potentially joining a new one
    const { success, workspace } = await fetchAction(
        api.workspaces.getUserRedirectWorkspace,
        { userId: session.user.id as Id<"users"> }
    );

    // Redirect to workspace if exists
    if (success && workspace) {
        redirect(`/dashboard/${workspace.slug}/credentials`);
    }

    // Show create workspace dialog if no workspace exists
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-xs w-screen h-screen">
            <CreateWorkspaceDialog isOpen={true} />
        </div>
    );
}