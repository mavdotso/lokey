
import { Search, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { SpacesDropdown } from '../spaces/spaces-dropdown';
import { auth } from '@/lib/auth';

interface SidebarProps {
    params: { spaceId: string };
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

export default async function Sidebar({ params, className, onToggleSidebar }: SidebarProps) {
    const session = await auth()
    return (
        <aside className={`w-56 h-full bg-card border-r border-muted flex flex-col ${className}`}>
            <div className="flex justify-between items-center gap-4 p-4 font-semibold text-gray-700">
                <SpacesDropdown userId={session!.user!.id!} />
            </div>
            <nav className="px-4 text-sm overflow-y-auto">
                {navItems.map((item) =>
                    item.href && (
                        <Link key={item.name} href={item.href} className="flex items-center hover:bg-muted px-2 py-1.5 rounded-md font-medium text-foreground/70 hover:text-foreground">
                            <item.icon className="mr-2 w-4 h-4" />
                            {item.name}
                        </Link>
                    )
                )}
            </nav>
        </aside>
    );
}