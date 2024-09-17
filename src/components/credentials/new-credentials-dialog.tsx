import { Dispatch, ReactNode, SetStateAction } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewCredentialsForm } from '@/components/credentials/new-credentials-form';
import { Id } from '@/convex/_generated/dataModel';
import { Credentials } from '@/convex/types';

interface NewCredentialsDialogProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
    editId?: Id<"credentials">;
    existingData?: Credentials;
    children?: ReactNode;
}

export function NewCredentialsDialog({ children, isOpen, setIsOpen, onCredentialsCreated, onCredentialsUpdated, onDialogClose, editId, existingData }: NewCredentialsDialogProps) {
    return (
        <>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{editId ? 'Edit Credentials' : 'Create new credentials'}</DialogTitle>
                    <DialogDescription>
                        {editId ? 'Update the details for this credential.' : 'Fill in the details to create new credentials.'}
                    </DialogDescription>
                </DialogHeader>
                <NewCredentialsForm
                    setIsOpen={setIsOpen}
                    editId={editId}
                    existingData={existingData}
                    onCredentialsCreated={onCredentialsCreated}
                    onCredentialsUpdated={onCredentialsUpdated}
                    onDialogClose={onDialogClose}
                />
            </DialogContent>
        </>
    );
}
