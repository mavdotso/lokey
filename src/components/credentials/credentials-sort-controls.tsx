"use client"

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MultiSelect } from '../ui/multi-select';

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
    selectedTypes: CredentialType[];
    onTypeChange: (types: string[]) => void;
    hideInactive: boolean;
    onHideInactiveChange: (checked: boolean) => void;
    className?: string
}

export function CredentialsSortControls({
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
    selectedTypes,
    onTypeChange,
    hideInactive,
    onHideInactiveChange,
    className
}: CredentialsSortControlsProps) {

    const credentialTypeOptions = credentialTypes.map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }));

    return (
        <div className={cn(`flex flex-col gap-4 max-w-full`, className)}>
            <div className="flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='flex-shrink-0 bg-background w-48'
                />
                <MultiSelect
                    options={credentialTypeOptions}
                    onValueChange={onTypeChange}
                    defaultValue={selectedTypes}
                    placeholder="Select types"
                    variant="default"
                    maxCount={3}
                    className="flex-grow"
                />
                <Select value={sortOption} onValueChange={onSortChange}>
                    <SelectTrigger className="flex-shrink-0 bg-background w-52">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="createdAt">Sort by Date Created</SelectItem>
                        <SelectItem value="updatedAt">Sort by Date Updated</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex flex-shrink-0 items-center space-x-2 whitespace-nowrap">
                    <Checkbox
                        id="hideInactive"
                        checked={hideInactive}
                        onCheckedChange={(checked) => onHideInactiveChange(checked as boolean)}
                        className='rounded-[5px]'
                    />
                    <Label
                        htmlFor="hideInactive"
                        className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                        Hide inactive
                    </Label>
                </div>
            </div>
        </div>
    );
}