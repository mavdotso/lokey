import { Button } from '@/components/ui/button';
import { Logo } from '@/components/global/logo';
import { MainNav } from '@/components/nav/main-nav';
import Link from 'next/link';
import ThemeToggle from '@/components/global/theme-toggle';
import { auth } from '@/lib/auth';

export async function Header() {
    const session = await auth()

    return (
        <header className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex flex-row gap-4">
                <MainNav />
                <Button variant="outline" asChild>
                    {session ? <Link href="/dashboard">Dashboard</Link> : <Link href="/sign-in">Sign in</Link>}
                </Button>
                <ThemeToggle />
            </div>
        </header>
    );
}