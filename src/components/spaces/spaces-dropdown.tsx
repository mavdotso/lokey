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
import { CreateSpaceForm } from './create-space-form';
import LoadingScreen from '../global/loading-screen';

interface SpacesDropdownProps {
    userId: string;
}

export function SpacesDropdown({ userId }: SpacesDropdownProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<Id<"spaces"> | null>(null);

    const spacesQuery = useQuery(api.queries.getSpacesByUserId, { userId });

    const spaces = useMemo(() => spacesQuery ?? [], [spacesQuery]);

    useEffect(() => {
        if (spaces.length > 0 && !selectedSpaceId) {
            setSelectedSpaceId(spaces[0]._id as Id<"spaces">);
        }
    }, [spaces, selectedSpaceId]);

    if (spaces === undefined) return <LoadingScreen />

    function handleSelect(spaceId: Id<"spaces">) {
        setSelectedSpaceId(spaceId);
        router.push(`/dashboard/${spaceId}`);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Select
                value={selectedSpaceId?.toString()}
                onValueChange={(value) => handleSelect(value as Id<"spaces">)}
            >
                <SelectTrigger className="shadow-none flex items-center justify-between whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 border-none ring-0 focus:ring-0">
                    <SelectValue placeholder="Select space" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-md text-popover-foreground">
                    {spaces.map((space) => (
                        <SelectItem key={space._id} value={space._id} className='hover:bg-accent cursor-pointer'>
                            <div className='flex flex-row items-center gap-2'>
                                <div className='bg-accent p-1 rounded-[5px]'>
                                    <RocketIcon className='w-6 h-6 stroke-primary' />
                                </div>
                                <p className='text-md'>{space.title}</p>
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
                            Create new space
                        </div>
                    </DialogTrigger>
                </SelectContent>
            </Select>
            <DialogContent>
                <CreateSpaceForm />
            </DialogContent>
        </Dialog>
    );
}