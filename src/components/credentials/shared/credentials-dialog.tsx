import { DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogTrigger, Dialog } from "@/components/ui/dialog";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Credentials } from "@/convex/types";
import { CredentialsForm } from "./credentials-form";

interface NewCredentialsDialogProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
    editId?: Id<"credentials">;
    existingData?: Credentials;
    children?: ReactNode;
    formType: 'new' | 'request';
}

export function NewCredentialsDialog({ children, isOpen, setIsOpen, onCredentialsCreated, onCredentialsUpdated, onDialogClose, editId, existingData, formType }: NewCredentialsDialogProps) {

    function handleDialogClose() {
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {editId ? 'Edit Credentials' :
                            formType === 'request' ? 'Create new credentials request' :
                                'Create new credentials'}
                    </DialogTitle>
                    <DialogDescription>
                        {editId ? 'Update the details for this credential.' :
                            formType === 'request' ? 'Fill in the details to create new credentials request.' :
                                'Fill in the details to create new credentials.'}
                    </DialogDescription>
                </DialogHeader>
                <CredentialsForm
                    setIsOpen={setIsOpen}
                    editId={editId}
                    existingData={existingData}
                    onCredentialsCreated={onCredentialsCreated}
                    onCredentialsUpdated={onCredentialsUpdated}
                    onDialogClose={handleDialogClose}
                    formType={formType}
                />
            </DialogContent>
        </Dialog>
    );
}