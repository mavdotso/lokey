import Sidebar from '@/components/sidebar/sidebar';
import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { spaceId: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
    return (
        <main className="bg-accent p-2 h-screen">
            <div className='flex rounded-md h-full overflow-hidden'>
                <Sidebar params={params} />
                <div className="flex-1 overflow-hidden">{children}</div>
            </div>
        </main>
    );
}