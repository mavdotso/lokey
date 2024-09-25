
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { WorkspaceInvite } from "@/convex/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { fetchAction } from "convex/nextjs";
import { useMutation } from "convex/react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface InviteCardProps {
    invite: WorkspaceInvite;
}

export function InviteCard({ invite }: InviteCardProps) {

    async function handleDiscard() {
        if (!invite._id) {
            toast.error("Wrong invite.", {
                description: "Couldn't find this invite"
            })
            return;
        }
        try {
            const response = await fetchAction(api.invites.expireInvite, { _id: invite._id });
            if (response.success) {
                toast.success("Success", {
                    description: `Removed the invite for ${invite.invitedEmail}`
                })
            } else {
                toast.error("Something went wrong.", {
                    description: "Please, try again"
                })
            }
        } catch (error) {
            console.error("Failed to discard invite:", error);
        }
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
                >
                </Button>
            </div>
        </div>
    )
}