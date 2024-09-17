import { Card, CardContent } from "@/components/ui/card"
import { CreateWorkspaceForm } from '@/components/workspaces/create-workspace-form'
import { CreateWorkspaceHeader } from '@/components/workspaces/create-workspace-header'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface CreateWorkspaceDialogProps {
    isOpen?: boolean;
    setIsOpen?: () => void;
    trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({ trigger, isOpen, setIsOpen }: CreateWorkspaceDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className='p-0 overflow-hidden'>
                <Card className="w-full max-w-lg max-h-fit overflow-hidden">
                    <CreateWorkspaceHeader />
                    <CardContent className="bg-muted pt-8 border-t">
                        <CreateWorkspaceForm />
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}