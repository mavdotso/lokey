'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
    text: string,
    pendingText: string,
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
    size?: "default" | "sm" | "lg" | "icon",
    disabled?: boolean,
    className?: string,
}

export function SubmitButton({ text, pendingText, variant, size = "default", disabled, className }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending || disabled} variant={variant} size={size} className={cn(className)}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    {pendingText}
                </>
            ) : (
                `${text}`
            )}
        </Button>
    )
}