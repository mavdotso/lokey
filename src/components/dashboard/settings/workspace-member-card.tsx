import { UserAvatar } from "@/components/global/user-avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { User, Workspace } from "@/convex/types"
import { formatConstantToTitleCase } from "@/lib/utils"
import { fetchAction, fetchQuery } from "convex/nextjs"
import { toast } from "sonner"

interface WorkspaceMemberCardProps {
    user: User
    workspace: Workspace
}

export async function WorkspaceMemberCard({ user, workspace }: WorkspaceMemberCardProps) {

    const userRole = await fetchQuery(api.users.getUserRole, { userId: user._id as Id<"users">, workspaceId: workspace._id as Id<"workspaces"> })

    async function handleRemoveUser() {
        if (!workspace._id) {
            console.error("Workspace ID is undefined")
            toast.error("Error", { description: "Workspace ID is undefined" })
            return
        }

        if (!user._id) {
            console.error("User ID is undefined")
            toast.error("Error", { description: "User ID is undefined" })
            return
        }

        try {
            toast.loading("Removing user from workspace...", { id: "removeUser" })

            const response = await fetchAction(api.workspaces.kickUserFromWorkspace, { workspaceId: workspace._id, kickedUserId: user._id })

            if (response.success) {
                toast.success("User removed", {
                    description: `${user.name ? user.name : user.email} has been removed from the workspace`,
                    id: "removeUser"
                })
            } else {
                toast.error("Failed to remove user", {
                    description: response.error || "An unexpected error occurred",
                    id: "removeUser"
                })
            }
        } catch (error) {
            console.error("Failed to remove user:", error)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                id: "removeUser"
            })
        }
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
                    {userRole && formatConstantToTitleCase(userRole)}
                </p>
                {userRole !== "ADMIN" &&
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveUser}
                    >
                    </Button>
                }
            </div>
        </div>
    )
}