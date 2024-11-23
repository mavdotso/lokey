"use client"

import { usePathname } from 'next/navigation'
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from 'next/link'

interface NavMainProps {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: string
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()
  const workspaceSlug = pathname.split('/')[2]

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-4">
        {items.map((item) => {
          const isActive = pathname.split('/').slice(-1)[0] === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                disabled={!!item.badge}
                isActive={isActive}
                className={cn(
                  "py-3",
                  item.badge ? "opacity-50" : ""
                )}
              >
                <Link href={`/dashboard/${workspaceSlug}/${item.url}`}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}