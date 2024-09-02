'use client'

import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Id } from '../../../convex/_generated/dataModel'

export function CreateSpaceForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newSpaceId, setNewSpaceId] = useState<Id<"spaces"> | null>(null)
    const createSpace = useMutation(api.mutations.createSpace)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const { spaceId } = await createSpace({ title, iconId: 'default' })
            toast.success('Space created successfully!')
            setNewSpaceId(spaceId)
        } catch (error) {
            toast.error('Failed to create space')
            console.error('Error creating space:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (newSpaceId) {
            router.push(`/dashboard/${newSpaceId}`)
        }
    }, [newSpaceId, router])

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create New Space</CardTitle>
                <CardDescription>Fill in the details to create a new space</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Space'}
                </Button>
            </CardFooter>
        </Card>
    )
}