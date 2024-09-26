import { UserAvatar } from "@/components/global/user-avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { User, Workspace } from "@/convex/types"
import { auth } from "@/lib/auth"
import { formatConstantToTitleCase } from "@/lib/utils"
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs"
import { toast } from "sonner"

interface WorkspaceMemberCardProps {
    user: User
    workspace: Workspace
}

export async function WorkspaceMemberCard({ user, workspace }: WorkspaceMemberCardProps) {

    const session = await auth()
    
    const userRole = await fetchQuery(api.users.getUserRole, { userId: user._id as Id<"users">, workspaceId: workspace._id as Id<"workspaces"> })

    async function handleRemoveUser() {
        if (!workspace._id) {
            console.error("Workspace ID is undefined")
            return
        }

        if (!user._id) {
            console.error("User ID is undefined")
            return
        }

        try {
            const response = await fetchAction(api.workspaces.kickUserFromWorkspace, { workspaceId: workspace._id, adminUserId: session?.user?.id as Id<"users">, kickedUserId: user._id })
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