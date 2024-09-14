import { WorkspaceInvite } from "@/convex/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Mail } from "lucide-react";

interface InviteCardProps {
    invite: WorkspaceInvite;
}

export function InviteCard({ invite }: InviteCardProps) {
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
            <p className="text-left text-muted-foreground text-sm">
                {capitalizeFirstLetter(invite.role)}
            </p>
        </div>
    )
}