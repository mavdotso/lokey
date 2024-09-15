"use client"

import { LoadingSpinner } from "@/components/global/loading-spinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { WorkspaceInvite } from "@/convex/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Mail, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InviteCardProps {
    invite: WorkspaceInvite;
}

export function InviteCard({ invite }: InviteCardProps) {
    const [isRemoving, setIsRemoving] = useState(false)

    const setInviteExpired = useMutation(api.invites.setInviteExpired);

    async function handleDiscard() {
        setIsRemoving(true)
        if (!invite._id) return
        try {
            const response = await setInviteExpired({ _id: invite._id });
            if (response.success) {
                toast.success("Success", {
                    description: `Removed the invite for ${invite.invitedEmail}`
                })
            } else {
                toast.error("Error", {
                    description: response.message
                })
            }
        } catch (error) {
            console.error("Failed to discard invite:", error);
        }
        setIsRemoving(false)
    };

    return (
        <div className="flex justify-between items-center gap-2 p-2 w-full">
            <div className="flex gap-2">
                <div className="flex justify-center items-center bg-muted rounded-full w-10 h-10">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-sm">{invite.invitedEmail || 'Invited User'}</p>
                    <p className="text-muted-foreground text-xs">Pending</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-left text-muted-foreground text-sm">
                    {capitalizeFirstLetter(invite.role)}
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDiscard}
                    disabled={isRemoving}
                >
                    {isRemoving ? <LoadingSpinner /> : <TrashIcon className="w-3 h-3 text-muted-foreground" />}
                </Button>
            </div>
        </div>
    )
}