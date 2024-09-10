import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, LinkIcon } from "lucide-react";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface InviteLinkDialogProps {
    workspaceId: Id<"workspaces">;
}

export function InviteLinkDialog({ workspaceId }: InviteLinkDialogProps) {
    const [inviteLink, setInviteLink] = useState("");
    const [role, setRole] = useState<"admin" | "manager" | "member">("member");
    const generateInviteLink = useMutation(api.invites.generateInviteLink);

    async function handleGenerateLink() {
        const result = await generateInviteLink({ workspaceId, role });
        if (result.success && typeof result.data === 'string') {
            setInviteLink(result.data);
            toast.success("Invite link generated", {
                description: "The invite link has been generated successfully.",
            });
        } else {
            toast.error(result.message);
        }
    };

    function handleCopy() {
        navigator.clipboard.writeText(inviteLink);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size={"icon"}>
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite people</DialogTitle>
                    <DialogDescription>
                        Generate an invite link for people to join your workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value: "admin" | "manager" | "member") => setRole(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerateLink}>Generate Invite Link</Button>
                    {inviteLink && (
                        <div className="flex items-center space-x-2">
                            <Input
                                value={inviteLink}
                                readOnly
                            />
                            <Button size="sm" className="px-3" onClick={handleCopy}>
                                <span className="sr-only">Copy</span>
                                <CopyIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}