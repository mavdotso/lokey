import { memo, useMemo } from "react";
import { CredentialsListSkeleton, CredentialsSortControlsSkeleton } from "../skeletons/credentials-skeleton";

export const LoadingSkeleton = memo(() => (
    <div className="flex flex-col flex-grow gap-4 p-4">
        {useMemo(() => <CredentialsSortControlsSkeleton />, [])}
        {useMemo(() => <CredentialsListSkeleton count={4} />, [])}
    </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton'; 