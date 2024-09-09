import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { buttonVariants } from '@/components/ui/button';

interface ActionDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: string;
    cancelText?: string;
    actionText?: string;
    actionButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction?: () => void;
}

export function ActionDialog({
    trigger,
    title,
    description,
    cancelText = "Cancel",
    actionText = "Continue",
    actionButtonVariant = "default",
    open,
    onOpenChange,
    onAction,
}: ActionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: actionButtonVariant })}
                        onClick={() => {
                            if (onAction) onAction();
                            onOpenChange(false);
                        }} >{actionText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
