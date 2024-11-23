"use client"
import { BoltIcon, FileLockIcon, KeyIcon, MessageSquareDashedIcon, MessageCircleQuestionIcon, LucideIcon, VaultIcon } from 'lucide-react';
import { Session } from 'next-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserCard } from './user-card';
import { WorkspacesDropdown } from '@/components/workspaces/workspaces-dropdown';
import { UpgradeBox } from './upgrade-box';
import { NavMain } from './nav-main';

interface SidebarProps {
  params: { slug: string };
  session: Session;
  className?: string;
}

const navItems = [
  {
    title: 'Credentials',
    url: 'credentials',
    icon: KeyIcon,
  },
  {
    title: 'Vault',
    url: 'vault',
    icon: VaultIcon,
    badge: 'soon'
  },
  {
    title: 'Files',
    url: 'files',
    icon: FileLockIcon,
    badge: 'soon'
  },
  {
    title: 'Chats',
    url: 'chats',
    icon: MessageSquareDashedIcon,
    badge: 'soon'
  }
];

const helpItems = [
  {
    title: 'Settings',
    url: 'settings',
    icon: BoltIcon,
  },
  {
    title: 'Help & Support',
    url: 'help',
    icon: MessageCircleQuestionIcon,
  }
];

export default function AppSidebar({ params, session, className }: SidebarProps) {
  return (
      <Sidebar collapsible="icon" className={className}>
        <SidebarHeader>
          <WorkspacesDropdown />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navItems} />
          <UpgradeBox />
          <NavMain items={helpItems} />
        </SidebarContent>
        <SidebarFooter>
          <UserCard session={session} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
  )
}