import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DatePicker } from '@/components/global/date-picker'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import { Credentials, credentialsTypes } from '@/convex/types'
import { api } from '@/convex/_generated/api'

const credentialFields = {
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

interface CreateCredentialsFormProps {
    onCredentialsCreated: (credentialId: Id<"credentials">) => void;
}

export function CreateCredentialsForm({ onCredentialsCreated }: CreateCredentialsFormProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<Credentials['type']>('password')
    const [data, setData] = useState<{ [key: string]: string }>({})
    const [expiresAt, setExpiresAt] = useState<Date | undefined>()
    const [maxViews, setMaxViews] = useState<number>(1)
    const [showData, setShowData] = useState<{ [key: string]: boolean }>({});

    const params = useParams()

    const currentWorkspaceSlug = params.slug

    const createCredentials = useMutation(api.credentials.createCredentials)
    const currentWorkspaceId = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: currentWorkspaceSlug as string })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            if (!currentWorkspaceId) {
                toast.error('Failed to create credential');
                console.error('Error creating credential: Workspace id is undefined');
                return;
            }
            const { credentialsId } = await createCredentials({
                workspaceId: currentWorkspaceId._id,
                name,
                description,
                type,
                data: JSON.stringify(data),
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                maxViews
            })
            toast.success('Credentials created successfully!')
            onCredentialsCreated(credentialsId)
            setName('')
            setDescription('')
            setType('password')
            setData({})
            setExpiresAt(undefined)
            setMaxViews(1)
        } catch (error) {
            toast.error('Failed to create credential')
            console.error('Error creating credential:', error)
        }
    }

    return (
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
                    <Select value={type} onValueChange={(value) => setType(value as Credentials['type'])}>
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
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="top-0 right-0 absolute h-full"
                            onClick={() => setShowData({ ...showData, [field.id]: !showData[field.id] })}
                        >
                            {showData[field.id] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            ))}
            <div className='flex gap-2'>
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

            <Button type="submit">Create Credentials</Button>
        </form>
    )
}