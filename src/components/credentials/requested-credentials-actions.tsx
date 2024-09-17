import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CredentialsRequest } from "@/convex/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "../global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { PasswordPromptDialog } from "./password-prompt-dialog";

interface RequestedCredentialsActionsProps {
    credentialsRequest: CredentialsRequest;
    handleViewCredentials: (secretPhrase: string) => Promise<void>;
}

export function RequestedCredentialsActions({ credentialsRequest, handleViewCredentials }: RequestedCredentialsActionsProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);

    const rejectCredentialsRequest = useMutation(api.credentials.rejectCredentialsRequest);

    async function handleReject() {
        try {
            const result = await rejectCredentialsRequest({ requestId: credentialsRequest._id as Id<"credentialsRequests"> });
            if (result.success) {
                toast.success('Credential request rejected');
            } else {
                toast.error('Failed to reject credential request');
            }
        } catch (error) {
            toast.error('Failed to reject credential request');
            console.error('Error:', error);
        }
    }

    function openPasswordPrompt() {
        setPasswordPromptOpen(true);
        setMenuOpen(false);
    }

    return (
        <>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <DotsHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {credentialsRequest.status === 'pending' && (
                            <DropdownMenuItem onClick={() => setRejectDialogOpen(true)}>
                                Reject Request
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={openPasswordPrompt}>
                            View Credentials
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Copy Request ID</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmationDialog
                title="Are you sure you want to reject this request?"
                description="This action cannot be undone. The requester will be notified that their request has been rejected."
                confirmText="Reject Request"
                onConfirm={handleReject}
                isDangerous={true}
                isOpen={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
            />
            <PasswordPromptDialog
                isOpen={passwordPromptOpen}
                setIsOpen={setPasswordPromptOpen}
                handleViewCredentials={handleViewCredentials}
            />
        </>
    );
}