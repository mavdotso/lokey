import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import LogoutButton from '../auth/logout-button';
import { Session } from 'next-auth';

export default function UserCard({ session }: { session: Session }) {
    return (
        <div className="flex justify-between items-center gap-2 px-4 py-2 w-full">
            <aside className="flex flex-grow justify-center items-center gap-2 min-w-0">
                <Avatar>
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback>
                        <User />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <small className="text-muted-foreground truncate">{session.user?.email}</small>
                </div>
            </aside>
            <div className="flex flex-shrink-0 justify-center items-center">
                <LogoutButton>
                    <LogOut className="w-4 h-4" />
                </LogoutButton>
            </div>
        </div>
    );
}