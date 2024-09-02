"use client"
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api } from '../../../../../convex/_generated/api';
import { CreateCredentialDialog } from '@/components/credentials/create-credentials-dialog';
import { Id } from '../../../../../convex/_generated/dataModel';

export default function DashboardPage() {
    const session = useSession();
    const credentials = useQuery(api.queries.getCredentialsByUserId, {
        userId: session.data?.user?.id ?? ''
    });

    if (!session || !session.data || !session.data.user) {
        return <p>Loading session...</p>;
    }

    if (credentials === undefined) {
        return <p>Loading credentials...</p>;
    }

    function handleCredentialCreated(credentialId: Id<"credentials">) {
        console.log('New credential created:', credentialId);
    }

    return (
        <div>
            <h1>Your Credentials</h1>
            {credentials.length === 0 ? (
                <p>You haven&apos;t created any credentials yet.</p>
            ) : (
                <ul>
                    {credentials.map((cred) => (
                        <li key={cred.id}>
                            <Link href={`/credential/${cred.id}`}>
                                {cred.name} - {cred.type}
                            </Link>
                            <span> (Last updated: {new Date(cred.updatedAt).toLocaleString()})</span>
                        </li>
                    ))}
                </ul>
            )}
            <CreateCredentialDialog onCredentialCreated={handleCredentialCreated} />
        </div>
    );
}