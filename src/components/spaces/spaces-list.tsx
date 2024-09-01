import { useQuery } from 'convex/react';
import React from 'react';
import { api } from '../../../convex/_generated/api';

interface SpaceListProps {
    userId: string;
}

export function SpacesList({ userId }: SpaceListProps) {
    const spaces = useQuery(api.queries.getSpacesByUserId, { userId });

    if (spaces === undefined) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Your Workspaces</h2>
            <ul>
                {spaces.map((space) => (
                    space ? <li key={space._id}>{space.title}</li> : <p>No spaces found</p>
                ))}
            </ul>
        </div>
    );
}