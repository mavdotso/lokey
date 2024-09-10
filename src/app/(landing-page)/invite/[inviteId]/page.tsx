'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

export default function InvitePage() {
    const [inviteStatus, setInviteStatus] = useState<'loading' | 'accepted' | 'rejected' | 'error'>('loading');
    const [workspaceName, setWorkspaceName] = useState('');
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get('code');
    const getInviteDetails = useQuery(api.invites.getInviteByCode, { inviteCode: inviteCode || '' });
    const respondToInvite = useMutation(api.invites.respondToInvite);

    useEffect(() => {
        if (getInviteDetails) {
            if (getInviteDetails.status === 'pending') {
                handleInviteResponse('accepted');
            } else {
                setInviteStatus('error');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getInviteDetails]);

    async function handleInviteResponse(response: 'accepted' | 'rejected') {
        if (!getInviteDetails || !getInviteDetails._id) {
            setInviteStatus('error');
            return;
        }

        try {
            const result = await respondToInvite({
                inviteId: getInviteDetails._id,
                response
            });
            if (result.success) {
                setInviteStatus(response);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setInviteStatus('error');
            toast.error("Failed to process the invitation. Please try again.");
        }
    }

    return (
        <>
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    {inviteStatus === 'loading' ? 'Processing Invitation...' :
                        inviteStatus === 'accepted' ? 'Welcome Aboard!' :
                            inviteStatus === 'rejected' ? 'Invitation Declined' :
                                'Invitation Error'}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {inviteStatus === 'loading' ? 'Please wait while we process your invitation.' :
                        inviteStatus === 'accepted' ? `You've successfully joined ${workspaceName}.` :
                            inviteStatus === 'rejected' ? "You've declined the invitation." :
                                'There was an error processing your invitation.'}
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
                                            'Invitation Error'}
                            </h2>
                            <p className="text-muted-foreground">
                                {inviteStatus === 'loading' ? 'Please wait while we confirm your invitation.' :
                                    inviteStatus === 'accepted' ? `You now have access to ${workspaceName}.` :
                                        inviteStatus === 'rejected' ? 'You have declined the invitation to join the workspace.' :
                                            'We encountered an error while processing your invitation.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Link href="/dashboard">
                        <Button>{inviteStatus === 'accepted' ? 'Go to Dashboard' : 'Back to Home'}</Button>
                    </Link>
                </div>
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                {inviteStatus === 'error' ? "If you continue to experience issues, please contact support." :
                    inviteStatus === 'accepted' ? "Need help getting started? Check out our user guide." :
                        "Changed your mind? Contact the workspace admin for a new invitation."}
            </p>
        </>
    );
}