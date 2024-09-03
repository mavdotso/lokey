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

type CredentialSortOption = 'name' | 'createdAt' | 'updatedAt';
type CredentialType = 'password' | 'login_password' | 'api_key' | 'oauth_token' | 'ssh_key' |
    'ssl_certificate' | 'env_variable' | 'database_credential' | 'access_key' |
    'encryption_key' | 'jwt_token' | 'two_factor_secret' | 'webhook_secret' |
    'smtp_credential' | 'ftp_credential' | 'vpn_credential' | 'dns_credential' |
    'device_key' | 'key_value' | 'custom' | 'other';

export default function DashboardPage() {
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<CredentialSortOption>('name');
    const [selectedTypes, setSelectedTypes] = useState<CredentialType[]>([]);
    const [hideInactive, setHideInactive] = useState(false);

    const credentials = useQuery(api.queries.getCredentialsByUserId, {
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
        setSelectedTypes(types as CredentialType[]);
    }

    const filteredCredentials = credentials
        .filter(cred =>
            cred.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedTypes.length === 0 || selectedTypes.includes(cred.type as CredentialType)) &&
            (!hideInactive || cred.active)
        )
        .sort((a, b) => {
            if (sortOption === 'createdAt') return Number(a._creationTime) - Number(b._creationTime);
            if (sortOption === 'updatedAt') return Number(a.updatedAt ?? 0) - Number(b.updatedAt ?? 0);
            return a.name.localeCompare(b.name);
        });

    return (
        <div className='relative p-4 w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h1 className='font-bold text-2xl'>Your Credentials</h1>
                <CreateCredentialDialog onCredentialCreated={handleCredentialCreated} />
            </div>
            <CredentialsSortControls
                className='py-4'
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortOption={sortOption}
                onSortChange={(value: string) => setSortOption(value as CredentialSortOption)}
                selectedTypes={selectedTypes}
                onTypeChange={handleTypeChange}
                hideInactive={hideInactive}
                onHideInactiveChange={setHideInactive}
            />
            {filteredCredentials.length === 0 ? (
                <p>No credentials found.</p>
            ) : (
                <div className="grid grid-cols-1 border border-border rounded-md overflow-hidden">
                    {filteredCredentials.map((cred) => (
                        <CredentialCard key={cred._id} credential={cred} />
                    ))}
                </div>
            )}
        </div>
    );
}