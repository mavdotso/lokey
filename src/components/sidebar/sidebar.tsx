
import { KeySquareIcon, UsersIcon, BoltIcon } from 'lucide-react';
import Link from 'next/link';
import UserCard from '@/components/sidebar/user-card';
import { Session } from 'next-auth';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
    params: { slug: string };
    session: Session;
    className?: string;
    onToggleSidebar?: () => void;
}

interface NavItem {
    href?: string;
    icon: React.ElementType;
    name: string;
    onClick?: () => void;
}

const navItems: NavItem[] = [
    { href: 'credentials', icon: KeySquareIcon, name: 'Credentials', onClick: () => { } },
    { href: 'users', icon: UsersIcon, name: 'Users', onClick: () => { } },
    { href: 'settings', icon: BoltIcon, name: 'Settings', onClick: () => { } },
];

export default function Sidebar({ params, session, className, onToggleSidebar }: SidebarProps) {
    return (
        <aside className={`w-64 h-full flex flex-col p-4 ${className}`}>
            <div className="flex justify-start items-center gap-2 pt-4 font-semibold">
                <WorkspacesDropdown />
            </div>
            <Separator className='bg-primary-foreground/50 my-4' />
            <nav className="flex flex-col gap-4 px-3 py-4 text-sm">
                {navItems.map((item) =>
                    item.href && (
                        <Link key={item.name} href={`${params.slug}/${item.href}`} className="flex items-center gap-4 p-2 rounded-md font-medium text-md text-muted-foreground hover:text-primary">
                            <item.icon className="w-6 h-6" />
                            {item.name}
                        </Link>
                    )
                )}
            </nav>
            <div className="mt-auto">
                {session && <UserCard session={session} />}
            </div>
        </aside>
    );
}