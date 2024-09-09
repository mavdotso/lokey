
import { KeySquareIcon, UsersIcon, BoltIcon, FilesIcon, FileLockIcon, KeyIcon, MessageSquareDashedIcon } from 'lucide-react';
import Link from 'next/link';
import UserCard from '@/components/sidebar/user-card';
import { Session } from 'next-auth';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
    badge?: string;
}

const navItems: NavItem[] = [
    { href: 'credentials', icon: KeyIcon, name: 'Credentials' },
    { href: 'credentials', icon: FileLockIcon, name: 'Files', badge: 'soon' }, // Added badge
    { href: 'credentials', icon: MessageSquareDashedIcon, name: 'Chats', badge: 'soon' }, // Added badge
    { href: 'users', icon: UsersIcon, name: 'Users' },
    { href: 'settings', icon: BoltIcon, name: 'Settings' },
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
                        <Link href={`${params.slug}/${item.href}`} className={`${item.badge ? 'pointer-events-none' : ''}`} key={item.name}>
                            <div className={`flex items-center justify-between hover:bg-card hover:shadow-sm px-3 py-2.5 border border-transparent rounded-sm font-medium text-muted-foreground text-sm transition-all ${item.badge ? 'cursor-not-allowed opacity-50' : 'hover:border-border hover:text-primary'}`}>
                                <div className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </div>
                                {item.badge && <Badge variant={"outline"} className="ml-2 text-xs">{item.badge}</Badge>}
                            </div>
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