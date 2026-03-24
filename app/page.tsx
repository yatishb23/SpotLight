"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import Link from "next/link";
import type { Event as AppEvent } from "@/lib/types";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { CategorySection } from "@/components/category-section"; 
import axios from "axios";

export default function Home() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  // Create refs for scrolling to sections
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
     if (selectedCategory && selectedCategory !== 'All') {
        // Allow DOM to settle then scroll
        setTimeout(() => {
           const element = sectionRefs.current[selectedCategory];
           if (element) {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' });
           }
        }, 100);
     } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
     }
  }, [selectedCategory]);

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    }

    const handleCityChanged = (event: globalThis.Event) => {
      const customEvent = event as CustomEvent<{ city?: string }>;
      if (customEvent.detail?.city) {
        setSelectedCity(customEvent.detail.city);
      }
    };

    window.addEventListener("cityChanged", handleCityChanged as EventListener);

    return () => {
      window.removeEventListener("cityChanged", handleCityChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          `/api/events/getbycity?city=${encodeURIComponent(selectedCity)}`
        );

        const payload = response.data as
          | AppEvent[]
          | { data?: AppEvent[] }
          | null
          | undefined;
        const nextEvents = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        setEvents(nextEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
        console.error("[v0] Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCity) {
      fetchEvents();
    }
  }, [selectedCity]); 

  // Group events by category
  const eventsByCategory = events.reduce((acc, event) => {
    const cat = event.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, AppEvent[]>);

  const categoriesToShow = Array.from(
    new Set(events.map((event) => event.category || "Other"))
  );

  useEffect(() => {
    if (!events.length) return;

    const eventsMap = events.reduce((acc, event) => {
      acc[event.id] = event;
      return acc;
    }, {} as Record<string, AppEvent>);

    sessionStorage.setItem("eventsById", JSON.stringify(eventsMap));
  }, [events]);

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {(!selectedCategory || selectedCategory === "All") &&
        !isLoading &&
        events.length > 0 && (
          <div className="mb-4 bg-gradient-to-b from-primary/5 to-transparent pt-4 pb-8">
             <FeaturedCarousel events={events.slice(0, 5)} />
          </div>
        )}

      <main className="w-full">
        {error ? (
          <div className="max-w-[1400px] mx-auto px-6">
            <ErrorFallback
              title="Failed to load events"
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : isLoading ? (
          <div className="max-w-[1400px] mx-auto px-6 py-12">
             <LoadingState count={8} />
          </div>
        ) : (
          <div className="flex flex-col gap-0">
             {/* If a specific category is selected (and not 'All'), show just that, otherwise show all sections */}
             {selectedCategory && selectedCategory !== 'All' ? (
                <div className="min-h-[50vh]">
                  <CategorySection 
                      title={`${selectedCategory} Events`} 
                      events={eventsByCategory[selectedCategory] || []} 
                      className="py-8"
                  />
                   {(!eventsByCategory[selectedCategory] || eventsByCategory[selectedCategory].length === 0) && (
                      <div className="text-center py-20 text-muted-foreground">No events found in this category.</div>
                   )}
                </div>
             ) : (
                <>
                  <CategorySection 
                      title="Recommended for You" 
                      events={events.slice(0, 8)} 
                      viewAllLink="/events"
                  />

                  {/* Render Sections for each category */}
                  {categoriesToShow.map((category, index) => {
                     const categoryEvents = eventsByCategory[category];
                     if (!categoryEvents || categoryEvents.length === 0) return null;
                     
                     return (
                       <div key={category} ref={(el) => { sectionRefs.current[category] = el; }}>
                          <CategorySection
                            title={category}
                            events={categoryEvents}
                            background={index % 2 === 0 ? 'muted' : 'default'} // Alternate backgrounds
                          />
                       </div>
                     )
                  })}
                </>
             )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">EventHub</h4>
              <p className="text-sm text-muted-foreground">
                Your platform for discovering and booking amazing events around the city.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="#" className="hover:text-foreground">Movies</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Concerts</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Sports</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Activities</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="#" className="hover:text-foreground">Contact Us</Link></li>
                 <li><Link href="#" className="hover:text-foreground">FAQs</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="#" className="hover:text-foreground">Facebook</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Twitter</Link></li>
                 <li><Link href="#" className="hover:text-foreground">Instagram</Link></li>
                 <li><Link href="#" className="hover:text-foreground">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 EventHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
