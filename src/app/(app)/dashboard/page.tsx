"use client"
import { useMutation, useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';

export default function Dashboard() {
    const router = useRouter();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true)

    const workspaces = useQuery(api.workspaces.getUserWorkspaces);
    const defaultWorkspace = useQuery(api.users.getUserDefaultWorkspace);
    const getInviteByCode = useQuery(api.invites.getInviteByCode, inviteCode ? { inviteCode } : "skip");

    const joinWorkspace = useMutation(api.invites.joinWorkspaceByInviteCode);

    useEffect(() => {
        const storedInviteCode = localStorage.getItem('inviteCode');
        if (storedInviteCode) {
            setInviteCode(storedInviteCode);
            localStorage.removeItem('inviteCode');
        }
    }, []);

    const handleInvite = useCallback(async () => {
        if (inviteCode) {
            try {
                await joinWorkspace({ inviteCode });
                router.refresh();
            } catch (error) {
                console.error("Error joining workspace:", error);
            }
        }
    }, [inviteCode, joinWorkspace, router]);

    useEffect(() => {
        if (workspaces !== undefined && defaultWorkspace !== undefined) {
            if (inviteCode && getInviteByCode !== undefined) {
                handleInvite();
            } else {
                setIsLoading(false);
            }
        }
    }, [workspaces, defaultWorkspace, inviteCode, getInviteByCode, handleInvite]);

    useEffect(() => {
        if (!isLoading && workspaces && workspaces.length > 0) {
            let redirectWorkspace;
            if (defaultWorkspace) {
                redirectWorkspace = defaultWorkspace;
            } else {
                redirectWorkspace = workspaces[0];
            }
            router.replace(`/dashboard/${redirectWorkspace.slug}/credentials`, { scroll: false });
        }
    }, [isLoading, workspaces, defaultWorkspace, router]);

    if (isLoading) return <LoadingScreen />

    if (!workspaces || workspaces.length === 0) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateWorkspaceDialog isOpen={true} />
            </div>
        );
    }

    return <LoadingScreen />;
}