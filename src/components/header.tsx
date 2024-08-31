import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';

export function Header() {
    return (
        <header className="flex justify-between items-center mx-auto p-4 container">
            <Logo />
            <MainNav />
            <div className="space-x-2">
                <Button variant="outline">Log in</Button>
                <Button>Sign Up</Button>
            </div>
        </header>
    );
}