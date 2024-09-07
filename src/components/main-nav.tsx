import { CreditCard, Blocks } from 'lucide-react';
import Link from 'next/link';

const navItems = [

    { label: 'Features', href: '#', icon: Blocks },
    { label: 'Pricing', href: '#', icon: CreditCard },
];

export function MainNav() {
    return (
        <nav className="flex space-x-6">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 text-muted-foreground text-sm hover:text-foreground"
                >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}