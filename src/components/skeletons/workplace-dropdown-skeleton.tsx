import { Skeleton } from "@/components/ui/skeleton"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

export function WorkspaceDropdownSkeleton() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-2">
                    <Skeleton className="bg-background size-8" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="bg-background w-[120px] h-4" />
                        <Skeleton className="bg-background w-[80px] h-3" />
                    </div>
                    <Skeleton className="bg-background size-4" />
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}