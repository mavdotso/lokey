'use client'
import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DatePicker } from '@/components/global/date-picker'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Credentials, credentialsTypes } from '@/convex/types'
import { api } from '@/convex/_generated/api'
import { encryptData, generateShareLink } from '@/lib/utils'
import { CopyCredentialsLink } from '@/components/credentials/copy-credentials-link'
import { DialogFooter } from '@/components/ui/dialog'
import { Id } from '@/convex/_generated/dataModel'

export const credentialFields = {
    password: [{ id: 'password', label: 'Password', type: 'password' }],
    login_password: [
        { id: 'username', label: 'Username', type: 'text' },
        { id: 'password', label: 'Password', type: 'password' }
    ],
    api_key: [{ id: 'apiKey', label: 'API Key', type: 'text' }],
    oauth_token: [{ id: 'oauthToken', label: 'OAuth Token', type: 'text' }],
    ssh_key: [{ id: 'sshKey', label: 'SSH Key', type: 'text' }],
    ssl_certificate: [
        { id: 'certificate', label: 'Certificate', type: 'text' },
        { id: 'privateKey', label: 'Private Key', type: 'text' }
    ],
    env_variable: [{ id: 'envVariable', label: 'Environment Variable', type: 'text' }],
    database_credentials: [
        { id: 'dbUsername', label: 'DB Username', type: 'text' },
        { id: 'dbPassword', label: 'DB Password', type: 'password' }
    ],
    access_key: [{ id: 'accessKey', label: 'Access Key', type: 'text' }],
    encryption_key: [{ id: 'encryptionKey', label: 'Encryption Key', type: 'text' }],
    jwt_token: [{ id: 'jwtToken', label: 'JWT Token', type: 'text' }],
    two_factor_secret: [{ id: 'twoFactorSecret', label: 'Two-Factor Secret', type: 'text' }],
    webhook_secret: [{ id: 'webhookSecret', label: 'Webhook Secret', type: 'text' }],
    smtp_credentials: [
        { id: 'smtpUsername', label: 'SMTP Username', type: 'text' },
        { id: 'smtpPassword', label: 'SMTP Password', type: 'password' }
    ],
    ftp_credentials: [
        { id: 'ftpUsername', label: 'FTP Username', type: 'text' },
        { id: 'ftpPassword', label: 'FTP Password', type: 'password' }
    ],
    vpn_credentials: [
        { id: 'vpnUsername', label: 'VPN Username', type: 'text' },
        { id: 'vpnPassword', label: 'VPN Password', type: 'password' }
    ],
    dns_credentials: [
        { id: 'dnsUsername', label: 'DNS Username', type: 'text' },
        { id: 'dnsPassword', label: 'DNS Password', type: 'password' }
    ],
    device_key: [{ id: 'deviceKey', label: 'Device Key', type: 'text' }],
    key_value: [
        { id: 'key', label: 'Key', type: 'text' },
        { id: 'value', label: 'Value', type: 'text' }
    ],
    custom: [{ id: 'customField', label: 'Custom Field', type: 'text' }],
    other: [{ id: 'otherField', label: 'Other Field', type: 'text' }]
};

interface CRUDCredentialsFormProps {
    setIsOpen: (isOpen: boolean) => void;
    editId?: Id<"credentials">;
    existingData?: Credentials;
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
}

export function CRUDCredentialsForm({ setIsOpen, editId, existingData, onCredentialsCreated, onCredentialsUpdated, onDialogClose }: CRUDCredentialsFormProps) {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<Credentials['type']>('password');
    const [data, setData] = useState<{ [key: string]: string }>({});
    const [expiresAt, setExpiresAt] = useState<Date | undefined>();
    const [maxViews, setMaxViews] = useState<number>(1);
    const [showData, setShowData] = useState<{ [key: string]: boolean }>({});
    const [showPopup, setShowPopup] = useState(false);
    const [sharedLink, setSharedLink] = useState('');

    const { slug } = useParams();

    const createCredentials = useMutation(api.credentials.createCredentials);
    const editCredentials = useMutation(api.credentials.editCredentials);
    const currentWorkspaceId = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: slug as string });

    useEffect(() => {
        if (existingData) {
            setName(existingData.name);
            setDescription(existingData.description || '');
            setType(existingData.type);
            setExpiresAt(existingData.expiresAt ? new Date(existingData.expiresAt) : undefined);
            setMaxViews(existingData.maxViews ? existingData.maxViews : 1);
        }
    }, [existingData]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            if (!currentWorkspaceId) {
                toast.error(`Failed to ${editId != undefined ? `update` : `create`}  credentials`, { description: "Workspace id is undefined" });
                console.error('Error: Workspace id is undefined');
                return;
            }

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
                    onDialogClose && onDialogClose();
                } else {
                    toast.error('Something went wrong ', { description: "Please, try again"});
                }
            } else {
                const { publicKey, privateKey, encryptedData } = encryptData(JSON.stringify(data));

                const { credentialsId } = await createCredentials({
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
                    toast.success('Credentials created successfully!');
                    const shareLink = generateShareLink(credentialsId, publicKey);
                    setSharedLink(shareLink);
                    setShowPopup(true);
                } else {
                    toast.error('Something went wrong.');
                }
            }

            resetForm()
        } catch (error) {
            toast.error(`Failed to ${editId ? `update` : `create`}  credentials`);
            console.error('Error:', error);
        }
    }

    function resetForm() {
        setName('');
        setDescription('');
        setType('password');
        setData({});
        setExpiresAt(undefined);
        setMaxViews(1);
    }

    return (
        !showPopup ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Select value={type} onValueChange={(value) => setType(value as Credentials['type'])} disabled={editId != undefined}>
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
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Only for internal reference'
                    />
                </div>
                {credentialFields[type].map((field) => (
                    <div key={field.id}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <div className="relative">
                            <Input
                                id={field.id}
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
                        <DatePicker
                            date={expiresAt}
                            onDateChange={setExpiresAt}
                        />
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
                <DialogFooter className='flex justify-between'>
                    <Button variant='secondary' type="button" onClick={
                        () => {
                            setIsOpen(false);
                            onDialogClose && onDialogClose();
                        }
                    }>Close</Button>
                    <Button type="submit">{editId != undefined ? 'Update Credentials' : 'Create Credentials'}</Button>
                </DialogFooter>
            </form>
        ) : (
            <>
                <CopyCredentialsLink credentialsLink={sharedLink} />
                <DialogFooter>
                    <Button variant='secondary' type="button" onClick={
                        () => {
                            setIsOpen(false);
                            onDialogClose && onDialogClose();
                        }}>Close</Button>
                    <Button onClick={() => setShowPopup(false)}>Create another</Button>
                </DialogFooter>
            </>
        )
    )
}