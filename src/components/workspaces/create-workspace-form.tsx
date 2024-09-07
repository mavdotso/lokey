'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Id } from '../../../convex/_generated/dataModel'
import { Info, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'


export function CreateWorkspaceForm() {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSlugUnique, setIsSlugUnique] = useState(true)
    const [slugMessage, setSlugMessage] = useState('')
    const [newWorkspaceId, setNewWorkspaceId] = useState<Id<"workspaces"> | null>(null)
    const createWorkspace = useMutation(api.workspaces.createWorkspace)
    const isUnique = useQuery(api.workspaces.isSlugUnique, { slug })
    const router = useRouter()

    useEffect(() => {
        const handler = setTimeout(() => {
            if (slug) {
                if (isUnique !== undefined) {
                    setIsSlugUnique(isUnique)
                    setSlugMessage(isUnique ? 'Slug is available' : 'Slug is already taken')
                }
            } else {
                setSlugMessage('')
            }
        }, 500)

        return () => {
            clearTimeout(handler)
        }
    }, [slug, isUnique])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (isSubmitting || !isSlugUnique) return

        setIsSubmitting(true)

        try {
            const { workspaceId } = await createWorkspace({ name, slug, iconId: 'default' })
            toast.success('Workspace created successfully!')
            setNewWorkspaceId(workspaceId)
        } catch (error) {
            toast.error('Failed to create workspace')
            console.error('Error creating workspace:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (newWorkspaceId) {
            router.push(`/dashboard/${slug}`)
        }
    }, [newWorkspaceId, slug, router])

    return (
        <form id="create-workspace-form" onSubmit={handleSubmit} className="space-y-4">
            <div className='flex flex-col gap-2'>
                <Label htmlFor="name" className="flex items-center text-foreground">
                    Workspace Name
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="ml-2 w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='text-muted-foreground text-sm'>Enter the name of your workspace</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <div className="relative">
                    <Input
                        id="name"
                        placeholder="Acme inc."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className='bg-primary-foreground'
                    />
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Label htmlFor="slug" className="flex items-center text-foreground">
                    Workspace Slug
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="ml-2 w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='text-muted-foreground text-sm'>Enter a unique slug for your workspace</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <div className="relative flex shadow-sm rounded-md">
                    <span className="inline-flex items-center bg-muted shadow-sm px-5 border border-r-0 border-border rounded-l-md text-muted-foreground sm:text-sm">
                        app.lokey.co/
                    </span>
                    <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className={`bg-primary-foreground rounded-l-none ${slug && !isSlugUnique ? 'focus-visible:ring-1 focus-visible:ring-destructive border-destructive' : ''}`}
                        placeholder="acme"
                        aria-invalid={!isSlugUnique}
                        type="text"
                        name="slug"
                    />
                </div>
                {slug && !isSlugUnique && <p className="mt-1 text-center text-destructive text-sm">The slug &quot;{slug}&quot; is already in use.</p>}
            </div>
            <Button type="submit" form="create-workspace-form" className="bg-primary w-full text-primary-foreground">
                Create workspace
            </Button>
        </form>
    )
}