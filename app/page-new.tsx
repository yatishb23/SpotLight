"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { CategorySection } from "@/components/category-section"; 

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch all events initially
        const response = await apiClient.getEvents(1, 20); // Get more events to distribute
        setEvents(response.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
        console.error("[v0] Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []); 

  // Group events by category
  const eventsByCategory = events.reduce((acc, event) => {
    const cat = event.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const categoriesToShow = ['Movies', 'Music', 'Comedy', 'Sports', 'Arts', 'Activities', 'Technology'];

  return (
    <PageContainer fullWidth className="pb-0">
      
      {/* Featured / Live Carousel */}
      {(!selectedCategory || selectedCategory === "All") &&
        !isLoading &&
        events.length > 0 && (
          <div className="w-full mb-8 bg-gradient-to-b from-muted to-background/50 pt-6 pb-10 border-b border-border/40">
             <div className="container mx-auto px-4 md:px-6">
                <FeaturedCarousel events={events.slice(0, 5)} />
             </div>
          </div>
        )}

      <main className="container mx-auto px-4 md:px-6 py-8 space-y-12 min-h-[60vh]">
        {error ? (
           <ErrorFallback
              title="Failed to load events"
              message={error}
              onRetry={() => window.location.reload()}
            />
        ) : isLoading ? (
             <LoadingState count={8} />
        ) : (
          <div className="space-y-16">
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
                      viewAllLink="/search"
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
                            viewAllLink={`/search?category=${encodeURIComponent(category)}`}
                            background={index % 2 === 0 ? 'muted' : 'default'}
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
      <footer className="border-t py-12 bg-muted/30 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">EventHub</h4>
              <p className="text-sm text-muted-foreground">
                Your platform for discovering and booking amazing events around the city.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Discover</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/search?category=Movies" className="hover:text-primary transition-colors">Movies</Link></li>
                 <li><Link href="/search?category=Music" className="hover:text-primary transition-colors">Concerts</Link></li>
                 <li><Link href="/search?category=Sports" className="hover:text-primary transition-colors">Sports</Link></li>
                 <li><Link href="/search?category=Activities" className="hover:text-primary transition-colors">Activities</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                 <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                 <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                 <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Facebook</Link></li>
                 <li><Link href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Twitter</Link></li>
                 <li><Link href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Instagram</Link></li>
                 <li><Link href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            © 2026 EventHub. All rights reserved.
          </div>
        </div>
      </footer>
    </PageContainer>
  );
}