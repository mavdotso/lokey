"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const menuItems = [
    {
        title: "Product",
        href: "#",
        description: "Learn about our product offerings and features.",
        submenu: [
            { title: "Overview", href: "#overview", description: "Get a quick overview of our product." },
            { title: "Features", href: "#features", description: "Explore the key features of our product." },
            { title: "Use Cases", href: "#use-cases", description: "See how our product can be applied in various scenarios." },
        ]
    },
    {
        title: "Solutions",
        href: "#",
        description: "Discover solutions tailored to your needs.",
        submenu: [
            { title: "For Enterprises", href: "#enterprise", description: "Enterprise-grade solutions for large organizations." },
            { title: "For Startups", href: "#startups", description: "Scalable solutions for growing businesses." },
            { title: "For Individuals", href: "#individuals", description: "Personal solutions for individual users." },
        ]
    },
    { title: "Customers", href: "#customers" },
    { title: "Pricing", href: "#pricing" },
    { title: "Resources", href: "#resources" },
]

export function MainNav() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {menuItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                        {item.submenu ? (
                            <>
                                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="gap-3 grid lg:grid-cols-[.75fr_1fr] p-6 md:w-[400px] lg:w-[500px]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <a
                                                    className="flex flex-col justify-end bg-gradient-to-b from-muted/50 to-muted focus:shadow-md p-6 rounded-md w-full h-full no-underline select-none outline-none"
                                                    href={item.href}
                                                >
                                                    <div className="mt-4 mb-2 font-medium text-lg">
                                                        {item.title}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm leading-tight">
                                                        {item.description}
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        {item.submenu.map((subitem) => (
                                            <ListItem key={subitem.title} title={subitem.title} href={subitem.href}>
                                                {subitem.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <Link href={item.href} legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    {item.title}
                                </NavigationMenuLink>
                            </Link>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="font-medium text-sm leading-none">{title}</div>
                    <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"