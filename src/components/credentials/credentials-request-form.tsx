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

interface CredentialRequestFormProps {
    setIsOpen: (isOpen: boolean) => void;
    onRequestCreated?: () => void;
    onDialogClose?: () => void;
}

interface CredentialField {
    name: string;
    description: string;
    type: CredentialsType;
}

export function CredentialRequestForm({ setIsOpen, onRequestCreated, onDialogClose }: CredentialRequestFormProps) {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<CredentialField[]>([{ name: '', description: '', type: 'password' }]);

    const { slug } = useParams();

    const createCredentialRequest = useMutation(api.credentials.createCredentialRequest);
    const currentWorkspaceId = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: slug as string });

    function addField() {
        setFields([...fields, { name: '', description: '', type: 'password' }]);
    }

    function removeField(index: number) {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    }

    function updateField(index: number, field: Partial<CredentialField>) {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...field };
        setFields(newFields);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            if (!currentWorkspaceId) {
                toast.error('Failed to create credential request', { description: "Workspace id is undefined" });
                console.error('Error: Workspace id is undefined');
                return;
            }

            const response = await createCredentialRequest({
                workspaceId: currentWorkspaceId._id,
                type: fields[0].type, // Use the first field's type as the main type
                description,
                fields: fields.map(field => ({ name: field.name, description: field.description })),
            });

            if (response.credentialRequestId) {
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
        setName('');
        setDescription('');
        setFields([{ name: '', description: '', type: 'password' }]);
    }

    return (
        <form onSubmit={handleSubmit} className='overflow-auto'>
            <ScrollArea className='h-[400px]'>
                <div className='space-y-4 px-4 py-2'>
                    <div>
                        <Label htmlFor="name">Request Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Credential request name'
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Provide instructions or context for the credential request'
                            required
                        />
                    </div>
                    {fields.map((field, index) => (
                        <div key={index} className="space-y-2 p-4 border rounded-md">
                            <div className="flex justify-between items-center">
                                <p>Field {index + 1}</p>
                                {index > 0 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <div>
                                <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                                <Input
                                    id={`field-name-${index}`}
                                    value={field.name}
                                    onChange={(e) => updateField(index, { name: e.target.value })}
                                    placeholder='e.g., API Key, Username'
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor={`field-description-${index}`}>Field Description</Label>
                                <Input
                                    id={`field-description-${index}`}
                                    value={field.description}
                                    onChange={(e) => updateField(index, { description: e.target.value })}
                                    placeholder='Provide instructions for this field'
                                />
                            </div>
                            <div>
                                <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                                <Select value={field.type} onValueChange={(value) => updateField(index, { type: value as CredentialsType })}>
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
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className='pt-2'>
                <Button type="button" variant="outline" onClick={addField} className="w-full">
                    <PlusIcon className="mr-2 w-4 h-4" /> Add Field
                </Button>
                <DialogFooter className='flex justify-between pt-4'>
                    <Button variant='secondary' type="button" onClick={() => {
                        setIsOpen(false);
                        onDialogClose && onDialogClose();
                    }}>Cancel</Button>
                    <Button type="submit">Create Credential Request</Button>
                </DialogFooter>
            </div>
        </form>
    )
}