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
import { CreateCredentialForm } from './create-credentials-form';
import { PlusIcon } from 'lucide-react';

interface CreateCredentialDialogProps {
    onCredentialCreated: (credentialId: Id<"credentials">) => void;
}

export function CreateCredentialDialog({ onCredentialCreated }: CreateCredentialDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleCredentialCreated = (credentialId: Id<"credentials">) => {
        onCredentialCreated(credentialId)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size={"lg"} className='gap-2'>
                    <PlusIcon className='w-5 h-5' />
                    Create new Credentials
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Credential</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new credential.
                    </DialogDescription>
                </DialogHeader>
                <CreateCredentialForm onCredentialCreated={handleCredentialCreated} />
            </DialogContent>
        </Dialog>
    )
}