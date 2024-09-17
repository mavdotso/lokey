import { useState } from 'react';
import { CredentialsRequest, CredentialsType } from '@/convex/types';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { crypto } from '@/lib/utils';
import UserAvatar from '../global/user-avatar';
import { HashtagBadge } from './hashtag-badge';
import { KeyIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { RequestedCredentialsActions } from './requested-credentials-actions';
import { CredentialsDisplayDialog } from './credentials-display-dialog';

interface RequestedCredentialsCardProps {
    credentialsRequest: CredentialsRequest;
}

export interface DecryptedCredential {
    name: string;
    type: CredentialsType;
    description: string | undefined;
    value: string;
}

export function RequestedCredentialsCard({ credentialsRequest }: RequestedCredentialsCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCredentials, setSelectedCredentials] = useState<DecryptedCredential | null>(null);
    const [secretPhrase, setSecretPhrase] = useState('');
    const [decryptedCredentials, setDecryptedCredentials] = useState<DecryptedCredential[]>([]);
    const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);

    const rejectCredentialsRequest = useMutation(api.credentials.rejectCredentialsRequest);

    const updatedCredentialsRequest = useQuery(api.credentials.getCredentialsRequestById,
        { _id: credentialsRequest._id as Id<"credentialsRequests"> }
    );

    const creator = useQuery(
        api.users.getUser,
        credentialsRequest.createdBy ? { _id: credentialsRequest.createdBy } : "skip"
    );

    function getStatusColor(status: string) {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'fulfilled': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    async function handleViewCredentials(secretPhrase: string) {
        if (!secretPhrase) {
            console.log('Missing secret phrase');
            toast.error('Please enter the secret phrase to view the credentials');
            return;
        }

        try {
            const currentRequest = updatedCredentialsRequest || credentialsRequest;

            const privateKey = crypto.decryptPrivateKey(currentRequest.encryptedPrivateKey, secretPhrase);

            if (currentRequest.status === 'fulfilled') {
                const decrypted = currentRequest.credentials.map(cred => {
                    if (cred.encryptedValue) {
                        const decryptedValue = crypto.decryptWithPrivateKey(cred.encryptedValue, privateKey);
                        return {
                            name: cred.name,
                            type: cred.type,
                            description: cred.description,
                            value: decryptedValue
                        };
                    }
                    return null;
                }).filter((cred): cred is DecryptedCredential => cred !== null);

                setDecryptedCredentials(decrypted);
                setIsCredentialsDialogOpen(true);
            } else {
                console.log('Credentials not fulfilled');
                toast.error('Credentials have not been fulfilled yet');
            }
        } catch (error) {
            console.error('Decryption error:', error);
            toast.error('Failed to decrypt credentials. Please check your secret phrase.');
        }
    }

    function getCredentialTags() {
        return credentialsRequest.credentials.map(cred => cred.type);
    }

    const currentRequest = updatedCredentialsRequest || credentialsRequest;

    return (
        <>
            <div className="items-center gap-4 grid grid-cols-[repeat(4,minmax(0,1fr))] bg-card hover:bg-muted/50 p-4 border-b border-border last:border-b-0 text-xs transition-colors overflow-hidden group">
                <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-foreground text-sm truncate">{"Name here"}</span>
                    <span className="text-muted-foreground text-sm truncate">{currentRequest.description}</span>
                </div>
                <div className="flex flex-col justify-start space-y-2">
                    <div className="flex items-center gap-2 pl-1 text-md">
                        <div className={`w-2 h-2 rounded-full ${currentRequest.status === "fulfilled" ? 'bg-green-500 shadow-[0px_0px_5px_3px_rgba(34,197,_94,_0.15)]' :
                            currentRequest.status === "pending" ? 'bg-yellow-500 shadow-[0px_0px_5px_3px_rgba(234,179,_8,_0.15)]' :
                                'bg-red-500 shadow-[0px_0px_5px_3px_rgba(239,68,_68,_0.15)]'
                            }`}></div>
                        <span className='text-md capitalize'>{currentRequest.status}</span>
                    </div>
                    <div className="flex justify-start items-start gap-4 text-muted-foreground">
                        <div className='flex items-center gap-1'>
                            <KeyIcon className='w-4 h-4' />
                            <span>{currentRequest.credentials.length} credential(s)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <ScrollArea className="rounded-md max-w-full">
                        <div className="flex space-x-2 bg-muted/50 p-2 whitespace-nowrap">
                            {getCredentialTags().map((tag, index) => (
                                <HashtagBadge key={index} text={tag} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
                <div className="flex justify-end items-center space-x-2 text-muted-foreground">
                    <div className="flex items-center gap-4 ml-auto">
                        {creator && (
                            <div className='flex items-center gap-2'>
                                <span className="truncate whitespace-nowrap">by {creator.name || creator.email.split('@')[0]}</span>
                                <UserAvatar user={creator} />
                            </div>
                        )}
                        <RequestedCredentialsActions
                            credentialsRequest={credentialsRequest}
                            handleViewCredentials={handleViewCredentials}
                        />
                    </div>
                </div>
            </div>
            <CredentialsDisplayDialog
                isOpen={isCredentialsDialogOpen}
                setIsOpen={setIsCredentialsDialogOpen}
                decryptedCredentials={decryptedCredentials}
            />
        </>
    );
}