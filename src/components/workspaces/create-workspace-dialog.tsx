import { CreateWorkspaceForm } from '@/components/workspaces/create-workspace-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface CreateWorkspaceDialogProps {
    isOpen?: boolean;
    setIsOpen?: () => void;
    isCloseable?: boolean;
    trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({ trigger, isOpen, setIsOpen, isCloseable }: CreateWorkspaceDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a workspace</DialogTitle>
                    <DialogDescription>
                        Create a new workspace to collaborate with your team
                    </DialogDescription>
                </DialogHeader>
                <CreateWorkspaceForm isCloseable={isCloseable} />
            </DialogContent>
        </Dialog>
    )
}