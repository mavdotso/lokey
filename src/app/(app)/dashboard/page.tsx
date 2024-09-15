"use client"
import { useMutation, useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { CreateWorkspaceCard } from '@/components/workspaces/create-workspace-card';
import { api } from '@/convex/_generated/api';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    const workspaces = useQuery(api.workspaces.getUserWorkspaces);
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
        if (inviteCode && getInviteByCode) {
            handleInvite();
        }
    }, [inviteCode, getInviteByCode, handleInvite]);

    if (workspaces === undefined) return <LoadingScreen />

    if (!workspaces || workspaces.length === 0) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateWorkspaceCard />
            </div>
        );
    } else {
        // TODO: Redirect to the default user's space, not the first
        router.push(`/dashboard/${workspaces[0].slug}/credentials`);
    }
}