'use client'
import UserAvatar from "@/components/global/user-avatar"
import { api } from "@/convex/_generated/api"
import { User, Workspace } from "@/convex/types"
import { capitalizeFirstLetter } from "@/lib/utils"
import { useQuery } from "convex/react"

interface WorkspaceMemberCardProps {
    user: User
    workspace: Workspace
}

export function WorkspaceMemberCard({ user, workspace }: WorkspaceMemberCardProps) {

    const userRole = useQuery(api.users.getUserRole, (user._id && workspace._id) ? { _id: user._id, workspaceId: workspace._id } : 'skip')

    return (
        <div className="flex justify-between items-center gap-2 p-2 w-full">
            <div className="flex gap-2">
                <UserAvatar user={user} />
                <div className="flex flex-col justify-center items-center">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
            </div>
            <p className="text-left text-muted-foreground text-sm">
                {userRole && capitalizeFirstLetter(userRole.toString())}
            </p>
        </div>
    )
}