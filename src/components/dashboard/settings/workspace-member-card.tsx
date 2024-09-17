'use client'
import { LoadingSpinner } from "@/components/global/loading-spinner"
import { UserAvatar } from "@/components/global/user-avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { User, Workspace } from "@/convex/types"
import { capitalizeFirstLetter } from "@/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { TrashIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface WorkspaceMemberCardProps {
    user: User
    workspace: Workspace
}

export function WorkspaceMemberCard({ user, workspace }: WorkspaceMemberCardProps) {
    const [isRemoving, setIsRemoving] = useState(false)

    const userRole = useQuery(api.users.getUserRole, (user._id && workspace._id) ? { _id: user._id, workspaceId: workspace._id } : 'skip')
    const kickUser = useMutation(api.workspaces.kickUserFromWorkspace)

    async function handleRemoveUser() {
        if (!workspace._id) {
            console.error("Workspace ID is undefined")
            return
        }

        if (!user._id) {
            console.error("User ID is undefined")
            return
        }

        setIsRemoving(true)
        try {
            const response = await kickUser({ _id: workspace._id, userId: user._id })
            if (response.success) {
                toast.success("Success", {
                    description: `User ${user.name ? (user.name) : (user.email)} has been removed from the workspace`
                })
            } else {
                toast.error("Error", {
                    description: response.message
                })
            }
        } catch (error) {
            console.error("Failed to remove user:", error)
        }
        setIsRemoving(false)
    }


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
                    {userRole && capitalizeFirstLetter(userRole.toString())}
                </p>
                {userRole !== "admin" &&
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveUser}
                        disabled={isRemoving}
                    >
                        {isRemoving ? <LoadingSpinner /> : <TrashIcon className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                }
            </div>
        </div>
    )
}