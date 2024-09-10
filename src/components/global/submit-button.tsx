'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
    buttonText: string,
    buttonPendingText: string,
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SubmitButton({ buttonText, buttonPendingText, buttonVariant }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending} variant={buttonVariant}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    {buttonPendingText}
                </>
            ) : (
                `${buttonText}`
            )}
        </Button>
    )
}