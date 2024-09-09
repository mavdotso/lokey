import { Dispatch, SetStateAction } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CRUDCredentialsForm } from '@/components/credentials/crud-credentials-form';
import { Id } from '@/convex/_generated/dataModel';
import { Credentials } from '@/convex/types';

interface CRUDCredentialsDialogProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
    editId?: Id<"credentials">;
    existingData?: Credentials;
    children?: React.ReactNode;
}

export function CRUDCredentialsDialog({ children, isOpen, setIsOpen, onCredentialsCreated, onCredentialsUpdated, onDialogClose, editId, existingData }: CRUDCredentialsDialogProps) {
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
                <CRUDCredentialsForm
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
