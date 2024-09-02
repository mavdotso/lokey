import React from 'react';
import { Button } from '../ui/button';
import { signout } from '@/lib/server-actions';

interface SignoutButtonProps {
    children: React.ReactNode;
}

export default function SignoutButton({ children }: SignoutButtonProps) {
    return (
        <form action={signout}>
            <Button variant="outline" size="icon" className="p-0" type="submit">
                {children}
            </Button>
        </form>
    );
}