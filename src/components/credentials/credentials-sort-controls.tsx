import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CredentialsType, credentialsTypes } from '@/convex/types';
import { capitalizeFirstLetter } from '@/lib/utils';

interface CredentialsSortControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOption: string;
    onSortChange: (value: string) => void;
    selectedTypes: CredentialsType[];
    onTypeChange: (types: string[]) => void;
    hideExpired: boolean;
    onHideExpiredChange: (checked: boolean) => void;
    showHideExpired: boolean;
}

export function CredentialsSortControls({ searchTerm, onSearchChange, sortOption, onSortChange, selectedTypes, onTypeChange, hideExpired, onHideExpiredChange, showHideExpired }: CredentialsSortControlsProps) {

    const credentialTypeOptions = credentialsTypes.map(type => ({
        value: type,
        label: capitalizeFirstLetter(type).replace('_', ' ')
    }));

    return (
        <>
            <div className="flex items-center gap-6 w-full">
                <Input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='flex bg-background'
                />
                <MultiSelect
                    options={credentialTypeOptions}
                    onValueChange={onTypeChange}
                    defaultValue={selectedTypes}
                    placeholder="Search by type"
                    variant="default"
                    maxCount={1}
                />
                <Select value={sortOption} onValueChange={onSortChange}>
                    <SelectTrigger className="bg-background">
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
                )}
            </div>
        </>
    );
}