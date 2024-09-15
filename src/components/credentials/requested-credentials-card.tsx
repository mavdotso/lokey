import { CredentialRequest } from '@/convex/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { CRUDCredentialsDialog } from './crud-credentials-dialog';

interface RequestedCredentialCardProps {
    credentialRequest: CredentialRequest;
}

export function RequestedCredentialCard({ credentialRequest }: RequestedCredentialCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fulfillCredentialRequest = useMutation(api.credentials.fulfillCredentialRequest);
    const rejectCredentialRequest = useMutation(api.credentials.rejectCredentialRequest);

    const handleFulfill = () => {
        setIsDialogOpen(true);
    };

    const handleReject = async () => {
        try {
            await rejectCredentialRequest({ requestId: credentialRequest._id! });
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

    // const handleCredentialsCreated = () => {
    //     fulfillCredentialRequest({ requestId: credentialRequest._id!, credentials: {} })
    //         .then(() => {
    //             toast.success('Credential request fulfilled');
    //             setIsDialogOpen(false);
    //         })
    //         .catch((error) => {
    //             toast.error('Failed to fulfill credential request');
    //             console.error('Error:', error);
    //         });
    // };

    return (
        <div className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{credentialRequest.type}</h3>
                <Badge className={getStatusColor(credentialRequest.status)}>{credentialRequest.status}</Badge>
            </div>
            <p className="mb-2 text-gray-600 text-sm">{credentialRequest.description}</p>
            <div className="mb-2">
                <h4 className="font-semibold">Requested Fields:</h4>
                <ul className="list-disc list-inside">
                    {credentialRequest.fields.map((field, index) => (
                        <li key={index} className="text-sm">
                            {field.name}{field.description && `: ${field.description}`}
                        </li>
                    ))}
                </ul>
            </div>
            {credentialRequest.status === 'pending' && (
                <div className="flex justify-end space-x-2 mt-2">
                    <Button variant="outline" onClick={handleReject}>Reject</Button>
                    <Button onClick={handleFulfill}>Fulfill</Button>
                </div>
            )}
            {/* <CRUDCredentialsDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                onCredentialsCreated={handleCredentialsCreated}
            /> */}
        </div>
    );
}