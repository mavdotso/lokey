import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CredentialsType } from '@/convex/types';
import { CREDENTIALS_TYPES } from '@/convex/schema';
import { credentialsFields } from '@/lib/config/credentials-fields';
import { redirect } from 'next/navigation';
import { Button } from '../ui/button';
import { MultiSelect } from '../ui/multi-select';

interface CredentialsSortControlsProps {
    searchTerm: string;
    sortOption: string;
    selectedTypes: CredentialsType[];
    hideExpired: boolean;
    showHideExpired: boolean;
    baseUrl: string;
}

export async function CredentialsSortControls({
    searchTerm,
    sortOption,
    selectedTypes,
    hideExpired,
    showHideExpired,
    baseUrl
}: CredentialsSortControlsProps) {
    async function updateFilters(formData: FormData) {
        'use server';

        const params = new URLSearchParams();
        const search = formData.get('search')?.toString() || '';
        const sort = formData.get('sort')?.toString() || 'name';
        const types = formData.getAll('types');
        const hideExpired = formData.get('hideExpired') === 'on';

        if (search) params.set('search', search);
        if (sort !== 'name') params.set('sort', sort);
        if (types.length > 0) params.set('types', types.join(','));
        if (hideExpired) params.set('hideExpired', 'true');

        redirect(`${baseUrl}?${params.toString()}`);
    }

    const credentialTypeOptions = Object.values(CREDENTIALS_TYPES).map(type => ({
        value: type,
        label: credentialsFields[type][0]?.label
    }));

    return (
        <form action={updateFilters} className="flex items-center gap-6 w-full">
            <Input
                type="text"
                name="search"
                placeholder="Search by name"
                defaultValue={searchTerm}
                className='flex'
            />

            {/* TODO: FIX THIS */}
            {/* <MultiSelect
                name="types"
                options={credentialTypeOptions}
                onValueChange={(values) => {
                    const form = document.querySelector('form');
                    const input = form?.querySelector('input[name="types"]') as HTMLInputElement;
                    if (input) {
                        input.value = values.join(',');
                    }
                }}
                defaultValue={selectedTypes}
                placeholder="Select types"
                maxCount={3}
            />
            <input type="hidden" name="types" value={selectedTypes.join(',')} /> */}

            <Select name="sort" defaultValue={sortOption}>
                <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Sort by name</SelectItem>
                    <SelectItem value="createdAtAsc">Sort by date created (asc)</SelectItem>
                    <SelectItem value="createdAtDesc">Sort by date created (desc)</SelectItem>
                    <SelectItem value="updatedAt">Sort by date updated</SelectItem>
                </SelectContent>
            </Select>

            {showHideExpired && (
                <div className="flex items-center space-x-2 whitespace-nowrap">
                    <Checkbox
                        id="hideExpired"
                        name="hideExpired"
                        defaultChecked={hideExpired}
                        className='rounded-[5px]'
                    />
                    <Label
                        htmlFor="hideExpired"
                        className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                        Hide expired
                    </Label>
                </div>
            )}

            <Button type="submit" variant="ghost">
                Apply Filters
            </Button>
        </form>
    );
}