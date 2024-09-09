
import { useQuery } from 'convex/react';
import { formatTimestamp, isCredentialsActive } from '@/lib/utils';
import { EyeIcon, TimerIcon } from 'lucide-react';
import { HashtagBadge } from '@/components/credentials/hashtag-badge';
import { formatRelative, parseISO } from 'date-fns';
import { Credentials } from '@/convex/types';
import { api } from '@/convex/_generated/api';
import UserAvatar from '@/components/global/user-avatar';
import { CredentialsActions } from './credentials-actions';

interface CredentialCardProps {
    credentials: Credentials;
}

export function CredentialsCard({ credentials }: CredentialCardProps) {

    const creator = useQuery(
        api.users.getUser,
        credentials.createdBy ? { _id: credentials.createdBy } : "skip"
    );

    const isActive = isCredentialsActive(credentials);

    function formatExpirationDate(expiresAt: string | undefined) {
        if (!expiresAt) return 'No expiration';
        const date = parseISO(expiresAt);
        if (isNaN(date.getTime())) return 'Invalid date';

        const now = new Date();
        if (date > now) {
            return `Expires ${formatRelative(date, now)}`;
        } else {
            return 'Expired';
        }
    };


    function getCredentialTags() {
        const tags: string[] = [credentials.type];
        if (credentials.subtype) {
            tags.push(credentials.subtype);
        }
        if (credentials.type === 'custom' && credentials.customTypeId) {
            tags.push('custom');
        }
        return tags;
    }


    return (
        <div className="items-center gap-4 grid grid-cols-[repeat(4,minmax(0,1fr))] bg-card hover:bg-muted/50 p-4 border-b border-border last:border-b-0 text-xs transition-colors overflow-hidden">
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-foreground text-sm truncate">{credentials.name}</span>
                <span className="text-muted-foreground text-sm truncate">{credentials.description}</span>
            </div>
            <div className="flex flex-col justify-start space-y-2">
                <div className="flex items-center gap-2 pl-1 text-md">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className='text-md'>{isActive ? 'Active' : 'Expired'}</span>
                </div>
                <div className="flex justify-start items-start gap-4 text-muted-foreground">
                    <div className='flex items-center gap-1'>
                        <TimerIcon className='w-4 h-4' />
                        <span>{formatExpirationDate(credentials.expiresAt)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <EyeIcon className='w-4 h-4' />
                        <span>{credentials.viewCount || 0} / {credentials.maxViews || '∞'}</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-start gap-1">
                {getCredentialTags().map((tag, index) => (
                    <HashtagBadge key={index} text={tag} />
                ))}
            </div>
            <div className="flex justify-end items-center space-x-2 text-muted-foreground">
                <div className="flex items-center gap-4 ml-auto">
                    {creator && (
                        <div className='flex items-center gap-2'>
                            <span className="truncate whitespace-nowrap">{formatTimestamp(credentials.updatedAt)} {" "} by {creator.name || creator.email.split('@')[0]}</span>
                            <UserAvatar user={creator} />
                        </div>
                    )}
                    <CredentialsActions credentials={credentials} />
                </div>
            </div>
        </div>

    );
}