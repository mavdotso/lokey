"use client"
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RocketIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import LoadingScreen from '../global/loading-screen';
import { CreateWorkspaceForm } from './create-workspace-form';

interface WorkspacesDropdownProps {
    userId: string;
}

export function WorkspacesDropdown({ userId }: WorkspacesDropdownProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<Id<"workspaces"> | null>(null);

    const workspacesQuery = useQuery(api.queries.getSpacesByUserId, { userId });

    const workspaces = useMemo(() => workspacesQuery ?? [], [workspacesQuery]);

    useEffect(() => {
        if (workspaces.length > 0 && !selectedSpaceId) {
            setSelectedSpaceId(workspaces[0]._id as Id<"workspaces">);
        }
    }, [workspaces, selectedSpaceId]);

    if (workspaces === undefined) return <LoadingScreen />

    function handleSelect(workspaceId: Id<"workspaces">) {
        setSelectedSpaceId(workspaceId);
        router.push(`/dashboard/${workspaceId}`);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Select
                value={selectedSpaceId?.toString()}
                onValueChange={(value) => handleSelect(value as Id<"workspaces">)}
            >
                <SelectTrigger className="shadow-none flex items-center justify-between whiteworkspace-nowrap rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 border-none ring-0 focus:ring-0">
                    <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-md text-popover-foreground">
                    {workspaces.map((workspace) => (
                        <SelectItem key={workspace._id} value={workspace._id} className='hover:bg-accent cursor-pointer'>
                            <div className='flex flex-row items-center gap-2'>
                                <div className='bg-accent p-1 rounded-[5px]'>
                                    <RocketIcon className='w-6 h-6 stroke-primary' />
                                </div>
                                <p className='text-md'>{workspace.title}</p>
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
            <DialogContent>
                <CreateWorkspaceForm />
            </DialogContent>
        </Dialog>
    );
}