'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import {  useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function InvitePage() {
    const [inviteStatus, setInviteStatus] = useState<'loading' | 'accepted' | 'rejected' | 'error' | 'pending'>('loading');
    const [workspaceName, setWorkspaceName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const session = useSession();
    const params = useParams();
    const inviteCode = params.inviteCode as string;
    console.log('Invite code:', inviteCode);
    const getInviteDetails = useQuery(api.invites.getInviteByCode, { inviteCode });

    const respondToInvite = useMutation(api.invites.respondToInvite);

    const joinWorkspace = useMutation(api.invites.joinWorkspaceByInviteCode);

    const getWorkspaceName = useQuery(api.workspaces.getWorkspaceName,
        getInviteDetails?.workspaceId ? { _id: getInviteDetails.workspaceId } : 'skip');

    useEffect(() => {
        console.log('Session state:', session.status);
        console.log('Invite details:', getInviteDetails);
        console.log('Workspace name:', getWorkspaceName);

        if (getInviteDetails === undefined || session.status === 'loading') {
            // Still loading invite details or auth state
            return;
        }

        if (getInviteDetails === null) {
            // Invite not found
            setInviteStatus('error');
            setErrorMessage('Invite not found');
            return;
        }

        if (getInviteDetails.status !== 'pending') {
            // Invite already processed
            setInviteStatus(getInviteDetails.status as 'accepted' | 'rejected');
            return;
        }

        // Invite is pending
        setInviteStatus('pending');
    }, [getInviteDetails, session.status, getWorkspaceName]);

    useEffect(() => {
        if (getWorkspaceName) {
            setWorkspaceName(getWorkspaceName);
        }
    }, [getWorkspaceName]);

    async function handleJoinWorkspace() {
        if (!getInviteDetails || !inviteCode) {
            setInviteStatus('error');
            setErrorMessage('Invalid invite details');
            return;
        }

        try {
            const result = await joinWorkspace({ inviteCode });
            if (result.success) {
                setInviteStatus('accepted');
                router.push(`/dashboard/${getInviteDetails.workspaceId}`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setInviteStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(errorMessage);
            toast("Failed to join the workspace. Please try again.", {
                description: errorMessage,
            });
        }
    }

    function handleSignIn() {
        // Redirect to sign-in page, passing the invite code as a parameter
        router.push(`/sign-in?redirect=/invite/${inviteCode}`);
    }

    return (
        <>
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    {inviteStatus === 'loading' ? 'Processing Invitation...' :
                        inviteStatus === 'accepted' ? 'Welcome Aboard!' :
                            inviteStatus === 'rejected' ? 'Invitation Declined' :
                                inviteStatus === 'pending' ? 'Workspace Invitation' :
                                    'Invitation Error'}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {inviteStatus === 'loading' ? 'Please wait while we process your invitation.' :
                        inviteStatus === 'accepted' ? `You've successfully joined ${workspaceName}.` :
                            inviteStatus === 'rejected' ? "You've declined the invitation." :
                                inviteStatus === 'pending' ? `You've been invited to join ${workspaceName}.` :
                                    `There was an error processing your invitation: ${errorMessage}`}
                </p>
            </div>

            <div className='flex flex-col pt-8 max-w-xl'>
                <div className="space-y-4">
                    <div className="flex items-center bg-muted p-6 rounded-md">
                        {inviteStatus === 'accepted' && <CheckCircleIcon className="mr-4 w-12 h-12 text-primary" />}
                        {inviteStatus === 'rejected' && <XCircleIcon className="mr-4 w-12 h-12 text-destructive" />}
                        {(inviteStatus === 'loading' || inviteStatus === 'error') && <div className="border-4 border-primary mr-4 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>}
                        <div>
                            <h2 className="font-semibold text-xl">
                                {inviteStatus === 'loading' ? 'Processing' :
                                    inviteStatus === 'accepted' ? 'Invitation Accepted' :
                                        inviteStatus === 'rejected' ? 'Invitation Declined' :
                                            inviteStatus === 'pending' ? 'Invitation Pending' :
                                                'Invitation Error'}
                            </h2>
                            <p className="text-muted-foreground">
                                {inviteStatus === 'loading' ? 'Please wait while we confirm your invitation.' :
                                    inviteStatus === 'accepted' ? `You now have access to ${workspaceName}.` :
                                        inviteStatus === 'rejected' ? 'You have declined the invitation to join the workspace.' :
                                            inviteStatus === 'pending' ? 'Click the button below to join the workspace.' :
                                                `Error: ${errorMessage}`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {inviteStatus === 'pending' && (
                        session.status === 'authenticated' ? (
                            <Button onClick={handleJoinWorkspace}>Join Workspace</Button>
                        ) : (
                            <Button onClick={handleSignIn}>Sign In to Join</Button>
                        )
                    )}
                    {inviteStatus === 'accepted' && (
                        <Link href={`/dashboard/${getInviteDetails?.workspaceId}`}>
                            <Button>Go to Dashboard</Button>
                        </Link>
                    )}
                    {(inviteStatus === 'rejected' || inviteStatus === 'error') && (
                        <Link href="/">
                            <Button>Back to Home</Button>
                        </Link>
                    )}
                </div>
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                {inviteStatus === 'error' ? "If you continue to experience issues, please contact support." :
                    inviteStatus === 'accepted' ? "Need help getting started? Check out our user guide." :
                        inviteStatus === 'pending' ? "By joining, you agree to the workspace's terms and conditions." :
                            "Changed your mind? Contact the workspace admin for a new invitation."}
            </p>
        </>
    );
}