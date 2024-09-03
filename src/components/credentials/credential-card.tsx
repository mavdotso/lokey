import { useQuery } from 'convex/react';
import { Credential } from '../../../convex/types';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../global/user-avatar';
import { formatTimestamp, getURL, isCredentialActive } from '@/lib/utils';
import { CheckIcon, CopyIcon, EyeIcon, LinkIcon, ShareIcon, TimerIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { HashtagBadge } from './hashtag-badge';
import { formatRelative, parseISO } from 'date-fns';


interface CredentialCardProps {
    credential: Credential;
}

export function CredentialCard({ credential }: CredentialCardProps) {

    const [isCopied, setIsCopied] = useState(false);

    const creator = useQuery(
        api.users.getUser,
        credential.createdBy ? { _id: credential.createdBy } : "skip"
    );

    const isActive = isCredentialActive(credential);

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

    function copyToClipboard() {
        navigator.clipboard.writeText(shareLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    function getCredentialTags() {
        const tags: string[] = [credential.type];
        if (credential.subtype) {
            tags.push(credential.subtype);
        }
        if (credential.type === 'custom' && credential.customTypeId) {
            tags.push('custom');
        }
        return tags;
    }

    const shareLink = `${getURL()}/shared/${credential._id}`;

    return (
        <div className="items-center gap-4 grid grid-cols-[2fr,2fr,1fr,1fr,1fr] bg-card p-4 border-b border-border last:border-b-0 text-xs">
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-foreground text-sm truncate">{credential.name}</span>
                <span className="text-muted-foreground text-sm truncate">{credential.description}</span>
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 pl-1 text-md">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className='text-md'>{isActive ? 'Active' : 'Expired'}</span>
                </div>
                {isActive && (
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className='flex items-center gap-1'>
                            <TimerIcon className='w-4 h-4' />
                            <span>{formatExpirationDate(credential.expiresAt)}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <EyeIcon className='w-4 h-4' />
                            <span>{credential.viewCount || 0} / {credential.maxViews || '∞'}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-1">
                {getCredentialTags().map((tag, index) => (
                    <HashtagBadge key={index} text={tag} />
                ))}
            </div>
            <div className="flex justify-center items-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                >
                    {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => console.log("share")}
                >
                    <ShareIcon className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex justify-end items-center space-x-2 text-muted-foreground">
                <div className="flex items-center gap-1 ml-auto">
                    <span className="whitespace-nowrap">{formatTimestamp(credential.updatedAt)} </span>
                    {creator && (
                        <div className='flex items-center gap-2'>
                            <span className="max-w-[100px] truncate">{" "} by {creator.name || creator.email.split('@')[0]}</span>
                            <UserAvatar user={creator} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}