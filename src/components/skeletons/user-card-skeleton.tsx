import { Skeleton } from "@/components/ui/skeleton"

export function UserCardSkeleton() {
    return (
        <div className='flex flex-row gap-2'>
            <Skeleton className="rounded-full w-8 h-8" /> 
            <div className="flex-1 grid text-left">
                <Skeleton className="w-24 h-4" /> 
                <Skeleton className="mt-1 w-32 h-3" /> 
            </div>
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8" /> 
                <Skeleton className="w-8 h-8" />
            </div>
        </div>
    )
}