"use client"

import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: string
  }[]
}

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-4">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              disabled={!!item.badge}
              className={cn(
                "py-3",
                item.badge ? "opacity-50" : ""
              )}
            >
              <a href={`/dashboard/${item.url}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="outline" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}