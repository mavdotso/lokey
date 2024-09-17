import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    isDangerous?: boolean;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConfirmationDialog({
    title,
    description,
    confirmText,
    onConfirm,
    isDangerous = false,
    isOpen,
    onOpenChange
}: ConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant={isDangerous ? "destructive" : "default"}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}