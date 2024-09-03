import React from 'react';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { cn } from '@/lib/utils';

const credentialTypes = [
    'password', 'login_password', 'api_key', 'oauth_token', 'ssh_key',
    'ssl_certificate', 'env_variable', 'database_credential', 'access_key',
    'encryption_key', 'jwt_token', 'two_factor_secret', 'webhook_secret',
    'smtp_credential', 'ftp_credential', 'vpn_credential', 'dns_credential',
    'device_key', 'key_value', 'custom', 'other'
] as const;

type CredentialType = typeof credentialTypes[number];

interface CredentialsSortControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOption: string;
    onSortChange: (value: string) => void;
    selectedType: CredentialType | 'all';
    onTypeChange: (type: CredentialType | 'all') => void;
    className?: string
}

export function CredentialsSortControls({
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
    selectedType,
    onTypeChange,
    className
}: CredentialsSortControlsProps) {
    return (
        <div className={cn(`flex flex-col gap-4`, className)}>
            <div className="flex justify-between items-center gap-4">
                <Input
                    type="text"
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='flex-grow bg-background'
                />
                <Select value={sortOption} onValueChange={onSortChange}>
                    <SelectTrigger className="bg-background w-[200px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="createdAt">Sort by Date Created</SelectItem>
                        <SelectItem value="updatedAt">Sort by Date Updated</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={onTypeChange}>
                    <SelectTrigger className="bg-background w-[200px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {credentialTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}