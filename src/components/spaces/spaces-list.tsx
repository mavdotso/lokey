import { getSpacesByUserId } from '@/lib/db/queries';
import { SelectSpace } from '@/lib/db/schema';
import React, { useEffect, useState } from 'react';

interface SpaceListProps {
    userId: string;
}

export function SpacesList({ userId }: SpaceListProps) {
    const [spaces, setSpaces] = useState<SelectSpace[]>([]);

    useEffect(() => {
        async function fetchWorkspaces() {
            const spacesById = await getSpacesByUserId(userId);
            setSpaces(spacesById);
        }

        fetchWorkspaces();
    }, [userId]);

    return (
        <div>
            <h2>Your Workspaces</h2>
            <ul>
                {spaces.map((space) => (
                    <li key={space.id}>{space.name}</li>
                ))}
            </ul>
        </div>
    );
}
