import Link from 'next/link';
import { KeyIcon, KeySquareIcon } from 'lucide-react';

export function Logo() {
    return (
        <Link href={"/"} className="flex items-center gap-2 text-lg">
            <KeyIcon className='w-4 h-4' /> lokey
        </Link>
    );
}