import { useState } from 'react';
import { CredentialsRequest } from '@/convex/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { SharedCredentialsModal } from './shared-credentials';

interface RequestedCredentialsCardProps {
    credentialsRequest: CredentialsRequest;
}

export function RequestedCredentialsCard({ credentialsRequest }: RequestedCredentialsCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState<number | null>(null);
    const rejectCredentialRequest = useMutation(api.credentials.rejectCredentialRequest);

    const updatedCredentialRequest = useQuery(api.credentials.getCredentialsRequestById,
        { _id: credentialsRequest._id }
    );

    const handleReject = async () => {
        try {
            await rejectCredentialRequest({ requestId: credentialsRequest._id });
            toast.success('Credential request rejected');
        } catch (error) {
            toast.error('Failed to reject credential request');
            console.error('Error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'fulfilled':
                return 'bg-green-500';
            case 'rejected':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleViewCredential = (index: number) => {
        setSelectedCredential(index);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Credential Request</h3>
                <Badge className={getStatusColor(updatedCredentialRequest?.status || credentialRequest.status)}>
                    {updatedCredentialRequest?.status || credentialRequest.status}
                </Badge>
            </div>
            <p className="mb-2 text-gray-600 text-sm">{credentialRequest.description}</p>
            <div className="mb-2">
                <h4 className="font-semibold">Requested Credentials:</h4>
                <ul className="list-disc list-inside">
                    {credentialRequest.credentials.map((cred, index) => (
                        <li key={index} className="text-sm">
                            {cred.name} ({cred.type})
                            {cred.description && `: ${cred.description}`}
                            {updatedCredentialRequest?.status === 'fulfilled' && (
                                <Button
                                    variant="link"
                                    className="ml-2"
                                    onClick={() => handleViewCredential(index)}
                                >
                                    View
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {updatedCredentialRequest?.status === 'pending' && (
                <div className="flex justify-end space-x-2 mt-2">
                    <Button variant="outline" onClick={handleReject}>Reject</Button>
                    <Button as="a" href={`/requested/${credentialRequest._id}`}>Fulfill</Button>
                </div>
            )}
            {selectedCredential !== null && updatedCredentialRequest && (
                <SharedCredentialsModal
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    credential={updatedCredentialRequest.credentials[selectedCredential]}
                />
            )}
        </div>
    );
}