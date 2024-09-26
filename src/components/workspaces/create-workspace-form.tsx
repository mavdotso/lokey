'use client'

import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Id } from '@/convex/_generated/dataModel'
import { api } from '@/convex/_generated/api'
import { SubmitButton } from '@/components/global/submit-button'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { fetchAction } from 'convex/nextjs'
import { useSession } from 'next-auth/react'

interface CreateWorkspaceFormProps {
    isCloseable?: boolean
}

export function CreateWorkspaceForm({ isCloseable }: CreateWorkspaceFormProps) {
    const router = useRouter()
    const session = useSession();

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

    const isUnique = useQuery(api.workspaces.isSlugUnique, { slug: formState.slug })

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

    async function handleSubmit() {
        if (formState.isSubmitting || !formState.isSlugUnique) {
            setFormState(prev => ({ ...prev, showSlugError: !formState.isSlugUnique }))
            return
        }

        setFormState(prev => ({ ...prev, isSubmitting: true, showSlugError: false }))

        try {
            const workspaceId = await fetchAction(api.workspaces.newWorkspace, { userId: session.data?.user?.id as Id<"users">, name: formState.name, slug: formState.slug, iconId: 'default', planType: 'FREE' })

            toast.success('Workspace created successfully!')
            setFormState(prev => ({ ...prev, newWorkspaceId: workspaceId }))
            setIsRedirecting(true);
        } catch (error: any) {
            toast.error('Failed to create workspace', {
                description: `${error.message}`,
            })
            console.error('Error creating workspace:', error)
        } finally {
            setFormState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    useEffect(() => {
        if (formState.newWorkspaceId && isRedirecting) {
            router.push(`/dashboard/${formState.slug}/credentials`)
        }
    }, [formState.newWorkspaceId, formState.slug, router, isRedirecting])

    return (
        <form id="create-workspace-form" action={handleSubmit} className="space-y-4">
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
                        lokey.cc/
                    </span>
                    <Input
                        id="slug"
                        value={formState.slug}
                        onChange={(e) => {
                            setFormState(prev => ({ ...prev, slug: e.target.value, showSlugError: false }))
                        }}
                        required
                        disabled={formState.isSubmitting}
                        className={`rounded-l-none ${formState.slug && !formState.isSlugUnique && formState.showSlugError && !formState.isSubmitting && !isRedirecting ? 'focus-visible:ring-1 focus-visible:ring-destructive border-destructive' : ''}`}
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
            <DialogFooter>
                {isCloseable &&
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" size={"lg"}>
                            Close
                        </Button>
                    </DialogClose>
                }
                <SubmitButton
                    disabled={!formState.isSlugUnique}
                    text='Create workspace'
                    size={"lg"}
                    pendingText='Creating workspace...'
                />
            </DialogFooter>
        </form>
    )
}