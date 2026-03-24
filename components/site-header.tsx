"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  User,
  Sparkles,
  ChevronDown,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthModal } from "@/components/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SiteHeaderProps {
  selectedCity?: string;
  onSelectCity?: () => void;
}

export function SiteHeader({ selectedCity, onSelectCity }: SiteHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token") || undefined;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("auth_data");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground transform transition-transform group-hover:scale-105 shadow-md shadow-primary/20">
              <Ticket className="h-5 w-5 -rotate-12" />
            </div>
            <div className="flex flex-col -gap-0.5">
              <span className="font-bold text-xl tracking-tight leading-none hidden sm:inline-block">
                EventHub
              </span>
            </div>
          </Link>

          {/* Location Selector (Always Visible) */}
          <div
            // open={false}
            onClick={onSelectCity}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors hover:bg-muted/50 px-2 py-1 rounded-md max-w-[120px]"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{selectedCity || "Select City"}</span>
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          </div>
        </div>

        {/* Search Bar - Hide on small screens, show on md */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search events..."
              className="h-9 w-full rounded-full border-input bg-muted/40 pl-9 pr-4 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm hover:bg-muted/60"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = (e.target as HTMLInputElement).value;
                  if (query) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/create-event">ListYourShow</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/corporates">Corporates</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/gift-cards">Gift Cards</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/offers">Offers</Link>
          </Button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 justify-end">
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 pl-2 pr-4 rounded-full h-9 hover:bg-muted font-normal border border-transparent hover:border-input transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="font-bold text-xs">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-sm max-w-[100px] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="cursor-pointer w-full">
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                {(user.role === "organizer" || user.role === "admin") && (
                  <DropdownMenuItem asChild>
                    {/* Assume dashboard is for organizers */}
                    <Link href="/dashboard" className="cursor-pointer w-full">
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* {user.email?.includes("admin") && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer w-full">
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )} */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </Button>
            </div>
          )}

          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
