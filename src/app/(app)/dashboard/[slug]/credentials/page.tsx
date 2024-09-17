'use client'
import { Dispatch, SetStateAction, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { Separator } from '@/components/ui/separator';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { NewCredentialsDialog } from '@/components/credentials/shared/credentials-dialog';
import { PagePagination } from '@/components/global/page-pagination';
import { isCredentialsActive } from '@/lib/utils';
import { CredentialsType } from '@/convex/types';
import { EmptySearch } from '@/components/credentials/empty-search';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateCredentialsRequestDialog } from '@/components/credentials/requested/create-credentials-request-dialog';
import { CredentialsList } from '@/components/credentials/shared/credentials-list';

type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';

interface CredentialsProps {
    params: { slug: string };
}

export default function CredentialsPage({ params }: CredentialsProps) {
    const session = useSession();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<CredentialsSortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<CredentialsType[]>([]);
    const [hideExpired, setHideExpired] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);

    const workspace = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: params.slug });
    const credentials = useQuery(api.credentials.getWorkspaceCredentials, workspace ? { workspaceId: workspace._id } : 'skip');
    const credentialsRequests = useQuery(api.credentials.getCredentialsRequests, workspace ? { workspaceId: workspace._id } : 'skip');

    if (credentials === undefined || credentialsRequests === undefined) return <LoadingScreen />;
    if (!session || !session.data || !session.data.user) return <LoadingScreen />;

    const filteredCredentials = credentials
        .filter(cred =>
            cred.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedTypes.length === 0 || selectedTypes.includes(cred.type as CredentialsType)) &&
            (!hideExpired || isCredentialsActive(cred))
        )
        .sort((a, b) => {
            if (sortOption === 'createdAtAsc') return Number(a._creationTime) - Number(b._creationTime);
            if (sortOption === 'createdAtDesc') return Number(b._creationTime) - Number(a._creationTime);
            if (sortOption === 'updatedAt') return Number(a.updatedAt ?? 0) - Number(b.updatedAt ?? 0);
            return a.name.localeCompare(b.name);
        });

    const isFiltered = searchTerm || selectedTypes.length > 0 || hideExpired;
    const itemsPerPage = 14;
    const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);
    const paginatedCredentials = filteredCredentials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    function resetFilters() {
        setSearchTerm('');
        setSelectedTypes([]);
        setHideExpired(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className='flex justify-between items-center px-8 py-6'>
                <h1 className='font-bold text-2xl'>Credentials</h1>
                <div className='flex gap-2'>
                    <NewCredentialsDialog
                        isOpen={isRequestDialogOpen}
                        setIsOpen={setRequestDialogOpen}
                        formType="request"
                    >
                        <Button variant="outline">New credentials request</Button>
                    </NewCredentialsDialog>
                    <NewCredentialsDialog
                        isOpen={isCreateDialogOpen}
                        setIsOpen={setCreateDialogOpen}
                        formType="new"
                    >
                        <Button className='gap-2' variant="outline">
                            <PlusIcon className='w-4 h-4' />
                            New credentials
                        </Button>
                    </NewCredentialsDialog>
                </div>
            </div>
            <Separator />
            <div className={`${totalPages > 1 && 'pb-10'} overflow-auto`}>
                <Tabs defaultValue="shared" className='px-8 py-4'>
                    <TabsList>
                        <TabsTrigger value="shared">Shared</TabsTrigger>
                        <TabsTrigger value="requested">Requested</TabsTrigger>
                    </TabsList>
                    <TabsContent value="shared">
                        {credentials.length === 0 ? (
                            <div className='flex flex-col justify-center items-center gap-4 w-full h-full'>
                                <p className='text-lg'>You don&apos;t have any credentials yet</p>
                                {/* <CreateNewCredentialsDialog isOpen={isCreateDialogOpen} setIsOpen={setCreateDialogOpen} /> */}
                            </div>
                        ) : (
                            <div className='flex flex-col flex-grow gap-4 pt-4'>
                                <CredentialsSortControls
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    sortOption={sortOption}
                                    onSortChange={(value: string) => setSortOption(value as CredentialsSortOption)}
                                    selectedTypes={selectedTypes}
                                    onTypeChange={types => setSelectedTypes(types as CredentialsType[])}
                                    hideExpired={hideExpired}
                                    onHideExpiredChange={setHideExpired}
                                />
                                {paginatedCredentials.length === 0 && isFiltered ? (
                                    <EmptySearch onResetFilters={resetFilters} />
                                ) : (
                                    <CredentialsList
                                        items={filteredCredentials}
                                        type="shared"
                                        currentPage={currentPage}
                                        itemsPerPage={itemsPerPage}
                                    />
                                )}
                            </div >
                        )}
                    </TabsContent>
                    <TabsContent value="requested">
                        {credentialsRequests.length === 0 ? (
                            <div className='flex flex-col justify-center items-center gap-4 w-full h-full'>
                                <p className='text-lg'>No credential requests yet</p>
                                <CreateCredentialsRequestDialog />
                            </div>
                        ) : (
                            <div className='flex flex-col flex-grow gap-4 pt-4'>
                                <CredentialsList
                                    items={credentialsRequests}
                                    type="requested"
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            {
                totalPages > 1 && (
                    <div className="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-background to-transparent mx-auto pt-10">
                        <PagePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )
            }
        </div >
    );
}