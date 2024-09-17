import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Credentials, CredentialsRequest } from "@/convex/types";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { PasswordPromptDialog } from "@/components/credentials/password-prompt-dialog";
import { crypto } from "@/lib/utils";
import { CredentialsDisplayDialog, DecryptedCredential } from "../credentials-display-dialog";
import { CredentialsDialog } from "./credentials-dialog";
import { PlusIcon } from "lucide-react";

const labels = [
    "feature",
    "bug",
    "enhancement",
    "documentation",
    "design",
    "question",
    "maintenance",
];

interface CredentialsActionsProps {
    item: Credentials | CredentialsRequest;
    type: 'shared' | 'requested';
}

export function CredentialsActions({ item, type }: CredentialsActionsProps) {
    const [label, setLabel] = useState("feature");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
    const [decryptedCredentials, setDecryptedCredentials] = useState<DecryptedCredential[]>([]);
    const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);

    const removeCredentials = useMutation(api.credentials.removeCredentials);
    const setExpired = useMutation(api.credentials.setExpired);
    const rejectCredentialsRequest = useMutation(api.credentials.rejectCredentialsRequest);

    const isShared = type === 'shared';
    const credentials = isShared ? item as Credentials : null;
    const credentialsRequest = !isShared ? item as CredentialsRequest : null;

    function confirmRemove() {
        setDialogOpen(true);
    }

    async function handleRemove() {
        if (credentials?._id) {
            const response = await removeCredentials({ _id: credentials._id });
            if (response.success) {
                toast.success('Credentials have been removed successfully');
            } else {
                toast.error('Something went wrong ', { description: "Please, try again" });
            }
        }
    }

    async function handleSetExpired() {
        if (credentials?._id) {
            const response = await setExpired({ _id: credentials._id });
            if (response.success) {
                toast.success('Credentials were successfully set as expired.');
            } else {
                toast.error('Something went wrong ', { description: "Please, try again" });
            }
        }
    }

    async function handleReject() {
        if (!credentialsRequest) return;
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
        if (!credentialsRequest) return;
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
                        {isShared ? (
                            <>
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                    <CredentialsDialog
                                        isOpen={editDialogOpen}
                                        setIsOpen={setEditDialogOpen}
                                        existingData={credentials ?? undefined}
                                        editId={credentials?._id}
                                        formType="new"
                                    >
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            Edit
                                        </DropdownMenuItem>
                                    </CredentialsDialog>
                                </Dialog>
                                <DropdownMenuItem onClick={handleSetExpired}>Set as expired</DropdownMenuItem>
                                <DropdownMenuItem>Assign to...</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Apply label</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Filter label..."
                                                autoFocus={true}
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>No label found.</CommandEmpty>
                                                <CommandGroup>
                                                    {labels.map((label) => (
                                                        <CommandItem
                                                            key={label}
                                                            value={label}
                                                            onSelect={(value) => {
                                                                setLabel(value);
                                                                setMenuOpen(false);
                                                            }}
                                                        >
                                                            {label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={confirmRemove}>
                                    Delete
                                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                {credentialsRequest?.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                                        Reject Request
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={openPasswordPrompt}>
                                    View Credentials
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Copy Request ID</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmationDialog
                title={isShared ? "Are you absolutely sure?" : "Are you sure you want to reject this request?"}
                description={isShared
                    ? "This action cannot be undone. This will permanently remove the credentials from our servers."
                    : "This action cannot be undone. The requester will be notified that their request has been rejected."}
                confirmText={isShared ? "Remove the credentials" : "Reject Request"}
                onConfirm={isShared ? handleRemove : handleReject}
                isDangerous={true}
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            {!isShared && (
                <>
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
            )}
        </>
    );
}