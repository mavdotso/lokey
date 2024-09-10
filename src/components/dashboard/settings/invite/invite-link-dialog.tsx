import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, LinkIcon } from "lucide-react";
import React from "react";

interface InviteDialog {
    inviteLink: string,
}

export function InviteLinkDialog({ inviteLink }: InviteDialog) {
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
                        Anyone who will join via this link will have access to your workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="flex-1 gap-2 grid">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            value={inviteLink}
                            readOnly
                        />
                    </div>
                    <Button size="sm" className="px-3">
                        <span className="sr-only">Copy</span>
                        <CopyIcon className="w-4 h-4" />
                    </Button>
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