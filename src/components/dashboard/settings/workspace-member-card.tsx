import { UserAvatar } from "@/components/global/user-avatar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { User, Workspace } from "@/convex/types"
import { formatConstantToTitleCase } from "@/lib/utils"
import { fetchQuery } from "convex/nextjs"
import { RemoveUserButton } from "./remove-user-button"

interface WorkspaceMemberCardProps {
    user: User
    workspace: Workspace
}

export async function WorkspaceMemberCard({ user, workspace }: WorkspaceMemberCardProps) {
    const userRole = await fetchQuery(api.users.getUserRole, {
        userId: user._id as Id<"users">,
        workspaceId: workspace._id as Id<"workspaces">
    })

    return (
        <div className="flex justify-between items-center gap-2 p-2 w-full">
            <div className="flex gap-2">
                <UserAvatar user={user} />
                <div className="flex flex-col justify-center">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-left text-muted-foreground text-sm">
                    {userRole && formatConstantToTitleCase(userRole)}
                </p>
                {userRole !== "ADMIN" && (
                    <RemoveUserButton user={user} workspace={workspace} />
                )}
            </div>
        </div>
    )
}