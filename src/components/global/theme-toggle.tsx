'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    return (
        <Button variant={'outline'} size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="w-[1.2rem] h-[1.2rem] transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-[1.2rem] h-[1.2rem] transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
    );
}