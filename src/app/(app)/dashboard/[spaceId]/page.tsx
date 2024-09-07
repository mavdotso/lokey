"use client"
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import { api } from '../../../../../convex/_generated/api';
import { CreateCredentialDialog } from '@/components/credentials/create-credentials-dialog';
import { Id } from '../../../../../convex/_generated/dataModel';
import LoadingScreen from '@/components/global/loading-screen';
import { CredentialCard } from '@/components/credentials/credential-card';
import { useState } from 'react';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { Separator } from '@/components/ui/separator';
import { CredentialsType } from '../../../../../convex/types';
import { isCredentialsActive } from '@/lib/utils';

type CredentialsSortOption = 'name' | 'createdAt' | 'updatedAt';

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

    function handleCredentialCreated(credentialId: Id<"credentials">) {
        console.log('New credential created:', credentialId);
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
            if (sortOption === 'createdAt') return Number(a._creationTime) - Number(b._creationTime);
            if (sortOption === 'updatedAt') return Number(a.updatedAt ?? 0) - Number(b.updatedAt ?? 0);
            return a.name.localeCompare(b.name);
        });

    return (
        <div className='relative bg-background p-8 w-full h-full'>
            <div className='flex justify-between items-center'>
                <h1 className='font-bold text-2xl'>Your Credentials</h1>
                <CreateCredentialDialog onCredentialCreated={handleCredentialCreated} />
            </div>
            <Separator className='my-6' />
            <div className='flex justify-end w-full max-w-full'>
                <CredentialsSortControls
                    className='py-4 max-w-[60%]'
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
            {filteredCredentials.length === 0 ? (
                <p>No credentials found.</p>
            ) : (
                <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
                    {filteredCredentials.map((cred) => (
                        <CredentialCard key={cred._id} credentials={cred} />
                    ))}
                </div>
            )}
        </div>
    );
}