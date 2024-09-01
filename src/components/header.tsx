import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';

export function Header() {
    return (
        <header className="flex justify-between items-center py-4">
            <Logo />
            <MainNav />
            <div className="space-x-2">
                <Button variant="outline">Log in</Button>
                <Button>Sign Up</Button>
            </div>
        </header>
    );
}