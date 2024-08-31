import Link from 'next/link';
import { KeySquareIcon } from 'lucide-react';

export function Logo() {
    return (
        <Link href={"/"} className="flex items-center gap-2 font-medium text-xl">
            <KeySquareIcon className='w-4 h-4' /> lokey.cc
        </Link>
    );
}