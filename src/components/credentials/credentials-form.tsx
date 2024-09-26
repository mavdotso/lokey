import { FormEvent, useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DatePicker } from '@/components/global/date-picker'
import { EyeIcon, EyeOffIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Credentials, CredentialsType } from '@/convex/types'
import { api } from '@/convex/_generated/api'
import { encryptData, generateShareLink, crypto, getURL } from '@/lib/utils'
import { CopyCredentialsLink } from '@/components/credentials/copy-credentials-link'
import { DialogFooter } from '@/components/ui/dialog'
import { Id } from '@/convex/_generated/dataModel'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { credentialsFields } from '@/lib/config/credentials-fields'
import { CREDENTIALS_TYPES } from '@/convex/schema'
import { fetchAction } from 'convex/nextjs'

interface CredentialsFormProps {
    setIsOpen: (isOpen: boolean) => void;
    editId?: Id<"credentials">;
    existingData?: Credentials;
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
    formType: 'new' | 'request';
}

export function CredentialsForm({ setIsOpen, editId, existingData, onCredentialsCreated, onCredentialsUpdated, onDialogClose, formType }: CredentialsFormProps) {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<CredentialsType>('PASSWORD');
    const [data, setData] = useState<{ [key: string]: string }>({});
    const [expiresAt, setExpiresAt] = useState<Date | undefined>();
    const [maxViews, setMaxViews] = useState<number>(1);
    const [showData, setShowData] = useState<{ [key: string]: boolean }>({});
    const [showPopup, setShowPopup] = useState(false);
    const [sharedLink, setSharedLink] = useState('');
    const [secretPhrase, setSecretPhrase] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [credentials, setCredentials] = useState<Array<{ name: string; description: string; type: CredentialsType }>>(
        formType === 'request' ? [{ name: '', description: '', type: 'PASSWORD' }] : []
    );

    const { slug } = useParams();

    const editCredentials = useMutation(api.credentials.editCredentials);
    const createCredentialsRequest = useMutation(api.credentials.createCredentialsRequest);
    const currentWorkspaceId = useQuery(api.workspaces.getWorkspaceBySlug, { slug: slug as string });

    useEffect(() => {
        if (existingData) {
            setName(existingData.name);
            setDescription(existingData.description || '');
            setType(existingData.type);
            setExpiresAt(existingData.expiresAt ? new Date(existingData.expiresAt) : undefined);
            setMaxViews(existingData.maxViews ? existingData.maxViews : 1);
        }
    }, [existingData]);

    function addCredential() {
        setCredentials([...credentials, { name: '', description: '', type: 'PASSWORD' }]);
    }

    function removeCredential(index: number) {
        const newCredentials = [...credentials];
        newCredentials.splice(index, 1);
        setCredentials(newCredentials);
    }

    function updateCredential(index: number, field: Partial<{ name: string; description: string; type: CredentialsType }>) {
        const newCredentials = [...credentials];
        newCredentials[index] = { ...newCredentials[index], ...field };
        setCredentials(newCredentials);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            if (!currentWorkspaceId) {
                toast.error(`Failed to ${editId ? 'update' : 'create'} credentials`, { description: "Workspace id is undefined" });
                console.error('Error: Workspace id is undefined');
                return;
            }

            if (formType === 'new') {
                if (editId) {
                    const response = await editCredentials({
                        _id: editId,
                        updates: {
                            name,
                            description,
                            expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                            maxViews
                        }
                    });
                    if (response.success) {
                        toast.success('Credentials were updated successfully');
                        onCredentialsUpdated && onCredentialsUpdated();
                        handleClose();
                    } else {
                        toast.error('Something went wrong ', { description: "Please, try again" });
                    }
                } else {
                    const { publicKey, privateKey, encryptedData } = encryptData(JSON.stringify(data));

                    const credentialsId = await fetchAction(api.credentials.newCredentials, {
                        workspaceId: currentWorkspaceId._id,
                        name,
                        description,
                        type,
                        encryptedData,
                        privateKey,
                        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                        maxViews
                    });

                    if (credentialsId) {
                        const shareLink = generateShareLink(credentialsId, publicKey);
                        setSharedLink(shareLink);
                        setIsCompleted(true);
                        onCredentialsCreated && onCredentialsCreated();
                    } else {
                        toast.error('Something went wrong.');
                    }
                }
            } else if (formType === 'request') {
                const { publicKey, privateKey } = crypto.generateKeyPair();
                const encryptedPrivateKey = crypto.encryptPrivateKey(privateKey, secretPhrase);
                const encodedPublicKey = crypto.encodePublicKey(publicKey);

                const response = await createCredentialsRequest({
                    workspaceId: currentWorkspaceId._id,
                    name,
                    description,
                    credentials: credentials.map(cred => ({
                        name: cred.name,
                        description: cred.description,
                        type: cred.type,
                    })),
                    encryptedPrivateKey,
                });

                if (response.requestId) {
                    const requestLink = `${getURL()}/requested/${response.requestId}?publicKey=${encodedPublicKey}`;
                    setSharedLink(requestLink);
                    setIsCompleted(true);
                    onCredentialsCreated && onCredentialsCreated();
                } else {
                    toast.error('Something went wrong.');
                }
            }

        } catch (error) {
            toast.error(`Failed to ${editId ? 'update' : 'create'} credentials`);
            console.error('Error:', error);
        }
    }

    function resetForm() {
        setName('');
        setDescription('');
        setType('PASSWORD');
        setData({});
        setExpiresAt(undefined);
        setMaxViews(1);
        setCredentials([]);
        setSecretPhrase('');
    }

    function handleClose() {
        setIsOpen(false);
        setShowPopup(false);
        onDialogClose && onDialogClose();
    }

    function handleCreateAnother() {
        setIsCompleted(false);
        resetForm();
    }

    const renderNewCredentialsForm = () => (
        <>
            {credentialsFields[type].map((field, index) => (
                <div key={field.id}>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <div className="relative">
                        <Input
                            id={field.id + index}
                            type={showData[field.id] ? 'text' : 'password'}
                            value={data[field.id] || ''}
                            onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                            required
                            placeholder={`Enter ${field.label}`}
                            disabled={editId != undefined}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="top-0 right-0 absolute h-full"
                            onClick={() => setShowData({ ...showData, [field.id]: !showData[field.id] })}
                            disabled={editId != undefined}
                        >
                            {showData[field.id] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            ))}
            <div className='flex gap-2 w-full'>
                <div>
                    <Label htmlFor="expiresAt">Expiration</Label>
                    <DatePicker date={expiresAt} onDateChange={setExpiresAt} />
                </div>
                <div>
                    <Label htmlFor="maxViews">Views limit</Label>
                    <Input
                        id="maxViews"
                        type="number"
                        value={maxViews}
                        min={1}
                        onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : 1)}
                    />
                </div>
            </div>
        </>
    )

    const renderCredentialRequestForm = () => (
        <>
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
            <ScrollArea className='bg-muted my-4 rounded-md'>
                <div className='px-4 max-h-[30vh]'>
                    {credentials.map((cred, index) => (
                        <Card key={index} className="space-y-2 my-4 p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-sm">Credential {index + 1}</h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCredential(index)}
                                    className="w-8 h-8"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </Button>
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
                                        {Object.entries(CREDENTIALS_TYPES).map(([credType, credTypeValue]) => (
                                            <SelectItem key={credType} value={credTypeValue}>
                                                {credentialsFields[credTypeValue].map(field => field.label).join(' / ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
            <Button type="button" variant="outline" onClick={addCredential} className="w-full">
                <PlusIcon className="mr-2 w-4 h-4" /> Add Credentials
            </Button>
        </>
    )

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formType === 'new' && (
                <div className='flex gap-2'>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Credential name'
                            required
                        />
                    </div>
                    <div className='flex-1'>
                        <Label htmlFor="type">Credentials type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as CredentialsType)} disabled={editId != undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CREDENTIALS_TYPES).map(([credType, credTypeValue]) => (
                                    <SelectItem key={credType} value={credTypeValue}>
                                        {credentialsFields[credTypeValue].map(field => field.label).join(' / ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            <div>
                {formType === 'request' && (
                    <>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="formName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Form name'
                            required
                        />
                    </>
                )}
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={formType === 'new' ? 'Only for internal reference' : 'Provide instructions or context for the credentials request'}
                    required
                />
            </div>
            {formType === 'new' ? renderNewCredentialsForm() : renderCredentialRequestForm()}
            <DialogFooter className='flex justify-between'>
                <Button variant='secondary' type="button" onClick={handleClose}>Close</Button>
                <Button type="submit">{editId ? 'Update Credentials' : formType === 'new' ? 'Create Credentials' : 'Create Credentials Request'}</Button>
            </DialogFooter>
        </form>
    )

    return (
        !isCompleted ? renderForm() : (
            <>
                <CopyCredentialsLink credentialsLink={sharedLink} />
                <DialogFooter>
                    <Button variant='secondary' type="button" onClick={handleClose}>Close</Button>
                    <Button onClick={handleCreateAnother}>Create another</Button>
                </DialogFooter>
            </>
        )
    )
}