
import { KeySquareIcon, UsersIcon, BoltIcon, FilesIcon, FileLockIcon, KeyIcon, MessageSquareDashedIcon } from 'lucide-react';
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
    { href: 'credentials', icon: KeyIcon, name: 'Credentials', onClick: () => { } },
    { href: 'credentials', icon: FileLockIcon, name: 'Files', onClick: () => { } },
    { href: 'credentials', icon: MessageSquareDashedIcon, name: 'Chats', onClick: () => { } },
    { href: 'users', icon: UsersIcon, name: 'Users', onClick: () => { } },
    { href: 'settings', icon: BoltIcon, name: 'Settings', onClick: () => { } },
];

export default function Sidebar({ params, session, className, onToggleSidebar }: SidebarProps) {
    return (
        <aside className={`w-60 h-full flex flex-col p-4 ${className}`}>
            <div className="flex justify-start items-center gap-2 pt-4 font-semibold">
                <WorkspacesDropdown />
            </div>
            <Separator className='bg-primary-foreground/50 my-4' />
            <nav className="flex flex-col gap-2 py-4">
                {navItems.map((item) =>
                    item.href && (
                        <Link key={item.name} href={`${params.slug}/${item.href}`} className="flex items-center gap-2 hover:bg-card hover:shadow-sm px-3 py-2.5 border border-transparent hover:border-border rounded-sm font-medium text-muted-foreground text-sm hover:text-primary transition-all">
                            <item.icon className="w-4 h-4" />
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