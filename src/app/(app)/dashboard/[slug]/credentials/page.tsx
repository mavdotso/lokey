'use client'

import { useState, use, useCallback, useMemo, memo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { PagePagination } from '@/components/global/page-pagination';
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageHeader } from '@/components/global/page-header';
import { useCredentialsManagement } from '@/hooks/use-credentials-management';
import { useCredentialsFilters } from '@/hooks/use-credentials-filters';
import { LoadingSkeleton } from '@/components/credentials/credentials-loading-skeleton';
import { CredentialsActionButtons } from '@/components/credentials/credentials-action-buttons';
import { TabsHeader } from '@/components/credentials/credentials-tabs-header';
import { TabContent } from '@/components/credentials/credentials-tab-content';

export type TabType = 'shared' | 'requested';

export default function CredentialsPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise)
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<TabType>('shared')
    const { state, actions } = useCredentialsManagement()

    const workspace = useQuery(api.workspaces.getWorkspaceBySlug, { slug: params.slug })
    const workspaceId = workspace?._id

    const credentials = useQuery(api.credentials.getWorkspaceCredentials, workspaceId ? { workspaceId } : 'skip')
    const credentialsRequests = useQuery(api.credentialsRequests.getWorkspaceCredentialsRequests, workspaceId ? { workspaceId } : 'skip')

    const isLoading = useMemo(() => !credentials || !credentialsRequests, [credentials, credentialsRequests])

    const itemsPerPage = 14
    const { paginatedItems, totalPages, isFiltered } = useCredentialsFilters({
        activeTab,
        credentials: credentials ?? null,
        credentialsRequests: credentialsRequests ?? null,
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage,
    })

    const handleTabChange = useCallback((value: string) => setActiveTab(value as TabType), [])
    const handleSetCurrentPage = useCallback((page: number) => actions.setCurrentPage(page), [actions])

    const resetFilters = useCallback(() => {
        actions.setFilters({
            searchTerm: '',
            sortOption: 'name',
            selectedTypes: [],
            hideExpired: false
        })
        actions.setCurrentPage(1)
    }, [actions])

    const handleFilterChange = useCallback((type: string, value: any) => {
        actions.setFilters({ [type]: value })
    }, [actions])

    const memoCredentialsActionsButtons = useMemo(() => <CredentialsActionButtons />, [])

    if (!session?.user) return <LoadingScreen />
    if (isLoading) return <LoadingSkeleton />

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Credentials">
                {memoCredentialsActionsButtons}
            </PageHeader>

            <div className={`${totalPages > 1 ? 'pb-10' : ''} overflow-auto grow flex flex-col px-8 py-4`}>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsHeader />
                    <TabsContent value="shared" className="mt-0">
                        <TabContent
                            type="shared"
                            isFiltered={!!isFiltered}
                            paginatedItems={paginatedItems}
                            filters={state.filters}
                            resetFilters={resetFilters}
                            handleFilterChange={handleFilterChange}
                            currentPage={state.currentPage}
                            itemsPerPage={itemsPerPage}
                        />
                    </TabsContent>
                    <TabsContent value="requested" className="mt-0">
                        <TabContent
                            type="requested"
                            isFiltered={!!isFiltered}
                            paginatedItems={paginatedItems}
                            filters={state.filters}
                            resetFilters={resetFilters}
                            handleFilterChange={handleFilterChange}
                            currentPage={state.currentPage}
                            itemsPerPage={itemsPerPage}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {totalPages > 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background to-transparent mx-auto pt-10">
                    <PagePagination
                        currentPage={state.currentPage}
                        totalPages={totalPages}
                        setCurrentPage={handleSetCurrentPage}
                    />
                </div>
            )}
        </div>
    )
}