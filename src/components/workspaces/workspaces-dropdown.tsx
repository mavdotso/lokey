"use client"
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, RocketIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from 'convex/react';
import { Dialog } from '@/components/ui/dialog';
import { api } from '@/convex/_generated/api';
import { LoadingScreen } from '@/components/global/loading-screen';
import { CreateWorkspaceDialog } from './create-workspace-dialog';
import { useSession } from 'next-auth/react';
import { Id } from '@/convex/_generated/dataModel';

export function WorkspacesDropdown() {
    const router = useRouter();
    const { slug } = useParams();
    const session = useSession();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('');

    const workspacesQuery = useQuery(api.workspaces.getUserWorkspaces, { userId: session.data?.user?.id as Id<"users"> });

    const workspaces = useMemo(() => workspacesQuery ?? [], [workspacesQuery]);

    useEffect(() => {
        setSelectedSpaceSlug(slug as string);
    }, [slug]);

    if (workspaces === undefined) return <LoadingScreen />

    function handleSelect(slug: string) {
        const selectedWorkspace = workspaces.find(workspace => workspace.slug === slug);
        if (selectedWorkspace) {
            setSelectedSpaceSlug(selectedWorkspace.slug);
            router.push(`/dashboard/${selectedWorkspace.slug}/credentials`);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Select
                value={selectedSpaceSlug}
                onValueChange={handleSelect}
            >
                <SelectTrigger className="shadow-none focus:outline-none p-0 border-none ring-0 focus:ring-0 w-full text-left text-primary/50 hover:text-primary transition-colors">
                    <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-md text-left text-primary">
                    {workspaces.map((workspace) => (
                        <SelectItem key={workspace.slug} value={workspace.slug} className='hover:bg-accent text-primary cursor-pointer'>
                            <div className='flex flex-row items-center gap-3'>
                                <div className='bg-primary-foreground p-2.5 rounded-sm'>
                                    <RocketIcon className='w-6 h-6 stroke-primary' />
                                </div>
                                <div className='flex flex-col'>
                                    <p className='text-md text-primary'>{workspace.name}</p>
                                    <p className='font-light text-primary/50 text-xs'>/{workspace.slug}</p>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                    <Separator className='my-1' />
                    <CreateWorkspaceDialog trigger={
                        <div className="flex flex-row items-center gap-2 hover:bg-muted p-2 rounded-md w-full text-sm transition-all cursor-pointer">
                            <Plus className="w-4 h-4" />
                            Create new workspace
                        </div>
                    } />
                </SelectContent>
            </Select>
        </Dialog>
    );
}