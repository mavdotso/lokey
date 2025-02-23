import { useCallback, useMemo } from 'react';
import { isCredentialsActive } from '@/lib/utils';
import { Credentials, CredentialsRequest } from '@/convex/types';

type FilterState = {
    searchTerm: string;
    sortOption: string;
    selectedTypes: string[];
    hideExpired: boolean;
};

type UseCredentialsFiltersProps = {
    activeTab: 'shared' | 'requested';
    credentials: Credentials[] | null;
    credentialsRequests: CredentialsRequest[] | null;
    filters: FilterState;
    currentPage: number;
    itemsPerPage: number;
};

export const useCredentialsFilters = ({
    activeTab,
    credentials,
    credentialsRequests,
    filters,
    currentPage,
    itemsPerPage,
}: UseCredentialsFiltersProps) => {
    const filterItems = useCallback(<T extends Credentials | CredentialsRequest>(items: T[], isCredentials: boolean): T[] => {
        if (!items) return [];

        return items
            .filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
                const matchesType = filters.selectedTypes.length === 0 ||
                    filters.selectedTypes.some(type =>
                        isCredentials
                            ? (item as Credentials).type === type
                            : (item as CredentialsRequest).credentials[0]?.type === type
                    );
                const isActive = isCredentials ? (!filters.hideExpired || isCredentialsActive(item as Credentials)) : true;

                return matchesSearch && matchesType && isActive;
            })
            .sort((a, b) => {
                if (filters.sortOption === 'createdAtAsc') return Number(a._creationTime) - Number(b._creationTime);
                if (filters.sortOption === 'createdAtDesc') return Number(b._creationTime) - Number(a._creationTime);
                if (filters.sortOption === 'updatedAt') return Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0);
                return a.name.localeCompare(b.name);
            });
    }, [filters]);

    const filteredItems = useMemo(() =>
        activeTab === 'shared'
            ? filterItems(credentials || [], true)
            : filterItems(credentialsRequests || [], false),
        [activeTab, credentials, credentialsRequests, filterItems]
    );

    const totalPages = useMemo(() =>
        Math.ceil(filteredItems.length / itemsPerPage),
        [filteredItems.length, itemsPerPage]
    );

    const paginatedItems = useMemo(() =>
        filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [currentPage, filteredItems, itemsPerPage]
    );

    const isFiltered = useMemo(() =>
        filters.searchTerm || filters.selectedTypes.length > 0 || (activeTab === 'shared' && filters.hideExpired),
        [filters, activeTab]
    );

    return {
        filteredItems,
        paginatedItems,
        totalPages,
        isFiltered,
    };
};