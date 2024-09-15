import { CredentialRequest } from '@/convex/types';
import { RequestedCredentialCard } from './requested-credentials-card';

interface RequestedCredentialsListProps {
    credentialRequests: Array<CredentialRequest>;
}

export function RequestedCredentialsList({ credentialRequests }: RequestedCredentialsListProps) {
    return (
        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
            {credentialRequests.map((request) => (
                <RequestedCredentialCard key={request._id} credentialRequest={request} />
            ))}
        </div>
    );
}