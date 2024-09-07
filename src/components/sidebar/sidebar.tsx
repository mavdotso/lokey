
import { Search, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@radix-ui/react-select';
import UserCard from '@/components/sidebar/user-card';
import { Session } from 'next-auth';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';

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
    { href: '/', icon: Search, name: 'Search' },
    { icon: Trash2Icon, name: 'Trash', onClick: () => { } },
];

export default function Sidebar({ params, session, className, onToggleSidebar }: SidebarProps) {
    return (
        <aside className={`w-64 h-full flex flex-col p-4 ${className}`}>
            <div className="flex justify-between items-center gap-2 font-semibold text-gray-700">
                <WorkspacesDropdown />
            </div>
            <nav className="mt-4 text-sm overflow-y-auto">
                {navItems.map((item) =>
                    item.href && (
                        <Link key={item.name} href={item.href} className="flex items-center hover:bg-muted px-2 py-1.5 rounded-md font-medium text-foreground/70 hover:text-foreground">
                            <item.icon className="mr-2 w-4 h-4" />
                            {item.name}
                        </Link>
                    )
                )}
            </nav>
            <div className="mt-auto">
                <Separator />
                {session && <UserCard session={session} />}
                <Separator />
            </div>
        </aside>
    );
}