import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from 'lucide-react';
import { CreateCredentialsForm } from '@/components/credentials/create-credentials-form';
import { Id } from '@/convex/_generated/dataModel';

interface CreateCredentialsDialogProps {
    buttonText?: string,
    buttonSize?: "lg" | "default" | "sm" | "icon" | null,
    buttonVariant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | null,
    onCredentialsCreated?: (credentialsId: Id<"credentials">) => void;
}

export function CreateCredentialsDialog({ buttonText = "Create new credentials", buttonSize = "lg", buttonVariant = "default", onCredentialsCreated }: CreateCredentialsDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    function handleCredentialsCreated(credentialId: Id<"credentials">) {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className='gap-2' size={buttonSize} variant={buttonVariant}>
                    <PlusIcon className='w-5 h-5' />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Credentials</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new credentials.
                    </DialogDescription>
                </DialogHeader>
                <CreateCredentialsForm onCredentialsCreated={handleCredentialsCreated} />
            </DialogContent>
        </Dialog>
    )
}