import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
    title: string;
    children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <>
            <div className="flex justify-between items-center px-8 min-h-20">
                <h1 className="font-medium text-2xl">{title}</h1>
                {children && <div className="flex gap-2">{children}</div>}
            </div>
            <Separator />
        </>
    );
}