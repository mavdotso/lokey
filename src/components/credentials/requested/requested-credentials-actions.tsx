import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CredentialsRequest } from "@/convex/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { PasswordPromptDialog } from "@/components/credentials/requested/password-prompt-dialog";
import { DecryptedCredential } from "./requested-credentials-card";
import { crypto } from "@/lib/utils";
import { CredentialsDisplayDialog } from "../credentials-display-dialog";

interface RequestedCredentialsActionsProps {
    credentialsRequest: CredentialsRequest;
}

export function RequestedCredentialsActions({ credentialsRequest }: RequestedCredentialsActionsProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
    const [decryptedCredentials, setDecryptedCredentials] = useState<DecryptedCredential[]>([]);
    const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);

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

    async function handleViewCredentials(secretPhrase: string) {
        if (!secretPhrase) {
            console.log('Missing secret phrase');
            toast.error('Please enter the secret phrase to view the credentials');
            return;
        }

        try {
            const privateKey = crypto.decryptPrivateKey(credentialsRequest.encryptedPrivateKey, secretPhrase);

            if (credentialsRequest.status === 'fulfilled') {
                const decrypted = credentialsRequest.credentials.map(cred => {
                    if (cred.encryptedValue) {
                        const decryptedValue = crypto.decryptWithPrivateKey(cred.encryptedValue, privateKey);
                        return {
                            name: cred.name,
                            type: cred.type,
                            description: cred.description,
                            value: decryptedValue
                        };
                    }
                    return null;
                }).filter((cred): cred is DecryptedCredential => cred !== null);

                setDecryptedCredentials(decrypted);
                setIsCredentialsDialogOpen(true);
            } else {
                console.log('Credentials not fulfilled');
                toast.error('Credentials have not been fulfilled yet');
            }
        } catch (error) {
            console.error('Decryption error:', error);
            toast.error('Failed to decrypt credentials. Please check your secret phrase.');
        }
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
            <CredentialsDisplayDialog
                isOpen={isCredentialsDialogOpen}
                setIsOpen={setIsCredentialsDialogOpen}
                decryptedCredentials={decryptedCredentials}
            />
        </>
    );
}