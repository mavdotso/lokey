'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Id } from '../../../convex/_generated/dataModel'

interface CreateSpaceFormProps {
    onSpaceCreated: (spaceId: Id<"spaces">) => void;
}

export function CreateSpaceForm({ onSpaceCreated }: CreateSpaceFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const createSpace = useMutation(api.mutations.createSpace)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            await createSpace({ title, iconId: 'default' })
            toast.success('Space created successfully!')
            setTitle('')
            setDescription('')
        } catch (error) {
            toast.error('Failed to create space')
            console.error('Error creating space:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                />
            </div>
            <Button type="submit">Create Space</Button>
        </form>
    )
}