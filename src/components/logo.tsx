import Link from 'next/link';
import { KeyIcon, KeySquareIcon } from 'lucide-react';

export function Logo() {
    return (
        <Link href={"/"} className="flex items-center gap-2 text-xl">
            <KeyIcon className='w-5 h-5' /> lokey
        </Link>
    );
}