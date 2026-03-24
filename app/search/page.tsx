"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { LoadingState } from "@/components/loading-state";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category");
  
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Fetch all events then filter client-side for this demo
            const response = await apiClient.getEvents(1, 100); 
            let filtered = response.events || [];

            if (query) {
                filtered = filtered.filter(e => 
                    e.title.toLowerCase().includes(query) || 
                    e.location.toLowerCase().includes(query) ||
                    (e.description && e.description.toLowerCase().includes(query))
                );
            }
            
            if (category && category !== 'All') {
                filtered = filtered.filter(e => e.category === category);
            }
            
            setResults(filtered);
        } catch (err) {
            console.error("Error fetching events:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };
    
    fetchEvents();
  }, [query, category]);

  const title = category 
    ? `${category} Events` 
    : query 
        ? `Search Results for "${query}"`
        : "All Events";

  return (
    <div className="container py-8 mx-auto min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      
      {loading ? (
          <div className="py-12"><LoadingState count={4} /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
            <h2 className="text-xl text-muted-foreground mb-4">No events found matching your criteria.</h2>
            <Button asChild>
                <Link href="/">Browse All Events</Link>
            </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {results.map((event) => (
             <div key={event.id}>
                <EventCard event={event} variant="portrait" />
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container py-8 text-center">Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
