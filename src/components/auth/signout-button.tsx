import { Button } from '@/components/ui/button';
import { signout } from '@/lib/server-actions';
import { ReactNode } from 'react';

interface SignoutButtonProps {
    children: ReactNode;
    variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
}

export default function SignoutButton({ children, variant = "outline" }: SignoutButtonProps) {
    return (
        <form action={signout}>
            <Button variant={variant} size="icon" className="p-0" type="submit">
                {children}
            </Button>
        </form>
    );
}