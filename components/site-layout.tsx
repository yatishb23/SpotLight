"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { CitySelectorModal } from "@/components/city-selector-modal";

function HeaderWrapper({
  selectedCity,
  setIsCityModalOpen,
}: {
  selectedCity: string;
  setIsCityModalOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const handleSelectCategory = (category: string) => {
    const url = category === "" ? "/" : `/?category=${category}`;
    router.push(url);
  };

  return (
    <SiteHeader
      selectedCity={selectedCity}
      onSelectCity={() => setIsCityModalOpen(true)}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory}
    />
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ important

  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const isAuthPage = pathname === "/auth/**" || pathname.startsWith("/auth/");

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

    window.dispatchEvent(new CustomEvent("cityChanged", { detail: { city } }));

    setIsCityModalOpen(false);
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
        <Suspense
          fallback={
            <SiteHeader
              selectedCity={selectedCity}
              onSelectCity={() => setIsCityModalOpen(true)}
              selectedCategory=""
              onSelectCategory={() => {}}
            />
          }
        >
          <HeaderWrapper
            selectedCity={selectedCity}
            setIsCityModalOpen={setIsCityModalOpen}
          />
        </Suspense>

        <CitySelectorModal
          open={isCityModalOpen}
          onOpenChange={setIsCityModalOpen}
          onSelect={handleCitySelect}
        />

        <main className="flex-1 bg-zinc-950 text-zinc-100">{children}</main>
      </div>
    </SessionProvider>
  );
}
