'use client'
import { FormEvent, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { CredentialsType, credentialsTypes } from '@/convex/types'
import { api } from '@/convex/_generated/api'
import { DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { SubmitButton } from '../global/submit-button'
import { Card } from '../ui/card'
import { crypto } from '@/lib/utils'

interface CredentialsRequestFormProps {
    setIsOpen: (isOpen: boolean) => void;
    onRequestCreated?: () => void;
    onDialogClose?: () => void;
}

interface CredentialsField {
    name: string;
    description: string;
    type: CredentialsType;
}

export function CredentialsRequestForm({ setIsOpen, onRequestCreated, onDialogClose }: CredentialsRequestFormProps) {
    const [description, setDescription] = useState('');
    const [credentials, setCredentials] = useState<CredentialsField[]>([{ name: '', description: '', type: 'password' }]);
    const [secretPhrase, setSecretPhrase] = useState('');

    const { slug } = useParams();

    const createCredentialsRequest = useMutation(api.credentials.createCredentialsRequest);
    const currentWorkspaceId = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: slug as string });

    function addCredential() {
        setCredentials([...credentials, { name: '', description: '', type: 'password' }]);
    }

    function removeCredential(index: number) {
        const newCredentials = [...credentials];
        newCredentials.splice(index, 1);
        setCredentials(newCredentials);
    }

    function updateCredential(index: number, field: Partial<CredentialsField>) {
        const newCredentials = [...credentials];
        newCredentials[index] = { ...newCredentials[index], ...field };
        setCredentials(newCredentials);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            if (!currentWorkspaceId) {
                toast.error('Failed to create credential request', { description: "Workspace id is undefined" });
                console.error('Error: Workspace id is undefined');
                return;
            }

            const secretKey = crypto.generateSecretKey(secretPhrase);
            const encryptedSecretKey = crypto.encrypt(secretKey, secretPhrase);

            const response = await createCredentialsRequest({
                workspaceId: currentWorkspaceId._id,
                description,
                credentials: credentials.map(cred => ({
                    name: cred.name,
                    description: cred.description,
                    type: cred.type,
                })),
                encryptedSecretKey: encryptedSecretKey,
            });

            const requestLink = `/requested/${response.requestId}?secretKey=${secretKey}`;

            console.log(requestLink);

            if (response.requestId) {
                toast.success('Credential request created successfully!');
                onRequestCreated && onRequestCreated();
                resetForm();
            } else {
                toast.error('Something went wrong.');
            }
        } catch (error) {
            toast.error('Failed to create credential request');
            console.error('Error:', error);
        }
    }

    function resetForm() {
        setDescription('');
        setCredentials([{ name: '', description: '', type: 'password' }]);
        setSecretPhrase('');
    }

    return (
        <form onSubmit={handleSubmit}>
            <ScrollArea className='bg-muted py-4 rounded-md h-[400px]'>
                {/* <div className="top-0 right-0 left-0 absolute bg-gradient-to-b from-background to-transparent mx-auto pt-10" /> */}
                <div className='space-y-4 px-4'>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Provide instructions or context for the credentials request'
                            required
                        />
                        <div>
                            <Label htmlFor="secretPhrase">Secret Phrase</Label>
                            <Input
                                className='bg-background'
                                id="secretPhrase"
                                type="password"
                                value={secretPhrase}
                                onChange={(e) => setSecretPhrase(e.target.value)}
                                placeholder='Enter a secret phrase to secure your credentials'
                                required
                            />
                        </div>
                    </div>
                    {credentials.map((cred, index) => (
                        <Card key={index} className="space-y-2 p-4 border rounded-md">
                            <div className="flex justify-between items-center">
                                <p>Credential {index + 1}</p>
                                {index > 0 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCredential(index)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <div>
                                <Label htmlFor={`cred-name-${index}`}>Credentials Name</Label>
                                <Input
                                    id={`cred-name-${index}`}
                                    value={cred.name}
                                    onChange={(e) => updateCredential(index, { name: e.target.value })}
                                    placeholder='e.g., API Key, Username'
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor={`cred-description-${index}`}>Credentials Description</Label>
                                <Input
                                    id={`cred-description-${index}`}
                                    value={cred.description}
                                    onChange={(e) => updateCredential(index, { description: e.target.value })}
                                    placeholder='Provide instructions for this credentials'
                                />
                            </div>
                            <div>
                                <Label htmlFor={`cred-type-${index}`}>Credential Type</Label>
                                <Select value={cred.type} onValueChange={(value) => updateCredential(index, { type: value as CredentialsType })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {credentialsTypes.map((credType) => (
                                            <SelectItem key={credType} value={credType}>
                                                {credType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    ))}
                    <div className="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-background to-transparent mx-auto pt-10" />
                </div>
            </ScrollArea>
            <div className='pt-2'>
                <Button type="button" variant="outline" onClick={addCredential} className="w-full">
                    <PlusIcon className="mr-2 w-4 h-4" /> Add Credentials
                </Button>
                <DialogFooter className='flex justify-between pt-4'>
                    <Button variant='secondary' type="button" onClick={() => {
                        setIsOpen(false);
                        onDialogClose && onDialogClose();
                    }}>Cancel</Button>
                    <SubmitButton text="Create Credentials Request" pendingText="Creating new request..." />
                </DialogFooter>
            </div>
        </form>
    )
}