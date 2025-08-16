
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Plane, Users, LogOut, Settings } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/trips', icon: Plane, label: 'Trips' },
  // { href: '/customers', icon: Users, label: 'Customers' },
  // { href: '/settings', icon: Settings, label: 'Branding' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '..';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Logo className="h-8 w-8 shrink-0 text-primary" />
              <div className="flex flex-col overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                 <span className="truncate text-lg font-semibold leading-tight">{user?.displayName || 'Triplan'}</span>
                 {user?.displayName && <span className="truncate text-xs text-muted-foreground">by Triplan</span>}
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user?.photoURL || 'https://placehold.co/40x40'}
                data-ai-hint="agency logo"
              />
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
              <span className="truncate text-sm font-semibold">
                {user?.displayName || 'Agency Admin'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email || ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0"
              onClick={handleLogout}
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
           <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
