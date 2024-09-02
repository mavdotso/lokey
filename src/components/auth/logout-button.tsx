import React from 'react';
import { signOut } from '@/lib/auth';
import { Button } from '../ui/button';

interface LogoutButtonProps {
    children: React.ReactNode;
}

export default function LogoutButton({ children }: LogoutButtonProps) {
    async function logout() {
        "use server"
        await signOut({ redirectTo: "/" });
    }

    return (
        <form action={logout}>
            <Button variant="outline" size="icon" className="p-0" type="submit">
                {children}
            </Button>
        </form>
    );
}