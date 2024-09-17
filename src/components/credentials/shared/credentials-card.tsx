import { api } from "@/convex/_generated/api";
import { Credentials, CredentialsRequest } from "@/convex/types";
import { useQuery } from "convex/react";
import { HashtagBadge } from "../hashtag-badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatTimestamp } from "@/lib/utils";
import UserAvatar from "@/components/global/user-avatar";
import { RequestedCredentialsActions } from "../requested/requested-credentials-actions";
import { EyeIcon, KeyIcon, TimerIcon } from "lucide-react";
import { CredentialsActions } from "./credentials-actions";

interface CredentialsCardProps {
    item: Credentials | CredentialsRequest;
    type: 'shared' | 'requested';
    onViewCredentials?: (secretPhrase: string) => Promise<void>;
}

export function CredentialsCard({ item, type, onViewCredentials }: CredentialsCardProps) {
    const isCredentials = type === 'shared';
    const creator = useQuery(api.users.getUser, item.createdBy ? { _id: item.createdBy } : "skip");

    function getCredentialTags(item: Credentials | CredentialsRequest) {
        if (isCredentials) {
            const tags: string[] = [(item as Credentials).type];
            if ((item as Credentials).type === 'custom') {
                tags.push('custom');
            }
            return tags;
        } else {
            return (item as CredentialsRequest).credentials.map(cred => cred.type);
        }
    }

    return (
        <div className="items-center gap-4 grid grid-cols-[repeat(4,minmax(0,1fr))] bg-card hover:bg-muted/50 p-4 border-b border-border last:border-b-0 text-xs transition-colors overflow-hidden">
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-foreground text-sm truncate">{isCredentials ? item.name : "Name here"}</span>
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
                {isCredentials ? (
                    getCredentialTags(item).map((tag, index) => (
                        <HashtagBadge key={index} text={tag} />
                    ))
                ) : (
                    <ScrollArea className="rounded-md max-w-full">
                        <div className="flex space-x-2 bg-muted/50 p-2 whitespace-nowrap">
                            {getCredentialTags(item).map((tag, index) => (
                                <HashtagBadge key={index} text={tag} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
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

    return (
        <>
            <div className="flex items-center gap-2 pl-1 text-md">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 shadow-[0px_0px_5px_3px_rgba(34,197,_94,_0.15)]' : 'bg-red-500 shadow-[0px_0px_5px_3px_rgba(239,68,_68,_0.15)]'}`}></div>
                <span className='text-md'>{isActive ? 'Active' : 'Expired'}</span>
            </div>
            <div className="flex justify-start items-start gap-4 text-muted-foreground">
                <div className='flex items-center gap-1'>
                    <TimerIcon className='w-4 h-4' />
                    <span>{credentials.expiresAt ? formatTimestamp(credentials.expiresAt) : 'No expiration'}</span>
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
    return (
        <>
            <div className="flex items-center gap-2 pl-1 text-md">
                <div className={`w-2 h-2 rounded-full ${getStatusStyles(request.status)}`}></div>
                <span className='text-md capitalize'>{request.status}</span>
            </div>
            <div className="flex justify-start items-start gap-4 text-muted-foreground">
                <div className='flex items-center gap-1'>
                    <KeyIcon className='w-4 h-4' />
                    <span>{request.credentials.length} credential(s)</span>
                </div>
            </div>
        </>
    );
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-500 shadow-[0px_0px_5px_3px_rgba(234,179,_8,_0.15)]';
        case 'approved':
            return 'bg-green-500 shadow-[0px_0px_5px_3px_rgba(34,197,_94,_0.15)]';
        case 'rejected':
            return 'bg-red-500 shadow-[0px_0px_5px_3px_rgba(239,68,_68,_0.15)]';
        default:
            return 'bg-gray-500 shadow-[0px_0px_5px_3px_rgba(107,114,_128,_0.15)]';
    }
}