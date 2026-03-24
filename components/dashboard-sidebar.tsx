'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, BarChart3, LogOut, Ticket, Users, Calendar, Settings, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  // Safe role access with default, normalized to lowercase
  let role = (session?.user?.role || 'user').toLowerCase();
  if(role === 'super_admin') {
    role = 'admin';
  }
  const links = [
    // User Links
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
      roles: ['organizer', 'admin'],
    },
    
    {
      href: '/dashboard/create-event',
      label: 'Create Event',
      icon: Plus,
      roles: ['organizer'],
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['organizer', 'admin'],
    },

    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
      roles: ['admin'],
    },
    {
      href: '/dashboard/events',
      label: 'Events',
      icon: Calendar,
      roles: ['admin'],
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      roles: ['organizer', 'admin'],
    },
  ];

  const filteredLinks = links.filter(link => 
    !link.roles || 
    (role && (link.roles.includes(role) || link.roles.includes('all')))
  );

  if (status === 'loading') {
     return (
        <aside className="w-64 border-r bg-background h-full flex flex-col p-6">
           <div className="h-8 w-32 bg-muted animate-pulse rounded mb-8"></div>
           <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
           </div>
        </aside>
     );
  }

  return (
    <aside className="w-64 border-r bg-background h-full overflow-y-auto flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">EventHub</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{role || 'User'} Dashboard</p>
      </div>

      <nav className="space-y-1 px-4 flex-1">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
