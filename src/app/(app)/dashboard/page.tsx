"use client"
import { useQuery } from 'convex/react';
import { redirect } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { CreateSpaceForm } from '@/components/spaces/create-space-form';
import LoadingScreen from '@/components/global/loading-screen';


export default function Dashboard() {
    const space = useQuery(api.queries.getFirstUserSpace);

    if (space === undefined) return <LoadingScreen />

    if (!space || !space.data || space.error !== null) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
                <CreateSpaceForm />
            </div>
        );
    } else {
        redirect(`/dashboard/${space.data._id}`);
    }
}