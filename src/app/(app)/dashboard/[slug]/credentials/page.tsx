'use client'

import { useState, use, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { CredentialsDialog } from '@/components/credentials/credentials-dialog';
import { PagePagination } from '@/components/global/page-pagination';
import { isCredentialsActive } from '@/lib/utils';
import { Credentials, CredentialsRequest, CredentialsType } from '@/convex/types';
import { EmptySearch } from '@/components/credentials/empty-search';
import { Button } from '@/components/ui/button';
import { InboxIcon, Share2Icon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CredentialsList } from '@/components/credentials/credentials-list';
import { PageHeader } from '@/components/global/page-header';
import { CredentialsListSkeleton, CredentialsSortControlsSkeleton } from '@/components/skeletons/credentials-skeleton';
import { useCredentialsManagement } from '@/hooks/use-credentials-management';
import type { 
  CredentialsSortOption, 
  CredentialsDialogType 
} from '@/hooks/use-credentials-management';


type TabType = 'shared' | 'requested';

interface CredentialsProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function CredentialsPage(props: CredentialsProps) {
    const params = use(props.params);
    const session = useSession();

    const [activeTab, setActiveTab] = useState<TabType>('shared');

    const { state, actions } = useCredentialsManagement();

    const workspace = useQuery(api.workspaces.getWorkspaceBySlug, { slug: params.slug });
    const credentials = useQuery(api.credentials.getWorkspaceCredentials, workspace ? { workspaceId: workspace._id } : 'skip');
    const credentialsRequests = useQuery(api.credentialsRequests.getWorkspaceCredentialsRequests, workspace ? { workspaceId: workspace._id } : 'skip');

    const isLoading = credentials === undefined || credentialsRequests === undefined;

    const filterItems = useCallback(<T extends Credentials | CredentialsRequest>(items: T[], isCredentials: boolean): T[] => {
        if (!items) return [];
        return items.filter(item =>
            item.name.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) &&
            (state.filters.selectedTypes.length === 0 ||
                state.filters.selectedTypes.some(type =>
                (isCredentials
                    ? (item as Credentials).type === type
                    : (item as CredentialsRequest).credentials[0]?.type === type)
                )) &&
            (isCredentials ? (!state.filters.hideExpired || isCredentialsActive(item as Credentials)) : true)
        ).sort((a, b) => {
            if (state.filters.sortOption === 'createdAtAsc') return Number(a._creationTime) - Number(b._creationTime);
            if (state.filters.sortOption === 'createdAtDesc') return Number(b._creationTime) - Number(a._creationTime);
            if (state.filters.sortOption === 'updatedAt') return Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0);
            return a.name.localeCompare(b.name);
        });
    }, [state.filters]);

    const resetFilters = () => {
        actions.setFilters({
            searchTerm: '',
            sortOption: 'name',
            selectedTypes: [],
            hideExpired: false
        });
        actions.setCurrentPage(1);
    };

    const filteredItems = activeTab === 'shared' ? filterItems(credentials || [], true) : filterItems(credentialsRequests || [], false);

    const isFiltered = state.filters.searchTerm || state.filters.selectedTypes.length > 0 || (activeTab === 'shared' && state.filters.hideExpired);
    const itemsPerPage = 14;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((state.currentPage - 1) * itemsPerPage, state.currentPage * itemsPerPage);

    function renderContent(type: TabType) {
        const items = type === 'shared' ? credentials : credentialsRequests;

        if (!items || items.length === 0) {
            return (
                <div className='flex justify-center items-center py-8 grow'>
                    <p className='text-muted-foreground text-center'>
                        {type === 'shared' ? "Share your first credentials to see them here" : "Request your first credentials to see them here"}
                    </p>
                </div>
            );
        }

        return (
            <div className='flex flex-col gap-4 pt-4 grow'>
                <CredentialsSortControls
                    {...state.filters}
                    onSearchChange={(searchTerm) => actions.setFilters({ searchTerm })}
                    onSortChange={(sortOption) => actions.setFilters({ sortOption: sortOption as CredentialsSortOption })}
                    onTypeChange={(types) => actions.setFilters({ selectedTypes: types as CredentialsType[] })}
                    onHideExpiredChange={(hideExpired) => actions.setFilters({ hideExpired })}
                    showHideExpired={type === 'shared'}
                />
                {paginatedItems.length === 0 && isFiltered ? (
                    <EmptySearch onResetFilters={resetFilters} />
                ) : (
                    <CredentialsList
                        items={paginatedItems}
                        type={type}
                        currentPage={state.currentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </div>
        );
    };

    if (!session || !session.data || !session.data.user) return <LoadingScreen />;

    if (isLoading) return (
        <div className='flex flex-col flex-grow gap-4 p-4'>
            <CredentialsSortControlsSkeleton />
            <CredentialsListSkeleton count={4} />
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Credentials">
                <CredentialsDialog
                    isOpen={state.isCreateDialogOpen}
                    setIsOpen={() => actions.setDialogOpen('create', !state.isCreateDialogOpen)}
                    formType="new"
                >
                    <Button className='gap-2' variant={"outline"} >
                        <Share2Icon className='w-4 h-4' />
                        Share credentials
                    </Button>
                </CredentialsDialog>
                <CredentialsDialog
                    isOpen={state.isRequestDialogOpen}
                    setIsOpen={() => actions.setDialogOpen('request', !state.isRequestDialogOpen)}
                    formType="request"
                >
                    <Button className='gap-2'>
                        <InboxIcon className='w-4 h-4' />
                        Request credentials
                    </Button>
                </CredentialsDialog>
            </PageHeader>
            <div className={`${totalPages > 1 && 'pb-10'} overflow-auto grow flex flex-col`}>
                <Tabs
                    value={activeTab}
                    defaultValue="shared"
                    className='px-8 py-4 h-full'
                    onValueChange={(value) => setActiveTab(value as TabType)}
                >
                    <TabsList>
                        <TabsTrigger value="shared">Shared</TabsTrigger>
                        <TabsTrigger value="requested">Requested</TabsTrigger>
                    </TabsList>
                    <TabsContent value="shared">
                        {renderContent('shared')}
                    </TabsContent>
                    <TabsContent value="requested">
                        {renderContent('requested')}
                    </TabsContent>
                </Tabs>
            </div>
            {totalPages > 1 && (
                <div className="right-0 bottom-0 left-0 absolute bg-linear-to-t from-background to-transparent mx-auto pt-10">
                    <PagePagination
                        currentPage={state.currentPage}
                        totalPages={totalPages}
                        setCurrentPage={(page) => actions.setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
}