import { Button } from '@/components/ui/button';
import { signout } from '@/lib/server-actions';
import { ReactNode } from 'react';

interface SignoutButtonProps {
    children: ReactNode;
}

export default function SignoutButton({ children }: SignoutButtonProps) {
    return (
        <form action={signout}>
            <Button variant="secondary" size="icon" className="p-0" type="submit">
                {children}
            </Button>
        </form>
    );
}