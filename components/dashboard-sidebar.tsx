"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  let role = (session?.user as any)?.role?.toLowerCase() || "user";
  if (role === "super_admin") role = "admin";

  const links = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
      roles: ["organizer", "admin"],
    },
    {
      href: "/dashboard/create-event",
      label: "Create Event",
      icon: Plus,
      roles: ["organizer"],
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      roles: ["organizer", "admin"],
    },
    { href: "/dashboard/users", label: "Users", icon: Users, roles: ["admin"] },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: Calendar,
      roles: ["admin"],
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      roles: ["organizer", "admin"],
    },
    {
      href: "/dashboard/requests",
      label: "Requests",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const filteredLinks = links.filter(
    (link) => !link.roles || link.roles.includes(role),
  );

  return (
    <div className="sticky top-23 z-40 w-full border-b border-white/[0.04] bg-[#050505]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <ScrollArea className="w-full">
          <div className="flex items-center h-14">
            <nav className="flex items-center gap-1 h-full">
              {filteredLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 h-full text-xs font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/40 hover:text-white",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}

                    {/* Active underline (same as header style) */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
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
