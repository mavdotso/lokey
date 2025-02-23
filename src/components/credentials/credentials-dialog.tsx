import { DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogTrigger, Dialog } from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Credentials } from "@/convex/types";
import { CredentialsForm } from "./credentials-form";

interface CredentialsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onCredentialsCreated?: () => void;
    onCredentialsUpdated?: () => void;
    onDialogClose?: () => void;
    children?: ReactNode;
    formType: 'new' | 'request';
    editId?: Id<"credentials">;
    existingData?: Credentials;
}

export function CredentialsDialog({ children, isOpen, onOpenChange, onCredentialsCreated, onCredentialsUpdated, onDialogClose, editId, existingData, formType }: CredentialsDialogProps) {

    function handleDialogClose() {
        onOpenChange(false);
        onDialogClose && onDialogClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                                'Create new credentials'}
                    </DialogDescription>

                </DialogHeader>
                <CredentialsForm
                    setIsOpen={onOpenChange}
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