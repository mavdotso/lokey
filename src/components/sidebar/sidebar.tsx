
import { UsersIcon, BoltIcon, FileLockIcon, KeyIcon, MessageSquareDashedIcon, MessageCircleQuestionIcon, LogOutIcon } from 'lucide-react';
import UserCard from '@/components/sidebar/user-card';
import { Session } from 'next-auth';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';
import { Separator } from '@/components/ui/separator';
import { UpgradeBox } from './upgrade-box';
import { NavigationItem } from './nav-item';
import { signOut } from '@/lib/auth';

interface SidebarProps {
    params: { slug: string };
    session: Session;
    className?: string;
    onToggleSidebar?: () => void;
}

export interface NavItemProps {
    href?: string;
    icon: React.ElementType;
    name: string;
    onClick?: () => void,
    badge?: string;
}

const navItems: NavItemProps[] = [
    { href: 'credentials', icon: KeyIcon, name: 'Credentials' },
    { href: 'credentials', icon: FileLockIcon, name: 'Files', badge: 'soon' },
    { href: 'credentials', icon: MessageSquareDashedIcon, name: 'Chats', badge: 'soon' },
    { href: 'users', icon: UsersIcon, name: 'Users' },
    { href: 'settings', icon: BoltIcon, name: 'Settings' },
];

const helpItems: NavItemProps[] = [
    { href: 'help', icon: MessageCircleQuestionIcon, name: 'Help & Support' },
    { href: '', icon: LogOutIcon, name: 'Sign out', onClick: signOut },
]

export default function Sidebar({ params, session, className, onToggleSidebar }: SidebarProps) {
    return (
        <aside className={`w-60 h-full flex flex-col p-4 gap-4 ${className}`}>
            <div className="flex justify-start items-center gap-2 py-2 font-semibold">
                <WorkspacesDropdown />
            </div>
            <Separator />
            <nav className="flex flex-col flex-grow gap-2 py-4">
                {navItems.map((item) =>
                    item.href && (
                        <NavigationItem key={item.name} params={params} item={item} />
                    )
                )}
            </nav>
            <UpgradeBox />
            <div className='space-y-4'>
                <div className='flex flex-col gap-2'>
                    {helpItems.map((item) =>
                        <NavigationItem key={item.name} params={params} item={item} />
                    )}
                </div>
                <Separator />
                <UserCard session={session} />
            </div>
        </aside>
    );
}