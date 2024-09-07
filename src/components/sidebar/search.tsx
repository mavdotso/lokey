import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SearchInput() {

    return (
        <div className="relative bg-input my-6 rounded-md w-full max-w-md">
            <Input
                type="text"
                placeholder="Search"
                className='pl-10'
            />
            <div className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Search className="w-5 h-5" />
            </div>
        </div>
    );
};
