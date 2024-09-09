import { CredentialCard } from '@/components/credentials/credential-card';
import { Credentials } from '@/convex/types';

interface CredentialsListProps {
    credentials: Array<Credentials>;
}

export function CredentialsList({ credentials }: CredentialsListProps) {
    return (
        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
            {credentials.map((cred) => (
                <CredentialCard key={cred._id} credentials={cred} />
            ))}
        </div>
    );
}
