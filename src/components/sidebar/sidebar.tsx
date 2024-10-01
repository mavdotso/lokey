
import { BoltIcon, FileLockIcon, KeyIcon, MessageSquareDashedIcon, MessageCircleQuestionIcon, LucideIcon, VaultIcon } from 'lucide-react';
import { UserCard } from '@/components/sidebar/user-card';
import { Session } from 'next-auth';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';
import { Separator } from '@/components/ui/separator';
import { UpgradeBox } from '@/components/sidebar/upgrade-box';
import { NavigationItem } from '@/components/sidebar/nav-item';

interface SidebarProps {
    params: { slug: string };
    session: Session;
    className?: string;
    onToggleSidebar?: () => void;
}

export interface NavItemProps {
    href?: string;
    icon: LucideIcon;
    name: string;
    onClick?: () => void,
    badge?: string;
}

const navItems: NavItemProps[] = [
    { href: 'credentials', icon: KeyIcon, name: 'Credentials' },
    { href: 'credentials', icon: VaultIcon, name: 'Vault', badge: 'soon' },
    { href: 'credentials', icon: FileLockIcon, name: 'Files', badge: 'soon' },
    { href: 'credentials', icon: MessageSquareDashedIcon, name: 'Chats', badge: 'soon' },
];

const helpItems: NavItemProps[] = [
    { href: 'settings', icon: BoltIcon, name: 'Settings' },
    { href: 'help', icon: MessageCircleQuestionIcon, name: 'Help & Support' },
]

export default function Sidebar({ params, session, className, onToggleSidebar }: SidebarProps) {
    return (
        <aside className={`w-60 h-full flex flex-col p-2 gap-4 ${className}`}>
            <div className="flex justify-start items-center gap-2 px-2 pt-4 pb-2 font-semibold">
                <WorkspacesDropdown />
            </div>
            <Separator />
            <nav className="flex flex-col flex-grow gap-2 px-2 py-2">
                {navItems.map((item) =>
                    item.href && (
                        <NavigationItem key={item.name} params={params} item={item} />
                    )
                )}
            </nav>
            <UpgradeBox />
            <div className='flex flex-col gap-1'>
                {helpItems.map((item) =>
                    <NavigationItem key={item.name} params={params} item={item} />
                )}
            </div>
            <Separator />
            <UserCard session={session} />
        </aside>
    );
}