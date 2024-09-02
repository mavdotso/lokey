'use client'

import React from 'react';
import Sidebar from '@/components/sidebar/sidebar';
import { Session } from 'next-auth';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CreateSpaceForm } from '../spaces/create-space-form';

interface DashboardClientProps {
    children: React.ReactNode;
    session: Session;
    params: { spaceId: string };
}

export default function DashboardClient({ children, session, params }: DashboardClientProps) {
    const spacesQuery = useQuery(api.queries.getSpacesByUserId, { userId: session!.user!.id! });
    const hasSpaces = (spacesQuery?.length ?? 0) > 0;

    return (
        <main className="relative bg-accent p-2 h-screen">
            <div className='flex rounded-md h-full overflow-hidden'>
                {session && <Sidebar session={session} params={params} />}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
            {!hasSpaces && (
                <div className="absolute inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-full h-full">
                    <CreateSpaceForm onSpaceCreated={() => console.log('Created')} />
                </div>
            )}
        </main>
    );
}