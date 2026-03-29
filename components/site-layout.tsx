"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { CitySelectorModal } from "@/components/city-selector-modal";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // ✅ important

  const selectedCategory = searchParams.get("category") || "";

  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const isAuthPage =
    pathname === "/auth/**" || pathname.startsWith("/auth/");

  useEffect(() => {
    if (isAuthPage) return; // ❌ don't run for auth pages

    setMounted(true);
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      setIsCityModalOpen(true);
    }
  }, [isAuthPage]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", city);

    window.dispatchEvent(
      new CustomEvent("cityChanged", { detail: { city } })
    );

    setIsCityModalOpen(false);
  };

  const handleSelectCategory = (category: string) => {
    const url = category === "" ? "/" : `/?category=${category}`;
    router.push(url);
  };

  // ✅ If auth page → return children only (no layout)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch
  if (!mounted) return null;
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <SiteHeader
          selectedCity={selectedCity}
          onSelectCity={() => setIsCityModalOpen(true)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        
        <CitySelectorModal
          open={isCityModalOpen}
          onOpenChange={setIsCityModalOpen}
          onSelect={handleCitySelect}
        />
        
        <main className="flex-1 bg-zinc-950 text-zinc-100">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}