import { useQuery } from 'convex/react';
import { redirect } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import LoadingScreen from '@/components/global/loading-screen';
import { CreateWorkspaceForm } from '@/components/workspaces/create-workspace-form';

export default function Dashboard() {
    const spaces = useQuery(api.workspaces.getUserWorkspaces);

    if (spaces === undefined) return <LoadingScreen />

    if (!spaces || spaces.length === 0) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateWorkspaceForm />
            </div>
        );
    } else {
        redirect(`/dashboard/${spaces[0]._id}`);
    }
}