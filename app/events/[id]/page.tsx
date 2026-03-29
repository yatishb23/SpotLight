"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { EventBanner } from "@/components/event-banner";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import {
  apiClient,
  getCachedEventSnapshot,
  primeEventSnapshots,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { Share2, MapPin, Clock, Users, ArrowLeft, ShieldCheck, Ticket, Fingerprint } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [organizer, setOrganizer] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const cachedEvent = getCachedEventSnapshot<Event>(eventId);
        if (cachedEvent) {
          setEvent(cachedEvent);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
        setError(null);
        const eventData = (await apiClient.getEventById(eventId)) as any;
        const normalizedEvent = eventData?.data ?? eventData;
        
        if (normalizedEvent) {
          primeEventSnapshots([normalizedEvent]);
          const organizerData = normalizedEvent?.organizerId
            ? await apiClient.getUserById(String(normalizedEvent.organizerId))
            : null;

          const normalizedOrganizer = (organizerData as any)?.data ?? organizerData ?? null;

          setEvent(normalizedEvent);
          setOrganizer((normalizedOrganizer as any)?.fullName || "Authorized Organizer");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registry sync failed");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  // Reverted to your previous loading style
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <LoadingState count={1} type="chart" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-neutral-400">
        <div className="text-center space-y-4">
          <ErrorFallback title="Node Offline" message={error || "Event identity lost."} onRetry={() => window.location.reload()} />
          <Link href="/"><Button variant="link" className="text-neutral-600 uppercase text-[10px] tracking-widest">Return to Ledger</Button></Link>
        </div>
      </div>
    );
  }

  const bookSeatQuery = new URLSearchParams({
    title: event.title || "",
    ticketPrice: String(event.ticketPrice ?? 0),
    remainingSeats: String(event.availableCapacity ?? 0),
    totalCapacity: String(event.totalCapacity ?? 0),
    startDatetime: event.startDatetime || "",
    venueName: event.venueName || "",
    city: event.city || "",
  }).toString();

  const bookSeatHref = `/events/${eventId}/book?${bookSeatQuery}`;
  
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 pb-20">
      {/* Subtle Navigation */}
      <nav className="border-b border-neutral-900 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-colors">Registry</Link>
            <span className="text-neutral-800">/</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-bold">{event.title}</span>
          </div>
          <Fingerprint className="w-4 h-4 text-neutral-800" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="animate-in fade-in zoom-in-95 duration-1000">
          <EventBanner
            event={event}
            onBookClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Information Column */}
          <div className="lg:col-span-2 space-y-16">
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-600 font-bold">Abstract</p>
              <p className="text-xl font-light leading-relaxed text-neutral-300 max-w-2xl">
                {event.description}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-neutral-900">
              <SpecItem icon={<Clock />} label="Temporal" value={formatDate(event.startDatetime || new Date())} sub={new Date(event.startDatetime || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              <SpecItem icon={<MapPin />} label="Coordinates" value={event.venueName || "TBD"} sub={event.city || "Registry Only"} />
              <SpecItem icon={<Users />} label="Allocation" value={`${event.availableCapacity} Units Left`} sub={`Capacity: ${event.totalCapacity}`} />
              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-neutral-700 font-bold">Authorized By</p>
                <div className="flex items-center gap-2 text-white font-medium italic">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {organizer}
                </div>
              </div>
            </div>
          </div>

          {/* DARK THEME Booking Sidebar */}
          <aside id="booking-section" className="lg:sticky lg:top-28 lg:h-fit">
            <Card className="bg-neutral-900/40 border border-neutral-800 backdrop-blur-md rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-10 space-y-10">
                
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 font-bold">Current Valuation</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-medium text-white tracking-tighter">
                      {formatINR(event.ticketPrice)}
                    </h3>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono">/ unit</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href={bookSeatHref} className="block">
                    <Button className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex justify-between px-8 group">
                      Initialize Pass
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-2xl text-[10px] uppercase tracking-widest font-bold border border-neutral-800/50"
                    onClick={() => {
                      if (navigator.share) navigator.share({ title: event.title, url: window.location.href });
                      else { navigator.clipboard.writeText(window.location.href); toast.success("Identity URL Copied"); }
                    }}
                  >
                    <Share2 className="w-3 h-3 mr-2" />
                    Dispatch Identity
                  </Button>
                </div>

                <div className="flex items-center justify-between px-2 opacity-50">
                   <div className="flex items-center gap-2">
                      <Ticket className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-widest">{event.availableCapacity} Left</span>
                   </div>
                   <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </Card>

            <div className="mt-8 flex flex-col items-center gap-4 opacity-20">
              <div className="h-px w-12 bg-neutral-700" />
              <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-500 text-center leading-loose">
                Encryption Active // Node Hub_09<br/>Session Secured
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

function SpecItem({ icon, label, value, sub }: any) {
  return (
    <div className="flex gap-5 group">
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:border-neutral-600 transition-all duration-500 group-hover:text-white">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-bold">{label}</p>
        <p className="text-md font-medium text-white tracking-tight">{value}</p>
        <p className="text-xs text-neutral-500 font-light">{sub}</p>
      </div>
    </div>
  );
}