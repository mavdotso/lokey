import { useState } from 'react';
import { CredentialsRequest, CredentialsType } from '@/convex/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { SharedCredentialsModal } from './shared-credentials';
import { Id } from '@/convex/_generated/dataModel';
import { crypto } from '@/lib/utils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RequestedCredentialsCardProps {
    credentialsRequest: CredentialsRequest;
}

interface DecryptedCredential {
    name: string;
    type: CredentialsType;
    description?: string;
    value: string;
}

export function RequestedCredentialsCard({ credentialsRequest }: RequestedCredentialsCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCredentials, setSelectedCredentials] = useState<DecryptedCredential | null>(null);
    const [secretPhrase, setSecretPhrase] = useState('');

    const rejectCredentialsRequest = useMutation(api.credentials.rejectCredentialsRequest);

    const updatedCredentialsRequest = useQuery(api.credentials.getCredentialsRequestById,
        { _id: credentialsRequest._id as Id<"credentialsRequests"> }
    );

    const handleReject = async () => {
        try {
            const result = await rejectCredentialsRequest({ requestId: credentialsRequest._id as Id<"credentialsRequests"> });
            if (result.success) {
                toast.success('Credential request rejected');
            } else {
                toast.error(result.message || 'Failed to reject credential request');
            }
        } catch (error) {
            toast.error('Failed to reject credential request');
            console.error('Error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'fulfilled': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const handleViewCredential = (index: number) => {
        if (!secretPhrase) {
            toast.error('Please enter the secret phrase to view the credential');
            return;
        }

        try {
            const currentRequest = updatedCredentialsRequest || credentialsRequest;
            const { privateKey } = crypto.generateKeyPair(secretPhrase);
            const decryptedPrivateKey = crypto.decrypt(currentRequest.privateKey, secretPhrase);

            if (currentRequest.status === 'fulfilled' && currentRequest.credentials[index].encryptedValue) {
                const decryptedValue = crypto.decrypt(
                    currentRequest.credentials[index].encryptedValue,
                    decryptedPrivateKey
                );
                setSelectedCredentials({
                    name: currentRequest.credentials[index].name,
                    type: currentRequest.credentials[index].type,
                    description: currentRequest.credentials[index].description,
                    value: decryptedValue
                });
                setIsModalOpen(true);
            } else {
                toast.error('Credentials have not been fulfilled yet');
            }
        } catch (error) {
            toast.error('Failed to decrypt credential. Please check your secret phrase.');
            console.error('Decryption error:', error);
        }
    };

    const currentRequest = updatedCredentialsRequest || credentialsRequest;

    return (
        <div className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Credential Request</h3>
                <Badge className={getStatusColor(currentRequest.status)}>
                    {currentRequest.status}
                </Badge>
            </div>
            <p className="mb-2 text-gray-600 text-sm">{currentRequest.description}</p>
            <div className="mb-2">
                <h4 className="font-semibold">Requested Credentials:</h4>
                <ul className="list-disc list-inside">
                    {currentRequest.credentials.map((cred, index) => (
                        <li key={index} className="text-sm">
                            {cred.name} ({cred.type})
                            {cred.description && `: ${cred.description}`}
                            {currentRequest.status === 'fulfilled' && 'encryptedValue' in cred && (
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
            {currentRequest.status === 'pending' && (
                <div className="flex justify-end space-x-2 mt-2">
                    <Button variant="outline" onClick={handleReject}>Reject</Button>
                    {/* <Button onClick={redirect(`/requested/${currentRequest._id}`)}>Fulfill</Button> */}
                </div>
            )}
            {currentRequest.status === 'fulfilled' && (
                <div className="mt-4">
                    <Label htmlFor={`secretPhrase-${credentialsRequest._id}`} className="block font-medium text-gray-700 text-sm">
                        Secret Phrase
                    </Label>
                    <Input
                        type="password"
                        id={`secretPhrase-${credentialsRequest._id}`}
                        value={secretPhrase}
                        onChange={(e) => setSecretPhrase(e.target.value)}
                        placeholder="Enter your secret phrase to view credentials"
                    />
                </div>
            )}
            {selectedCredentials && (
                <SharedCredentialsModal
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    credentials={selectedCredentials}
                />
            )}
        </div>
    );
}