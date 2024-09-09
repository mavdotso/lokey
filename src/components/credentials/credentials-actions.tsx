import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Credentials } from "@/convex/types";
import { ActionDialog } from "../global/action-dialog";
import { toast } from "sonner";
import { CRUDCredentialsDialog } from "@/components/credentials/crud-credentials-dialog";
import { Dialog } from "../ui/dialog";

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
    credentials: Credentials;
}

export function CredentialsActions({ credentials }: CredentialsActionsProps) {
    const [label, setLabel] = useState("feature");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const removeCredentials = useMutation(api.credentials.removeCredentials)
    const setExpired = useMutation(api.credentials.setExpired)

    function confirmRemove() {
        setDialogOpen(true);
    }

    async function handleRemove() {
        if (credentials._id) {
            const response = await removeCredentials({ _id: credentials._id });
            if (response.success) {
                toast.success('Credentials have been removed successfully');
            } else {
                toast.error('Error: something went wrong: ' + response.message);
            }
        }
    }

    async function handleSetExpired() {
        if (credentials._id) {
            const response = await setExpired({ _id: credentials._id });
            if (response.success) {
                toast.success('Credentials were successfully set as expired.');
            } else {
                toast.error('Error: something went wrong: ' + response.message);
            }
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
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <CRUDCredentialsDialog
                                isOpen={editDialogOpen}
                                setIsOpen={setEditDialogOpen}
                                editId={credentials._id}
                                existingData={credentials}
                                onCredentialsUpdated={() => {
                                    setMenuOpen(false);
                                    setEditDialogOpen(false);
                                }}
                            >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} >
                                    Edit
                                </DropdownMenuItem>
                            </CRUDCredentialsDialog>
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
                        </DropdownMenuGroup>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu >
            <ActionDialog
                trigger=""
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently remove the credentials from our servers."
                cancelText="Cancel"
                actionText="Remove the credentials"
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAction={handleRemove}
                actionButtonVariant={"destructive"}
            />
        </>
    );
}
