'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RocketIcon, Space, SpaceIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Space } from '../../../convex/types';
import { Id } from '../../../convex/_generated/dataModel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { CreateSpaceForm } from './create-space-form';

interface SpaceGroupProps {
    title: string;
    spaces: Space[];
    onSelect: (spaceId: Id<"spaces">) => void;
}

interface SpacesDropdownProps {
    userId: string;
}

export function SpacesDropdown({ userId }: SpacesDropdownProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<Id<"spaces"> | null>(null);

    const spaces = useQuery(api.queries.getSpacesByUserId, { userId }) ?? [];

    if (!spaces) return

    useEffect(() => {
        if (spaces.length > 0 && !selectedSpaceId) {
            setSelectedSpaceId(spaces[0]._id as Id<"spaces">);
        }
    }, [spaces, selectedSpaceId]);

    function handleSelect(spaceId: Id<"spaces">) {
        setSelectedSpaceId(spaceId);
        router.push(`/dashboard/${spaceId}`);
    }

    function handleSpaceCreated(spaceId: Id<"spaces">) {
        handleSelect(spaceId);
        setIsDialogOpen(false);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Select
                value={selectedSpaceId?.toString()}
                onValueChange={(value) => handleSelect(value as Id<"spaces">)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select space" />
                </SelectTrigger>
                <SelectContent>
                    {spaces.map((space) => (
                        <SelectItem key={space._id} value={space._id} className='cursor-pointer'>
                            <div className='flex flex-row items-center gap-2 p-1'>
                                <RocketIcon className='w-4 h-4' />
                                <p>{space.title}</p>
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
                <DialogHeader>
                    <DialogTitle>Create a Space</DialogTitle>
                    <DialogDescription>Create a new space to organize your work.</DialogDescription>
                </DialogHeader>
                <CreateSpaceForm onSpaceCreated={handleSpaceCreated} />
            </DialogContent>
        </Dialog>
    );
}