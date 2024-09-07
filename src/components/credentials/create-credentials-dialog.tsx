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
import { Id } from '../../../convex/_generated/dataModel'
import { PlusIcon } from 'lucide-react';
import { CreateCredentialsForm } from './create-credentials-form';

interface CreateCredentialsDialogProps {
    onCredentialsCreated: (credentialsId: Id<"credentials">) => void;
}

export function CreateCredentialsDialog({ onCredentialsCreated }: CreateCredentialsDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleCredentialsCreated = (credentialId: Id<"credentials">) => {
        onCredentialsCreated(credentialId)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className='gap-2'>
                    <PlusIcon className='w-5 h-5' />
                    Create new credentials
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