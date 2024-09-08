"use client"
import LoadingScreen from '@/components/global/loading-screen';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { Separator } from '@/components/ui/separator';
import { isCredentialsActive } from '@/lib/utils';
import { CredentialsType } from '@/convex/types';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { CredentialCard } from '@/components/credentials/credential-card';
import { CreateCredentialsDialog } from '@/components/credentials/create-credentials-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { api } from '@/convex/_generated/api';

type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';

export default function DashboardPage() {
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<CredentialsSortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<CredentialsType[]>([]);
    const [hideExpired, setHideExpired] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const credentials = useQuery(api.credentials.getUserCredentials, {
        userId: session.data?.user?.id ?? ''
    });

    if (credentials === undefined) return <LoadingScreen />

    if (!session || !session.data || !session.data.user) {
        return <LoadingScreen />;
    }

    if (credentials === undefined) {
        return <LoadingScreen />;
    }

    function handleTypeChange(types: string[]) {
        setSelectedTypes(types as CredentialsType[]);
    }

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
                <div className='flex flex-col flex-grow gap-4 p-8'>
                    <CredentialsSortControls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        sortOption={sortOption}
                        onSortChange={(value: string) => setSortOption(value as CredentialsSortOption)}
                        selectedTypes={selectedTypes}
                        onTypeChange={handleTypeChange}
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
                    <Pagination className="pb-4 text-primary/70">
                        <PaginationContent>
                            <PaginationItem className="hover:text-primary">
                                <PaginationPrevious href="#" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, index) => (
                                <PaginationItem key={index} className="hover:text-primary">
                                    <PaginationLink href="#" onClick={() => setCurrentPage(index + 1)}>{index + 1}</PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem className="hover:text-primary">
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem className="hover:text-primary">
                                <PaginationNext href="#" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    )
}