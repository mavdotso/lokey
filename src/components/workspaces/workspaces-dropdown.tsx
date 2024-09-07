"use client"
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, RocketIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from 'convex/react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CardContent } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import LoadingScreen from '@/components/global/loading-screen';
import { CreateWorkspaceForm } from '@/components/workspaces/create-workspace-form';
import { CreateWorkspaceHeader } from '@/components/workspaces/create-workspace-header';

export function WorkspacesDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('');

    const workspacesQuery = useQuery(api.workspaces.getUserWorkspaces);

    const workspaces = useMemo(() => workspacesQuery ?? [], [workspacesQuery]);

    useEffect(() => {
        if (workspaces.length > 0) {
            setSelectedSpaceSlug(pathname.replace('/dashboard/', ''));
        } else {
            router.push('/dashboard')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaces, selectedSpaceSlug, pathname]);

    if (workspaces === undefined) return <LoadingScreen />

    function handleSelect(slug: string) {
        const selectedWorkspace = workspaces.find(workspace => workspace.slug === slug);
        if (selectedWorkspace) {
            setSelectedSpaceSlug(selectedWorkspace.slug);
            router.push(`/dashboard/${selectedWorkspace.slug}`);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Select
                value={selectedSpaceSlug}
                onValueChange={handleSelect}
            >
                <SelectTrigger className="shadow-none flex items-center justify-between whiteworkspace-nowrap rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 border-none ring-0 focus:ring-0">
                    <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-md text-popover-foreground">
                    {workspaces.map((workspace) => (
                        <SelectItem key={workspace.slug} value={workspace.slug} className='hover:bg-accent cursor-pointer'>
                            <div className='flex flex-row items-center gap-2'>
                                <div className='bg-accent p-1 rounded-[5px]'>
                                    <RocketIcon className='w-6 h-6 stroke-primary' />
                                </div>
                                <p className='text-md'>{workspace.name}</p>
                            </div>
                        </SelectItem>
                    ))}
                    <Separator className='my-1' />
                    <DialogTrigger asChild>
                        <div
                            className="flex flex-row items-center gap-2 hover:bg-muted p-2 rounded-md w-full text-sm transition-all cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Create new workspace
                        </div>
                    </DialogTrigger>
                </SelectContent>
            </Select>
            <DialogContent className='p-0 overflow-hidden'>
                <CreateWorkspaceHeader />
                <CardContent className="bg-muted pt-8 border-t">
                    <CreateWorkspaceForm />
                </CardContent>
            </DialogContent>
        </Dialog>
    );
}