import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CredentialsType } from '@/convex/types';
import { CREDENTIALS_TYPES } from '@/convex/schema';
import { credentialsFields } from '@/lib/config/credentials-fields';
import { memo, useMemo } from 'react';

interface CredentialsSortControlsProps {
    searchTerm: string;
    sortOption: string;
    selectedTypes: CredentialsType[];
    hideExpired: boolean;
    showHideExpired: boolean;
    onFilterChange: (type: 'searchTerm' | 'sortOption' | 'selectedTypes' | 'hideExpired', value: any) => void;
}

export const CredentialsSortControls = memo(function CredentialsSortControls({
    searchTerm,
    sortOption,
    selectedTypes,
    hideExpired,
    showHideExpired,
    onFilterChange
}: CredentialsSortControlsProps) {

    const credentialTypeOptions = Object.values(CREDENTIALS_TYPES).map(type => ({
        value: type,
        label: credentialsFields[type][0]?.label
    }));

    const memoizedSelectTrigger = useMemo(() => (
        <SelectTrigger>
            <SelectValue placeholder="Sort by" />
        </SelectTrigger>
    ), []);

    const memoizedSelectContent = useMemo(() => (
        <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="createdAtAsc">Sort by date created (asc)</SelectItem>
            <SelectItem value="createdAtDesc">Sort by date created (desc)</SelectItem>
            <SelectItem value="updatedAt">Sort by date updated</SelectItem>
        </SelectContent>
    ), []);

    const memoizedMultiSelect = useMemo(() => (
        <MultiSelect
            options={credentialTypeOptions}
            onValueChange={(values) => onFilterChange('selectedTypes', values)}
            defaultValue={selectedTypes}
            placeholder="Search by type"
            variant="default"
            maxCount={1}
        />
    ), [credentialTypeOptions, onFilterChange, selectedTypes]);

    const memoizedInput = useMemo(() => (
        <Input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className='flex'
        />
    ), [searchTerm, onFilterChange]);

    const memoizedCheckbox = useMemo(() => (
        <Checkbox
            id="hideExpired"
            checked={hideExpired}
            onCheckedChange={(checked) => onFilterChange('hideExpired', checked)}
            className='rounded-[5px]'
        />
    ), [hideExpired, onFilterChange]);

    const memoizedLabel = useMemo(() => (
        <Label
            htmlFor="hideExpired"
            className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
        >
            Hide expired
        </Label>
    ), []);

    return (
        <div className="flex items-center gap-6 w-full">
            {memoizedInput}
            
            {memoizedMultiSelect}

            <Select value={sortOption} onValueChange={(value) => onFilterChange('sortOption', value)}>
                {memoizedSelectTrigger}
                {memoizedSelectContent}
            </Select>

            {showHideExpired && (
                <div className="flex items-center space-x-2 whitespace-nowrap">
                    {memoizedCheckbox}
                    {memoizedLabel}
                </div>
            )}
        </div>
    );
});