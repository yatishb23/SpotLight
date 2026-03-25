"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
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

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getEvents(1, 100);
        setEvents(Array.isArray(response?.events) ? response.events : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const results = useMemo(() => {
    let filtered = [...events];

    if (query) {
      filtered = filtered.filter((e) =>
        [e.title, (e as any).location, e.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query)),
      );
    }

    if (category && category !== "All") {
      filtered = filtered.filter((e) => e.category === category);
    }

    return filtered;
  }, [events, query, category]);

  const title = category
    ? `${category} Events`
    : query
      ? `Search Results for "${query}"`
      : "All Events";

  return (
    <div className="container py-8 mx-auto min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {loading ? (
        <div className="py-12">
          <LoadingState count={4} />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <h2 className="text-xl text-muted-foreground mb-4">
            No events found matching your criteria.
          </h2>
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
    <Suspense
      fallback={<div className="container py-8 text-center">Loading...</div>}
    >
      <SearchResults />
    </Suspense>
  );
}
