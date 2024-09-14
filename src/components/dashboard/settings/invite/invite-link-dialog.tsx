import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, LinkIcon, RefreshCwIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { getURL } from "@/lib/utils";
import { Workspace } from "@/convex/types";

interface InviteLinkDialogProps {
    workspace: Workspace;
}

export function InviteLinkDialog({ workspace }: InviteLinkDialogProps) {
    const [inviteLink, setInviteLink] = useState("");
    const updateWorkspaceInviteCode = useMutation(api.workspaces.updateWorkspaceInviteCode);

    useEffect(() => {
        setInviteLink(`${getURL()}/invite/${workspace.inviteCode}`);
    }, [workspace]);

    async function handleUpdateInviteCode() {
        if (!workspace._id) return;

        const result = await updateWorkspaceInviteCode({ workspaceId: workspace._id });
        if (result.success) {
            setInviteLink(`${getURL()}/invite/${result.inviteCode}`);
            toast.success("Invite code updated", {
                description: "The workspace invite code has been updated successfully.",
            });
        } else {
            toast.error(result.message);
        }
    };

    function handleCopy() {
        navigator.clipboard.writeText(inviteLink);
        toast.success("Copied to clipboard");
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
                        Share the invite link for people to join your workspace as members.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            id="inviteLink"
                            value={inviteLink}
                            readOnly
                        />
                        <Button size="sm" className="px-3" onClick={handleCopy}>
                            <span className="sr-only">Copy</span>
                            <CopyIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={handleUpdateInviteCode}>
                        <RefreshCwIcon className="mr-2 w-4 h-4" />
                        Reset invite link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}