'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Id } from '@/convex/_generated/dataModel'
import { api } from '@/convex/_generated/api'


export function CreateWorkspaceForm() {
    const [formState, setFormState] = useState({
        name: '',
        slug: '',
        isSubmitting: false,
        isSlugUnique: true,
        slugMessage: '',
        showSlugError: false,
        newWorkspaceId: null as Id<"workspaces"> | null,
    })
    const [isRedirecting, setIsRedirecting] = useState(false);
    const createWorkspace = useMutation(api.workspaces.createWorkspace)
    const isUnique = useQuery(api.workspaces.isSlugUnique, { slug: formState.slug })
    const router = useRouter()

    useEffect(() => {
        const handler = setTimeout(() => {
            if (formState.slug) {
                setFormState(prev => ({
                    ...prev,
                    isSlugUnique: isUnique !== undefined ? isUnique : prev.isSlugUnique,
                    slugMessage: isUnique ? 'Slug is available' : 'Slug is already taken',
                    showSlugError: !isUnique && prev.slug !== ''
                }))
            } else {
                setFormState(prev => ({ ...prev, slugMessage: '', showSlugError: false }))
            }
        }, 500)

        return () => {
            clearTimeout(handler)
        }
    }, [formState.slug, isUnique])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (formState.isSubmitting || !formState.isSlugUnique) {
            setFormState(prev => ({ ...prev, showSlugError: !formState.isSlugUnique }))
            return
        }

        setFormState(prev => ({ ...prev, isSubmitting: true, showSlugError: false }))

        try {
            const { workspaceId } = await createWorkspace({ name: formState.name, slug: formState.slug, iconId: 'default' })
            toast.success('Workspace created successfully!')
            setFormState(prev => ({ ...prev, newWorkspaceId: workspaceId }))
            setIsRedirecting(true);
        } catch (error) {
            toast.error('Failed to create workspace')
            console.error('Error creating workspace:', error)
        } finally {
            setFormState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    useEffect(() => {
        if (formState.newWorkspaceId && isRedirecting) {
            router.push(`/dashboard/${formState.slug}`)
        }
    }, [formState.newWorkspaceId, formState.slug, router, isRedirecting])

    return (
        <form id="create-workspace-form" onSubmit={handleSubmit} className="space-y-4">
            <div className='flex flex-col gap-2'>
                <Label htmlFor="name" className="flex items-center text-foreground">
                    Workspace Name
                    <Tooltip>
                        <TooltipTrigger tabIndex={-1}>
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
                        value={formState.name}
                        onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={formState.isSubmitting}
                        className='bg-primary-foreground'
                    />
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Label htmlFor="slug" className="flex items-center text-foreground">
                    Workspace Slug
                    <Tooltip>
                        <TooltipTrigger tabIndex={-1}>
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
                        value={formState.slug}
                        onChange={(e) => {
                            setFormState(prev => ({ ...prev, slug: e.target.value, showSlugError: false }))
                        }}
                        required
                        disabled={formState.isSubmitting}
                        className={`bg-primary-foreground rounded-l-none ${formState.slug && !formState.isSlugUnique && formState.showSlugError && !formState.isSubmitting && !isRedirecting ? 'focus-visible:ring-1 focus-visible:ring-destructive border-destructive' : ''}`}
                        placeholder="acme"
                        aria-invalid={!formState.isSlugUnique}
                        type="text"
                        name="slug"
                    />
                </div>
                {formState.slug && !formState.isSlugUnique && formState.showSlugError && !formState.isSubmitting && !isRedirecting && (
                    <p className="mt-1 text-center text-destructive text-sm">The slug &quot;{formState.slug}&quot; is already in use.</p>
                )}
            </div>
            <Button disabled={!formState.isSlugUnique} type="submit" size={"lg"} form="create-workspace-form" className="bg-primary w-full text-primary-foreground">
                Create workspace
            </Button>
        </form>
    )
}