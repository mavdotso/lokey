import { auth } from '@/lib/auth';
import Sidebar from '@/components/sidebar/sidebar';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
    children: ReactNode;
    params: { slug: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const session = await auth()

    if (!session) redirect('/sign-in')

    return (
        <main className="relative bg-muted h-screen">
            <div className='flex rounded-md h-full'>
                <Sidebar session={session} params={params} />
                <div className="flex-1 p-2">
                    <div className='relative bg-background border border-border rounded-lg w-full h-full overflow-hidden'>
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}