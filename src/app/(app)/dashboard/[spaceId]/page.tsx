"use client"
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import { api } from '../../../../../convex/_generated/api';
import { CreateCredentialDialog } from '@/components/credentials/create-credentials-dialog';
import { Id } from '../../../../../convex/_generated/dataModel';
import LoadingScreen from '@/components/global/loading-screen';
import { CredentialCard } from '@/components/credentials/credential-card';

export default function DashboardPage() {
    const session = useSession();

    const credentials = useQuery(api.queries.getCredentialsByUserId, {
        userId: session.data?.user?.id ?? ''
    });

    if (credentials === undefined) return <LoadingScreen />

    if (!session || !session.data || !session.data.user) {
        return <LoadingScreen loadingText='Loading session...' />;
    }

    if (credentials === undefined) {
        return <LoadingScreen loadingText='Loading credentials...' />;
    }

    function handleCredentialCreated(credentialId: Id<"credentials">) {
        console.log('New credential created:', credentialId);
    }

    return (
        <div className='relative p-4 w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h1 className='font-bold text-2xl'>Your Credentials</h1>
                <CreateCredentialDialog onCredentialCreated={handleCredentialCreated} />
            </div>
            {credentials.length === 0 ? (
                <p>You haven&apos;t created any credentials yet.</p>
            ) : (
                <div className="grid grid-cols-1 border-border rounded-md overflow-hidden">
                    {credentials.map((cred) => (
                        <CredentialCard key={cred._id} credential={cred} />
                    ))}
                </div>
            )}
        </div>
    );
}