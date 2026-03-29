"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Ticket,
  ChevronDown,
  LogOut,
  Settings,
  CreditCard,
  PlusCircle,
  Film, 
  Music, 
  Activity, 
  Theater, 
  Gamepad2, 
  Laugh, 
  LayoutGrid, 
  Menu
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Movies', icon: Film },
  { name: 'Music', icon: Music },
  { name: 'Sports', icon: Activity },
  { name: 'Arts', icon: Theater },
  { name: 'Comedy', icon: Laugh },
  { name: 'Activities', icon: MapPin },
  { name: 'Technology', icon: Gamepad2 },
];

interface SiteHeaderProps {
  selectedCity?: string;
  onSelectCity?: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function SiteHeader({ 
  selectedCity, onSelectCity, selectedCategory, onSelectCategory 
}: SiteHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any; // Cast to any to access custom 'role' property
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    localStorage.removeItem("userId");

    signOut({ callbackUrl: "/" });
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500 border-b pt-2 md:pt-3",
      isScrolled 
        ? "bg-zinc-950/90 backdrop-blur-xl border-zinc-800/50 shadow-xl" 
        : "bg-zinc-950 border-transparent"
    )}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          
          {/* Logo & City */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-zinc-100/10 p-2 rounded-lg transition-all group-hover:bg-zinc-100/20">
                <Ticket className="h-5 w-5 text-zinc-100 transition-transform group-hover:rotate-12" />
              </div>
              <span className="font-bold text-zinc-100 tracking-tighter text-xl uppercase hidden sm:inline-block italic">
                EventHub
              </span>
            </Link>
            
            <button
              onClick={onSelectCity}
              className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors py-1 px-2 rounded-md hover:bg-zinc-800/50"
            >
              <MapPin className="h-3.5 w-3.5 opacity-50" />
              <span className="max-w-[100px] truncate">{selectedCity || "Select City"}</span>
              <ChevronDown className="h-3 w-3 opacity-40" />
            </button>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-zinc-100 transition-colors" />
            <Input
              placeholder="Search experiences..."
              className="h-10 w-full rounded-full border-zinc-800 bg-zinc-900/40 pl-10 text-[13px] focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all"
            />
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 outline-none group text-left">
                    {/* PC View: Name and Email */}
                    <div className="hidden lg:flex flex-col items-end">
                      <span className="text-[13px] font-bold text-zinc-100 leading-none mb-1">
                        {user.name || "Member"}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[150px]">
                        {user.email}
                      </span>
                    </div>

                    {/* Avatar: Shows on all views */}
                    <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-[12px] font-black text-zinc-100 group-hover:border-zinc-500 transition-all shadow-inner uppercase">
                      {(user.name || user.email || "U").charAt(0)}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-60 bg-zinc-950 border-zinc-800 text-zinc-400 p-1.5 shadow-2xl mt-2">
                  <DropdownMenuLabel className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 py-2">
                    My Account
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-zinc-900" />

                  {/* Option: Profile (All Roles) */}
                  <DropdownMenuItem asChild className="focus:bg-zinc-900 focus:text-zinc-100 py-2.5 rounded-md cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <Settings className="h-4 w-4 mr-3 opacity-70" /> Account Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Option: Bookings (Users Only) */}
                  {user.role === "user" && (
                    <DropdownMenuItem asChild className="focus:bg-zinc-900 focus:text-zinc-100 py-2.5 rounded-md cursor-pointer">
                      <Link href="/my-bookings" className="flex items-center w-full">
                        <CreditCard className="h-4 w-4 mr-3 opacity-70" /> My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Option: Dashboard (Admin or Organizer) */}
                  {(user.role === "admin" || user.role === "organizer") && (
                    <DropdownMenuItem asChild className="focus:bg-zinc-900 focus:text-zinc-100 py-2.5 rounded-md cursor-pointer">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <PlusCircle className="h-4 w-4 mr-3 opacity-70" /> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-900" />

                  {/* Logout */}
                  <DropdownMenuItem 
                    onClick={() => handleLogout()} 
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 py-2.5 rounded-md cursor-pointer font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-3" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsAuthModalOpen(true)} 
                className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[12px] font-black h-10 px-6 rounded-full transition-transform active:scale-95"
              >
                SIGN IN
              </Button>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="py-3 border-t border-zinc-900/50 mt-1">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-8 pb-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name || (selectedCategory === '' && cat.name === 'All');
                return (
                  <button
                    key={cat.name}
                    onClick={() => onSelectCategory(cat.name === 'All' ? '' : cat.name)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 transition-all group pb-1",
                      isSelected ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <cat.icon className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isSelected ? "text-zinc-100" : "text-zinc-500"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{cat.name}</span>
                    {isSelected && (
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-zinc-100 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </div>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  );
}