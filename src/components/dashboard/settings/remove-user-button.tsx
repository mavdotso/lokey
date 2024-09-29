"use client";

import { LoadingSpinner } from "@/components/global/loading-spinner";
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { User, Workspace } from "@/convex/types"
import { useAction } from "convex/react"
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"

interface RemoveUserButtonProps {
    user: User
    workspace: Workspace
}

export function RemoveUserButton({ user, workspace }: RemoveUserButtonProps) {
    const [isRemoving, setIsRemoving] = useState(false)
    const kickUserFromWorkspace = useAction(api.workspaces.kickUserFromWorkspace)

    async function handleRemoveUser() {
        if (!workspace._id || !user._id) {
            console.error("Workspace ID or User ID is undefined")
            toast.error("Error", { description: "Workspace ID or User ID is undefined" })
            return
        }

        setIsRemoving(true)
        try {
            toast.loading("Removing user from workspace...", { id: "removeUser" })

            const response = await kickUserFromWorkspace({
                workspaceId: workspace._id as Id<"workspaces">,
                kickedUserId: user._id as Id<"users">
            })
            

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
        setIsRemoving(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveUser}
            disabled={isRemoving}
        >
            {isRemoving ? <LoadingSpinner /> : <TrashIcon className="w-4 h-4 text-muted-foreground hover:text-red-500" />}
        </Button>
    )
}