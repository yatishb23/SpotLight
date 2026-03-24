"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { CategoryBar } from "@/components/category-bar";
import { CitySelectorModal } from "@/components/city-selector-modal";

interface SiteLayoutProps {
  children: React.ReactNode;
}

function SiteLayoutContent({ children }: SiteLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    // Only access localStorage on the client
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      setIsCityModalOpen(true);
    }
  }, []);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register"
  ) {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    );
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", city);
    window.dispatchEvent(new CustomEvent("cityChanged", { detail: { city } }));
    setIsCityModalOpen(false);
  };

  const handleSelectCategory = (category: string) => {
    if (category === "All" || category === "") {
      router.push("/");
    } else {
      router.push(`/?category=${category}`);
    }
  };

  return (
    <SessionProvider>
      <SiteHeader
        selectedCity={selectedCity}
        onSelectCity={() => setIsCityModalOpen(true)}
      />
      <CitySelectorModal
        open={isCityModalOpen}
        onOpenChange={setIsCityModalOpen}
        onSelect={handleCitySelect}
      />

      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <main className="flex-1">{children}</main>
    </SessionProvider>
  );
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SiteLayoutContent>{children}</SiteLayoutContent>
    </Suspense>
  );
}
