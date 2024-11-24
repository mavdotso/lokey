
import { LogOut } from 'lucide-react';
import { Session } from 'next-auth';
import SignoutButton from '@/components/auth/signout-button';
import ThemeToggle from '@/components/global/theme-toggle';
import { UserAvatar } from '@/components/global/user-avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function UserCard({ session }: { session: Session }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem className='flex flex-row gap-2'>
          {session.user && <UserAvatar user={session.user} />}
          <div className="flex-1 grid text-left text-sm leading-tight">
            <span className="font-semibold truncate">{session.user?.name}</span>
            <span className="text-xs truncate">{session.user?.email}</span>
          </div>
          <div className="flex gap-2">
            <SignoutButton variant='secondary'>
              <LogOut className="w-4 h-4" />
            </SignoutButton>
            <ThemeToggle variant='secondary' />
          </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}