import { CredentialsRequest } from '@/convex/types';
import { RequestedCredentialsCard } from '@/components/credentials/requested/requested-credentials-card';
import { CredentialsCard } from '../credentials-card';

interface RequestedCredentialsListProps {
    credentialsRequests: Array<CredentialsRequest>;
}

export function RequestedCredentialsList({ credentialsRequests }: RequestedCredentialsListProps) {
    return (
        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
            {credentialsRequests.map((req) => (
                <CredentialsCard
                    key={req._id}
                    item={req}
                    type="request"
                />
            ))}
        </div>
    );
}