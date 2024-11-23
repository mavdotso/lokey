'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSession } from 'next-auth/react';
import { Id } from '@/convex/_generated/dataModel';
import { cookies } from 'next/headers';

export default function InvitePage() {
    const session = useSession();
    const [inviteStatus, setInviteStatus] = useState<'loading' | 'pending' | 'error'>('loading');
    const [workspaceName, setWorkspaceName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const router = useRouter();
    const params = useParams();

    const inviteCode = params.inviteCode as string;

    const getInviteDetails = useQuery(api.workspaceInvites.getInviteByCode, { inviteCode });
    const getWorkspaceName = useQuery(api.workspaces.getWorkspaceName,
        getInviteDetails?.workspaceId ? { workspaceId: getInviteDetails.workspaceId } : 'skip');

    const joinWorkspace = useAction(api.workspaceInvites.joinWorkspaceByInviteCode);

    useEffect(() => {
        if (getInviteDetails === undefined) {
            return;
        }

        if (getInviteDetails === null) {
            setInviteStatus('error');
            setErrorMessage('Invite not found');
            return;
        }

        setInviteStatus('pending');
    }, [getInviteDetails]);

    useEffect(() => {
        if (getWorkspaceName) {
            setWorkspaceName(getWorkspaceName);
        }
    }, [getWorkspaceName]);

    async function handleAcceptInvite() {
        if (session.data?.user?.id) {
            setIsJoining(true);
            try {
                await joinWorkspace({ userId: session.data?.user?.id as Id<"users">, inviteCode });
                router.push('/dashboard');
            } catch (error) {
                console.error('Error joining workspace:', error);
                setErrorMessage('Failed to join workspace. Please try again.');
                setInviteStatus('error');
            }
            setIsJoining(false);
        } else {
            cookies().set('inviteCode', inviteCode, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            });
            router.push('/sign-in');
        }
    }

    return (
        <>
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    {inviteStatus === 'loading' ? 'Processing Invitation...' :
                        inviteStatus === 'pending' ? 'Workspace Invitation' :
                            'Invitation Error'}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {inviteStatus === 'loading' ? 'Please wait while we process your invitation.' :
                        inviteStatus === 'pending' ? `You've been invited to join ${workspaceName}.` :
                            `There was an error processing your invitation: ${errorMessage}`}
                </p>
            </div>

            <div className='flex flex-col pt-8 max-w-xl'>
                <div className="space-y-4">
                    <div className="flex items-center bg-muted p-6 rounded-md">
                        {(inviteStatus === 'loading' || inviteStatus === 'error') && <div className="border-4 border-primary mr-4 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>}
                        <div>
                            <h2 className="font-semibold text-xl">
                                {inviteStatus === 'loading' ? 'Processing' :
                                    inviteStatus === 'pending' ? 'Invitation Pending' :
                                        'Invitation Error'}
                            </h2>
                            <p className="text-muted-foreground">
                                {inviteStatus === 'loading' ? 'Please wait while we confirm your invitation.' :
                                    inviteStatus === 'pending' ? 'Click the button below to accept the invitation.' :
                                        `Error: ${errorMessage}`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {inviteStatus === 'pending' && (
                        <Button onClick={handleAcceptInvite} disabled={isJoining}>
                            {isJoining ? 'Joining...' : session ? 'Join Workspace' : 'Accept Invitation'}
                        </Button>
                    )}
                    {inviteStatus === 'error' && (
                        <Link href="/">
                            <Button>Back to Home</Button>
                        </Link>
                    )}
                </div>
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                {inviteStatus === 'error' ? "If you continue to experience issues, please contact support." :
                    inviteStatus === 'pending' ? "By accepting, you agree to the workspace's terms and conditions." :
                        ""}
            </p>
        </>
    );
}