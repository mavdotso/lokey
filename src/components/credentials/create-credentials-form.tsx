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
import { Credentials, credentialsTypes } from '../../../convex/types'
import { DatePicker } from '../global/date-picker'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

interface CreateCredentialsFormProps {
    onCredentialsCreated: (credentialId: Id<"credentials">) => void;
}

export function CreateCredentialsForm({ onCredentialsCreated }: CreateCredentialsFormProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<Credentials['type']>('password')
    const [data, setData] = useState('')
    const [expiresAt, setExpiresAt] = useState<Date | undefined>()
    const [maxViews, setMaxViews] = useState<number>(1)
    const [showData, setShowData] = useState(false)

    const params = useParams()
    const currentSpaceId = params.spaceId as Id<"workspaces">

    const createCredentials = useMutation(api.credentials.createCredentials)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const { credentialsId } = await createCredentials({
                workspaceId: currentSpaceId,
                name,
                description,
                type,
                data,
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                maxViews
            })
            toast.success('Credentials created successfully!')
            onCredentialsCreated(credentialsId)
            setName('')
            setDescription('')
            setType('password')
            setData('')
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
                        placeholder='Credentialss name'
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
            <div>
                <Label htmlFor="data">Credentialss</Label>
                <div className="relative">
                    <Input
                        id="data"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        required
                        type={showData ? "text" : "password"}
                        placeholder='Put your sensitive data here'
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="top-0 right-0 absolute h-full"
                        onClick={() => setShowData(!showData)}
                    >
                        {showData ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
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