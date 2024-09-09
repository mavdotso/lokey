"use client"
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { Separator } from '@/components/ui/separator';
import { CredentialsType } from '@/convex/types';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { CredentialCard } from '@/components/credentials/credential-card';
import { CreateCredentialsDialog } from '@/components/credentials/create-credentials-dialog';
import { useSession } from 'next-auth/react';
import { isCredentialsActive } from '@/lib/utils';
import { PagePagination } from '@/components/global/page-pagination';

type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';

interface DashboardProps {
    params: { slug: string };
}

export default function DashboardPage({ params }: DashboardProps) {
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<CredentialsSortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<CredentialsType[]>([]);
    const [hideExpired, setHideExpired] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const workspace = useQuery(api.workspaces.getWorkspaceIdBySlug, { slug: params.slug });
    const credentials = useQuery(api.credentials.getWorkspaceCredentials, workspace ? { workspaceId: workspace._id } : 'skip');

    if (credentials === undefined) return <LoadingScreen />;
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
    const itemsPerPage = 9;
    const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);
    const paginatedCredentials = filteredCredentials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            <div className='flex justify-between items-center px-8 py-4'>
                <h1 className='font-bold text-2xl'>Credentials</h1>
                <CreateCredentialsDialog buttonVariant={'outline'} buttonText='New credentials' />
            </div>
            <Separator />
            {credentials.length === 0 ? (
                <div className='flex flex-col justify-center items-center gap-8 px-8 py-4 w-full h-full'>
                    <p className='text-lg'>You don&apos;t have any credentials yet</p>
                    <CreateCredentialsDialog />
                </div>
            ) : (
                <div className='flex flex-col flex-grow gap-4 p-8 pt-10'>
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
                        <div className='flex flex-col flex-grow justify-center items-center gap-8 p-8 w-full h-full'>
                            <p className='text-lg'>No credentials matching the current filters</p>
                            <span
                                className='underline cursor-pointer'
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTypes([]);
                                    setHideExpired(false);
                                }}
                            >
                                Reset Filters
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
                            {paginatedCredentials.map((cred) => (
                                <CredentialCard key={cred._id} credentials={cred} />
                            ))}
                        </div>
                    )}
                </div >
            )}
            <div className="mt-auto">
                {totalPages > 1 && (
                    <PagePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}
