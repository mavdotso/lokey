import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import Link from 'next/link';

export function Header() {
    return (
        <header className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex flex-row gap-6">
                <MainNav />
                <Button variant="outline" asChild>
                    <Link href="/sign-in">Sign in</Link>
                </Button>
            </div>
        </header>
    );
}