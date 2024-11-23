import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function CredentialsCardSkeleton() {
    return (
        <div className="items-center gap-4 grid grid-cols-[repeat(4,minmax(0,1fr))] bg-card p-4 border-b border-border last:border-b-0 text-xs">
            <div className="flex flex-col gap-3">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="rounded-full w-2 h-2" />
                    <Skeleton className="w-16 h-3" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex items-center gap-1">
                        <Skeleton className="w-4 h-3" />
                        <Skeleton className="w-16 h-3" />
                    </div>
                </div>
            </div>
            <div className="flex justify-start gap-1">
                <ScrollArea className="rounded-md max-w-full">
                    <div className="flex space-x-2 bg-muted/50 p-2">
                        <Skeleton className="w-20 h-4" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <div className="flex justify-end items-center">
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-32 h-3" />
                        <Skeleton className="rounded-full w-10 h-10" />
                    </div>
                    <Skeleton className="w-8 h-4" />
                </div>
            </div>
        </div>
    );
}

export function CredentialsSortControlsSkeleton() {
    return (
        <div className="flex items-center gap-6 w-full">
            <div className="flex-1">
                <Skeleton className="w-full h-10" /> {/* Search input */}
            </div>
            <div className="w-[200px]">
                <Skeleton className="w-full h-10" /> {/* Type filter */}
            </div>
            <div className="w-[200px]">
                <Skeleton className="w-full h-10" /> {/* Sort dropdown */}
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
                <Skeleton className="rounded-[5px] w-4 h-4" /> {/* Checkbox */}
                <Skeleton className="w-20 h-4" /> {/* Label */}
            </div>
        </div>
    );
}

export function CredentialsListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
                <CredentialsCardSkeleton key={index} />
            ))}
        </div>
    );
}