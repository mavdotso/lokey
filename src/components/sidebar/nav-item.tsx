import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NavItemProps } from "@/components/sidebar/sidebar";
import { use } from "react";

interface NavigationItemProps {
    params: Promise<{ slug: string }>;
    item: NavItemProps;
}

export function NavigationItem({ params, item }: NavigationItemProps) {
    const resolvedParams = use(params);
    return (
        <Link href={`/dashboard/${resolvedParams.slug}/${item.href}`} className={`${item.badge ? 'pointer-events-none' : ''}`} key={item.name}>
            <div className={`flex items-center justify-between hover:bg-card hover:shadow-sm px-3 py-2.5 border border-transparent rounded-sm font-medium text-muted-foreground text-sm transition-all ${item.badge ? 'cursor-not-allowed opacity-50' : 'hover:border-border hover:text-primary'}`}>
                <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                </div>
                {item.badge && <Badge variant={"outline"} className="ml-2 text-xs">{item.badge}</Badge>}
            </div>
        </Link>
    )
}