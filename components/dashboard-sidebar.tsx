// components/dashboard-nav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Plus, BarChart3, Users, Calendar, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  let role = (session?.user as any)?.role?.toLowerCase() || 'user';
  if (role === 'super_admin') role = 'admin';

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true, roles: ['organizer', 'admin'] },
    { href: '/dashboard/create-event', label: 'Create Event', icon: Plus, roles: ['organizer'] },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['organizer', 'admin'] },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
    { href: '/dashboard/events', label: 'Events', icon: Calendar, roles: ['admin'] },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['organizer', 'admin'] },
    { href: '/dashboard/requests', label: 'Requests', icon: Settings, roles: ['admin'] },
  ];

  const filteredLinks = links.filter(link => !link.roles || link.roles.includes(role));

  return (
    /* top-[114px] should be the combined height of your SiteHeader. 
       Adjust this value if your main navbar height changes.
    */
    <div className="sticky top-[114px] z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <ScrollArea className="w-full">
          <div className="flex h-12 items-center gap-2">
            <nav className="flex items-center gap-1 h-full">
              {filteredLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 h-12 text-[11px] font-bold uppercase tracking-widest transition-all group",
                      isActive ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
}