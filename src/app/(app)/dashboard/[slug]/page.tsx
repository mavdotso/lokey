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
import { api } from '@/convex/_generated/api';

type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';

export default function DashboardPage() {
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<CredentialsSortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<CredentialsType[]>([]);
    const [hideExpired, setHideExpired] = useState(false);

    const credentials = useQuery(api.credentials.getUserCredentials, {
        userId: session.data?.user?.id ?? ''
    });

    if (credentials === undefined) return <LoadingScreen />

    if (!session || !session.data || !session.data.user) {
        return <LoadingScreen loadingText='Loading session...' />;
    }

    if (credentials === undefined) {
        return <LoadingScreen loadingText='Loading credentials...' />;
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

    return (
        <>
            <div className='flex justify-between items-center p-8'>
                <h1 className='font-bold text-2xl'>Shared credentials</h1>
                <CreateCredentialsDialog buttonVariant={'outline'} />
            </div>
            <Separator />

            {credentials.length === 0 ? (
                <div className='flex flex-col justify-center items-center gap-8 p-8 w-full h-full'>
                    <p className='text-lg'>You don&apos;t have any credentials yet</p>
                    <CreateCredentialsDialog />
                </div>
            ) : (
                <div className='p-8'>
                    <div className='flex justify-end w-full max-w-full'>
                        <CredentialsSortControls
                            className='py-4 max-w-full'
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            sortOption={sortOption}
                            onSortChange={(value: string) => setSortOption(value as CredentialsSortOption)}
                            selectedTypes={selectedTypes}
                            onTypeChange={handleTypeChange}
                            hideExpired={hideExpired}
                            onHideExpiredChange={setHideExpired}
                        />
                    </div>
                    <>
                        {filteredCredentials.length === 0 && isFiltered ? (
                            <div className='flex flex-col justify-center items-center gap-8 p-8 w-full h-full'>
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
                                {filteredCredentials.map((cred) => (
                                    <CredentialCard key={cred._id} credentials={cred} />
                                ))}
                            </div>
                        )}
                    </>
                </div >
            )
            }
        </>
    )
}