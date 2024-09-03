import { useQuery } from 'convex/react';
import { Credential } from '../../../convex/types';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../global/user-avatar';
import { formatTimestamp, getURL } from '@/lib/utils';
import { CheckIcon, CopyIcon, EyeIcon, LinkIcon, ShareIcon, TimerIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';


interface CredentialCardProps {
    credential: Credential;
}

export function CredentialCard({ credential }: CredentialCardProps) {

    const [isCopied, setIsCopied] = useState(false);

    const creator = useQuery(
        api.users.getUser,
        credential.createdBy ? { _id: credential.createdBy } : "skip"
    );

    function isActive() {
        const now = new Date().getTime();

        const expiresAtTimestamp = typeof credential.expiresAt === 'string'
            ? new Date(credential.expiresAt).getTime()
            : Number(credential.expiresAt);

        const notExpired = !credential.expiresAt || (isFinite(expiresAtTimestamp) && expiresAtTimestamp > now);
        const hasRemainingViews = !credential.maxViews || (credential.viewCount || 0) < credential.maxViews;

        return notExpired && hasRemainingViews;
    }

    function formatExpirationDate(expiresAt: number | null) {
        if (!expiresAt) return 'No expiration';
        return formatTimestamp(expiresAt.toString());
    };

    function copyToClipboard() {
        navigator.clipboard.writeText(shareLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const shareLink = `${getURL()}/shared/${credential._id}`;

    return (
        <div className="items-center gap-4 grid grid-cols-[2fr,2fr,1fr,1fr] bg-card hover:bg-secondary p-4 border-b border-border text-xs">
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-foreground text-sm truncate">{credential.name}</span>
                <span className="text-muted-foreground text-sm truncate">{credential.description}</span>
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 pl-1 text-md">
                    <div className={`w-2 h-2 rounded-full ${isActive() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className='text-md'>{isActive() ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className='flex items-center gap-1'>
                        <TimerIcon className='w-4 h-4' />
                        <span>{formatExpirationDate(credential.expiresAt ? Number(credential.expiresAt) : null)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <EyeIcon className='w-4 h-4' />
                        <span>{credential.viewCount || 0} / {credential.maxViews || '∞'}</span>
                    </div>
                </div>
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