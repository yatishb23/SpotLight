"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { LoadingState } from "@/components/loading-state";
import { Search, Loader2, Database, ArrowRight } from "lucide-react";

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
    ? `CLASSIFICATION: ${category.toUpperCase()}`
    : query
      ? `QUERY: "${query.toUpperCase()}"`
      : "GLOBAL_REGISTRY";

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
                System Query Executing
              </span>
            </div>
            <h1 className="text-5xl font-medium tracking-tighter text-white uppercase italic">
              {title}
            </h1>
            <p className="text-sm text-neutral-500 font-light italic leading-relaxed">
              Searching available active protocols across the network array.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-8 h-8 animate-spin text-neutral-700" />
             <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Synchronizing Ledger Data</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-32 text-center bg-neutral-900/10 border border-dashed border-neutral-800 rounded-[40px]">
             <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800">
               <Database className="h-6 w-6 text-neutral-500" />
             </div>
             <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Zero Matches Found</h3>
             <p className="text-neutral-500 mb-8 max-w-xs mx-auto text-sm italic">
                No active records matched your current query parameters.
             </p>
             <Button className="bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8" asChild>
               <Link href="/">Clear Parameters <ArrowRight className="w-3 h-3 ml-2" /></Link>
             </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-neutral-500" />
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-black">Search Results</h2>
              <div className="h-[1px] flex-1 bg-neutral-900" />
              <span className="text-[9px] font-mono text-neutral-600">{results.length} Nodes</span>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {results.map((event) => (
                <div key={event.id} className="group relative">
                  <EventCard event={event} variant="portrait" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-neutral-700 mb-4" />
           <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Initializing Node</p>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
