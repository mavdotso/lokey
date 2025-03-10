import { api } from "@/convex/_generated/api";
import { Credentials, CredentialsRequest } from "@/convex/types";
import { useQuery } from "convex/react";
import { HashtagBadge } from "./hashtag-badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatTimestamp } from "@/lib/utils";
import { UserAvatar } from "@/components/global/user-avatar";
import { EyeIcon, KeyIcon, TimerIcon } from "lucide-react";
import { CredentialsActions } from "./credentials-actions";

interface CredentialsCardProps {
    item: Credentials | CredentialsRequest;
    type: 'shared' | 'requested';
}

export function CredentialsCard({ item, type }: CredentialsCardProps) {
    const isCredentials = type === 'shared';
    const creator = useQuery(api.users.getUser, item.createdBy ? { userId: item.createdBy } : "skip");

    function getCredentialsTags(item: Credentials | CredentialsRequest) {
        if (isCredentials) {
            const tags: string[] = [(item as Credentials).type];
            if ((item as Credentials).type === 'CUSTOM') {
                tags.push('custom');
            }
            return tags;
        } else {
            const credentials = (item as CredentialsRequest).credentials || [];
            const uniqueTags = new Set(credentials.map(cred => cred.type));
            return Array.from(uniqueTags);
        }
    }

    return (
        <div className="items-center gap-4 grid grid-cols-[repeat(4,minmax(0,1fr))] bg-card hover:bg-muted/50 p-4 border-b border-border last:border-b-0 text-xs transition-colors overflow-hidden">
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-foreground text-sm truncate">{item.name}</span>
                <span className="text-muted-foreground text-sm truncate">{item.description}</span>
            </div>
            <div className="flex flex-col justify-start space-y-2">
                {isCredentials ? (
                    <CredentialsStatusInfo credentials={item as Credentials} />
                ) : (
                    <RequestStatusInfo request={item as CredentialsRequest} />
                )}
            </div>
            <div className="flex justify-start gap-1">
                <ScrollArea className="rounded-md max-w-full">
                    <div className="flex space-x-2 bg-muted/50 p-2 whitespace-nowrap">
                        {getCredentialsTags(item).map((tag, index) => (
                            <HashtagBadge key={index} text={tag} />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <div className="flex justify-end items-center space-x-2 text-muted-foreground">
                <div className="flex items-center gap-4 ml-auto">
                    {creator && (
                        <div className='flex items-center gap-2'>
                            <span className="truncate whitespace-nowrap">
                                {isCredentials ? `${formatTimestamp(item.updatedAt)} by ` : "by "}
                                {creator.name || creator.email.split('@')[0]}
                            </span>
                            <UserAvatar user={creator} />
                        </div>
                    )}
                    <CredentialsActions item={item} type={type} />
                </div>
            </div>
        </div>
    );
}

interface CredentialsStatusInfoProps {
    credentials: Credentials;
}

export function CredentialsStatusInfo({ credentials }: CredentialsStatusInfoProps) {
    const isActive = credentials.expiresAt ? new Date(credentials.expiresAt) > new Date() : true;
    const status = isActive ? 'active' : 'expired';

    return (
        <>
            <div className="flex items-center gap-2 pl-1 text-md">
                <div className={`w-2 h-2 rounded-full ${getStatusStyles(status)}`}></div>
                <span className='text-md capitalize'>{status}</span>
            </div>
            <div className="flex justify-start items-start gap-4 text-muted-foreground">
                <div className='flex items-center gap-1'>
                    <TimerIcon className='w-4 h-4' />
                    <span>{credentials.expiresAt ? new Date(credentials.expiresAt).toLocaleDateString() : 'No expiration'}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <EyeIcon className='w-4 h-4' />
                    <span>{credentials.viewCount || 0} / {credentials.maxViews || '∞'}</span>
                </div>
            </div>
        </>
    );
}

interface RequestStatusInfoProps {
    request: CredentialsRequest
}

export function RequestStatusInfo({ request }: RequestStatusInfoProps) {
    const credentialsCount = request.credentials?.length || 0;
    const status = request.status?.toLowerCase() || '';

    return (
        <>
            <div className="flex items-center gap-2 pl-1 text-md">
                <div className={`w-2 h-2 rounded-full ${getStatusStyles(request.status)}`}></div>
                <span className='text-md capitalize'>{status.toLowerCase()}</span>
            </div>
            <div className="flex justify-start items-start gap-4 text-muted-foreground">
                <div className='flex items-center gap-1'>
                    <KeyIcon className='w-4 h-4' />
                    <span>{credentialsCount} credentials</span>
                </div>
            </div>
        </>
    );
}

function getStatusStyles(status: string | undefined) {
    const normalizedStatus = (status || '').toLowerCase();

    switch (normalizedStatus) {
        case 'pending':
            return 'bg-yellow-500 shadow-[0px_0px_5px_3px_rgba(234,179,_8,_0.15)]';
        case 'fulfilled':
        case 'active':
            return 'bg-green-500 shadow-[0px_0px_5px_3px_rgba(34,197,_94,_0.15)]';
        case 'rejected':
        case 'expired':
            return 'bg-red-500 shadow-[0px_0px_5px_3px_rgba(239,68,_68,_0.15)]';
        default:
            return 'bg-gray-500 shadow-[0px_0px_5px_3px_rgba(107,114,_128,_0.15)]';
    }
}