import { auth } from '@/lib/auth';
import React from 'react';
import DashboardClient from '@/components/dashboard/dashboard-client';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { spaceId: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const session = await auth()

    if (!session) return

    return (
        <DashboardClient session={session} params={params}>
            {children}
        </DashboardClient>
    );
}