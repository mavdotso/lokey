"use client"

import { useParams, useRouter } from 'next/navigation';
import { ChevronsUpDown, Plus, RocketIcon } from "lucide-react"
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CreateWorkspaceDialog } from './create-workspace-dialog';
import { useSession } from 'next-auth/react';
import { Id } from '@/convex/_generated/dataModel';
import { Dialog } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from 'react';
import { WorkspaceDropdownSkeleton } from '@/components/skeletons/workplace-dropdown-skeleton';

export function WorkspacesDropdown() {
    const router = useRouter();
    const { slug } = useParams();
    const session = useSession();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('');
    
    const { isMobile } = useSidebar()

    const workspacesQuery = useQuery(api.workspaces.getUserWorkspaces, { userId: session.data?.user?.id as Id<"users"> });

    
    const workspaces = useMemo(() => workspacesQuery ?? [], [workspacesQuery]);
    const activeWorkspace = workspaces.find(w => w.slug === selectedSpaceSlug) || workspaces[0]

    useEffect(() => {
        setSelectedSpaceSlug(slug as string);
    }, [slug]);

    if (!workspacesQuery || workspaces === undefined) return <WorkspaceDropdownSkeleton />

    function handleSelect(slug: string) {
        const selectedWorkspace = workspaces.find(workspace => workspace.slug === slug);
        if (selectedWorkspace) {
            setSelectedSpaceSlug(selectedWorkspace.slug);
            router.push(`/dashboard/${selectedWorkspace.slug}/credentials`);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex justify-center items-center bg-background rounded-sm text-sidebar-primary-foreground aspect-square size-8">
                                    <RocketIcon className="text-primary size-4" />
                                </div>
                                <div className="flex-1 grid text-left text-sm leading-tight">
                                    <span className="font-semibold truncate">
                                        {activeWorkspace?.name}
                                    </span>
                                    <span className="text-xs truncate">/{activeWorkspace?.slug}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Workspaces
                            </DropdownMenuLabel>
                            {workspaces.map((workspace, index) => (
                                <DropdownMenuItem
                                    key={workspace.slug}
                                    onClick={() => handleSelect(workspace.slug)}
                                    className="gap-2 p-2 cursor-pointer"
                                >
                                    <div className="flex justify-center items-center border rounded-sm size-8">
                                        <RocketIcon className="shrink-0 size-4" />
                                    </div>
                                    {workspace.name}
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <CreateWorkspaceDialog trigger={
                                <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
                                    <div className="flex justify-center items-center bg-background border rounded-md size-8">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">Create workspace</div>
                                </DropdownMenuItem>
                            } />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </Dialog>
    );
}