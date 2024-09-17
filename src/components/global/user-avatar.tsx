import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserIcon } from 'lucide-react';
import { User } from 'next-auth';

export function UserAvatar({ user }: { user: User }) {
    return (
        <Avatar>
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>
                {user.name ? (
                    user.name.slice(0, 2).toUpperCase()
                ) : user.email ? (
                    user.email.slice(0, 2).toUpperCase()
                ) : (
                    <UserIcon />
                )}
            </AvatarFallback>
        </Avatar>
    );
}