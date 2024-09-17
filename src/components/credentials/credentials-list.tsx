import { Credentials, CredentialsRequest } from '@/convex/types';
import { CredentialsCard } from './credentials-card';

interface CredentialsListProps {
    items: Array<Credentials | CredentialsRequest>;
    type: 'shared' | 'requested';
    currentPage: number;
    itemsPerPage: number;
}

export function CredentialsList({ items, type, currentPage, itemsPerPage }: CredentialsListProps) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return (
        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
            {paginatedItems.map((item) => (
                <CredentialsCard
                    key={item._id}
                    item={item}
                    type={type}
                />
            ))}
        </div>
    );
}