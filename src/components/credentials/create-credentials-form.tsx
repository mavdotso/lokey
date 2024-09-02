import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useParams } from 'next/navigation'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Id } from '../../../convex/_generated/dataModel'
import { Credential } from '../../../convex/types'

interface CreateCredentialFormProps {
    onCredentialCreated: (credentialId: Id<"credentials">) => void;
}

export function CreateCredentialForm({ onCredentialCreated }: CreateCredentialFormProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<Credential['type']>('password')
    const [data, setData] = useState('')

    const params = useParams()
    const currentSpaceId = params.spaceId as Id<"spaces">

    const createCredential = useMutation(api.mutations.createCredential)

    // Define credential types based on the Credential type
    const credentialTypes: Credential['type'][] = [
        'password', 'login_password', 'api_key', 'oauth_token', 'ssh_key',
        'ssl_certificate', 'env_variable', 'database_credential', 'access_key',
        'encryption_key', 'jwt_token', 'two_factor_secret', 'webhook_secret',
        'smtp_credential', 'ftp_credential', 'vpn_credential', 'dns_credential',
        'device_key', 'key_value', 'custom', 'other'
    ]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const { credentialId } = await createCredential({
                spaceId: currentSpaceId,
                name,
                description,
                type,
                data
            })
            toast.success('Credential created successfully!')
            onCredentialCreated(credentialId)
            // Clear form fields
            setName('')
            setDescription('')
            setType('password')
            setData('')
        } catch (error) {
            toast.error('Failed to create credential')
            console.error('Error creating credential:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => setType(value as Credential['type'])}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        {credentialTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="data">Data</Label>
                <Textarea
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                />
            </div>
            <Button type="submit">Create Credential</Button>
        </form>
    )
}