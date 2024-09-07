"use client"

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { MultiSelect } from '../ui/multi-select';
import { credentialsTypes } from '../../../convex/types';


type CredentialType = typeof credentialsTypes[number];

interface CredentialsSortControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOption: string;
    onSortChange: (value: string) => void;
    selectedTypes: CredentialType[];
    onTypeChange: (types: string[]) => void;
    hideExpired: boolean;
    onHideExpiredChange: (checked: boolean) => void;
    className?: string
}

export function CredentialsSortControls({
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
    selectedTypes,
    onTypeChange,
    hideExpired,
    onHideExpiredChange,
    className
}: CredentialsSortControlsProps) {

    const credentialTypeOptions = credentialsTypes.map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }));

    return (
        <div className={cn(`flex flex-col gap-4 w-full max-w-full`, className)}>
            <div className="flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='bg-background'
                />
                <MultiSelect
                    options={credentialTypeOptions}
                    onValueChange={onTypeChange}
                    defaultValue={selectedTypes}
                    placeholder="Select types"
                    variant="default"
                    maxCount={1}
                />
                <Select value={sortOption} onValueChange={onSortChange}>
                    <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="createdAt">Sort by Date Created</SelectItem>
                        <SelectItem value="updatedAt">Sort by Date Updated</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 whitespace-nowrap">
                    <Checkbox
                        id="hideExpired"
                        checked={hideExpired}
                        onCheckedChange={(checked) => onHideExpiredChange(checked as boolean)}
                        className='rounded-[5px]'
                    />
                    <Label
                        htmlFor="hideExpired"
                        className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                        Hide expired
                    </Label>
                </div>
            </div>
        </div>
    );
}