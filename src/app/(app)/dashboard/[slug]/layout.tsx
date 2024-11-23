import { auth } from '@/lib/auth';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
                    <SidebarProvider>
                        <Sidebar session={session} params={params} />
                        <SidebarInset className="flex-1 p-2">
                            <div className='relative bg-background border border-border rounded-lg w-full h-full overflow-hidden'>
                                {children}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </main>
        );
}