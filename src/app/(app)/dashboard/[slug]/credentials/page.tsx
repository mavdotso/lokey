'use client'
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { Separator } from '@/components/ui/separator';
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

type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';

type TabType = 'shared' | 'requested';

interface CredentialsProps {
    params: { slug: string };
}

export default function CredentialsPage({ params }: CredentialsProps) {
    const session = useSession();
    const [activeTab, setActiveTab] = useState<TabType>('shared');
    const [filters, setFilters] = useState({
        searchTerm: '',
        sortOption: 'name' as CredentialsSortOption,
        selectedTypes: [] as CredentialsType[],
        hideExpired: false,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);

    const workspace = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: params.slug });
    const credentials = useQuery(api.credentials.getWorkspaceCredentials, workspace ? { workspaceId: workspace._id } : 'skip');
    const credentialsRequests = useQuery(api.credentials.getCredentialsRequests, workspace ? { workspaceId: workspace._id } : 'skip');

    if (credentials === undefined || credentialsRequests === undefined) return <LoadingScreen />;
    if (!session || !session.data || !session.data.user) return <LoadingScreen />;

    const filterItems = <T extends Credentials | CredentialsRequest>(items: T[], isCredentials: boolean): T[] => {
        return items.filter(item =>
            item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            (filters.selectedTypes.length === 0 || filters.selectedTypes.includes((isCredentials ? (item as Credentials).type : (item as CredentialsRequest).credentials[0]?.type) as CredentialsType)) &&
            (isCredentials ? (!filters.hideExpired || isCredentialsActive(item as Credentials)) : true)
        ).sort((a, b) => {
            if (filters.sortOption === 'createdAtAsc') return Number(a._creationTime) - Number(b._creationTime);
            if (filters.sortOption === 'createdAtDesc') return Number(b._creationTime) - Number(a._creationTime);
            if (filters.sortOption === 'updatedAt') return Number(a.updatedAt ?? 0) - Number(b.updatedAt ?? 0);
            return a.name.localeCompare(b.name);
        });
    };

    const filteredItems = activeTab === 'shared' ? filterItems(credentials, true) : filterItems(credentialsRequests, false);

    const isFiltered = filters.searchTerm || filters.selectedTypes.length > 0 || (activeTab === 'shared' && filters.hideExpired);
    const itemsPerPage = 14;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    function resetFilters() {
        setFilters({
            searchTerm: '',
            sortOption: 'name',
            selectedTypes: [],
            hideExpired: false,
        });
    }

    const renderContent = (type: TabType) => (
        (type === 'shared' ? credentials : credentialsRequests).length === 0 ? (
            <div className='flex flex-grow justify-center items-center py-8'>
                <p className='text-center text-muted-foreground'>{type === 'shared' ? "Share your first credentials to see them here" : "Request your first credentials to see them here"}</p>
            </div>
        ) : (
            <div className='flex flex-col flex-grow gap-4 pt-4'>
                <CredentialsSortControls
                    {...filters}
                    onSearchChange={(searchTerm) => setFilters({ ...filters, searchTerm })}
                    onSortChange={(sortOption) => setFilters({ ...filters, sortOption: sortOption as CredentialsSortOption })}
                    onTypeChange={(types) => setFilters({ ...filters, selectedTypes: types as CredentialsType[] })}
                    onHideExpiredChange={(hideExpired) => setFilters({ ...filters, hideExpired })}
                    showHideExpired={type === 'shared'}
                />
                {paginatedItems.length === 0 && isFiltered ? (
                    <EmptySearch onResetFilters={resetFilters} />
                ) : (
                    <CredentialsList
                        items={paginatedItems}
                        type={type}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </div>
        )
    );

    return (
        <div className="flex flex-col h-full">
            <div className='flex justify-between items-center px-8 py-6'>
                <h1 className='font-bold text-2xl'>Credentials</h1>
                <div className='flex gap-2'>
                    <CredentialsDialog
                        isOpen={isCreateDialogOpen}
                        setIsOpen={setCreateDialogOpen}
                        formType="new"
                    >
                        <Button className='gap-2' variant={"outline"} size={"lg"}>
                            <Share2Icon className='w-4 h-4' />
                            Share credentials
                        </Button>
                    </CredentialsDialog>
                    <CredentialsDialog
                        isOpen={isRequestDialogOpen}
                        setIsOpen={setRequestDialogOpen}
                        formType="request"
                    >
                        <Button className='gap-2' size={"lg"}>
                            <InboxIcon className='w-4 h-4' />
                            Request credentials
                        </Button>
                    </CredentialsDialog>
                </div>
            </div>
            <Separator />
            <div className={`${totalPages > 1 && 'pb-10'} overflow-auto flex-grow flex flex-col`}>
                <Tabs defaultValue="shared" className='px-8 py-4 h-full' onValueChange={(value) => setActiveTab(value as TabType)}>
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
                <div className="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-background to-transparent mx-auto pt-10">
                    <PagePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}