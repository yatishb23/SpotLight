"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import Link from "next/link";
import type { Event as AppEvent } from "@/lib/types";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { CategorySection } from "@/components/category-section";
import { apiClient } from "@/lib/api";
import { ChevronRight, Sparkles, Globe, ShieldCheck, Headphones } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Initial City Load & Event Listener
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity") || "Mumbai";
    setSelectedCity(savedCity);

    const handleCityChanged = (event: any) => {
      const newCity = event.detail?.city;
      if (newCity) setSelectedCity(newCity);
    };

    window.addEventListener("cityChanged", handleCityChanged as EventListener);
    return () => window.removeEventListener("cityChanged", handleCityChanged as EventListener);
  }, []);

  // 2. Re-fetch Events when City changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCity) return;
      try {
        setIsLoading(true);
        setError(null);
        const payload = await apiClient.getEventsByCity(selectedCity);
        const nextEvents = Array.isArray(payload) ? payload : (payload as any)?.data || [];
        setEvents(nextEvents);
      } catch (err) {
        setError("Unable to load events for this city.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCity]);

  // 3. Scroll to category logic
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "All") {
      setTimeout(() => {
        sectionRefs.current[selectedCategory]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [selectedCategory, isLoading]);

  // Group events memoized
  const eventsByCategory = useMemo(() => {
    return events.reduce((acc, event) => {
      const cat = event.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(event);
      return acc;
    }, {} as Record<string, AppEvent[]>);
  }, [events]);

  const categoriesToShow = useMemo(() => Object.keys(eventsByCategory), [eventsByCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800">
      
      {/* Hero Section */}
      {(!selectedCategory || selectedCategory === "All") && !isLoading && events.length > 0 && (
        <div className="relative pt-6 pb-12 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-neutral-100/[0.02] blur-[120px] rounded-full" />
          <div className="max-w-[1440px] mx-auto">
            <FeaturedCarousel events={events.slice(0, 5)} />
          </div>
        </div>
      )}

      <main className="max-w-[1440px] mx-auto pb-24">
        {error ? (
          <div className="px-6 py-20">
            <ErrorFallback title="Offline" message={error} onRetry={() => window.location.reload()} />
          </div>
        ) : isLoading ? (
          <div className="px-6 py-12">
            <LoadingState count={8} />
          </div>
        ) : (
          <div className="space-y-4">
            {selectedCategory && selectedCategory !== "All" ? (
              <div className="min-h-[60vh] px-6">
                <div className="flex items-center gap-3 py-10">
                  <Sparkles className="w-6 h-6 text-neutral-500" />
                  <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">{selectedCategory}</h1>
                </div>
                <CategorySection
                  title="Featured"
                  events={eventsByCategory[selectedCategory] || []}
                  className="py-0"
                />
              </div>
            ) : (
              <>
                <CategorySection title="Recommended" events={events.slice(0, 8)} background="subtle" />
                
                {categoriesToShow.map((category, index) => (
                  <div key={category} ref={(el) => { sectionRefs.current[category] = el; }}>
                    <CategorySection
                      title={category}
                      events={eventsByCategory[category]}
                      background={index % 2 === 0 ? "default" : "muted"}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* Professional Minimal Footer */}
      <footer className="border-t border-neutral-900 bg-[#050505] pt-20 pb-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-white block">EventHub</span>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
                Premium protocol ticketing experience for the network's most exclusive ledgers.
              </p>
            </div>
            
            {[
              { title: "Network", links: ["Movies", "Concerts", "Workshops", "Sports"] },
              { title: "Governance", links: ["About", "Careers", "Press", "Impact"] },
              { title: "Protocol Policy", links: ["Terms", "Privacy", "Cookies", "Safety"] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-neutral-900 gap-6">
            <p className="text-neutral-600 text-[9px] tracking-[0.3em] font-mono uppercase font-black">
              © 2026 EVENTHUB GLOBAL INC. SYS_VERIFIED.
            </p>
            <div className="flex gap-8">
              <Globe className="w-4 h-4 text-neutral-600 hover:text-white cursor-pointer transition-colors" />
              <ShieldCheck className="w-4 h-4 text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Headphones className="w-4 h-4 text-neutral-600 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}