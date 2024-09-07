import { LogOut } from 'lucide-react';
import { Session } from 'next-auth';
import SignoutButton from '@/components/auth/signout-button';
import ThemeToggle from '@/components/global/theme-toggle';
import UserAvatar from '@/components/global/user-avatar';

export default function UserCard({ session }: { session: Session }) {
    return (
        <div className="flex justify-between items-center gap-2 py-2 w-full">
            <aside className="flex flex-grow justify-center items-center gap-2 min-w-0">
                {session.user && <UserAvatar user={session.user} />}
                <div className="flex flex-col min-w-0">
                    <small className="text-muted-foreground truncate">{session.user?.email}</small>
                </div>
            </aside>
            <div className="flex flex-shrink-0 justify-center items-center gap-2">
                <SignoutButton>
                    <LogOut className="w-4 h-4" />
                </SignoutButton>
                <ThemeToggle />
            </div>
        </div>
    );
}