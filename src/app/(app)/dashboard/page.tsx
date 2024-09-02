"use client"
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api } from '../../../../convex/_generated/api';
import { CreateCredentialDialog } from '@/components/credentials/create-credentials-dialog';
import { Id } from '../../../../convex/_generated/dataModel';

export default function DashboardPage() {
    const session = useSession();

    if (!session || !session.data || !session.data.user) return

    const credentials = useQuery(api.queries.getCredentialsByUserId, { userId: session.data.user.id! });

    if (!credentials) {
        return <p>Loading...</p>;
    }

    const handleCredentialCreated = (credentialId: Id<"credentials">) => {
        // Handle newly created credential, e.g., refresh the list of credentials
        console.log('New credential created:', credentialId);
        // You might want to refetch the credentials list here
    }

    return (
        <div>
            <h1>Your Credentials</h1>
            {credentials.length === 0 ? (
                <p>You haven't created any credentials yet.</p>
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