'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EventBanner } from '@/components/event-banner';
import { LoadingState } from '@/components/loading-state';
import { ErrorFallback } from '@/components/error-fallback';
import { apiClient, getCachedEventSnapshot, primeEventSnapshots } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { Share2, MapPin, Clock, Users, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

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
        if (cachedEvent) { setEvent(cachedEvent); setIsLoading(false); } else { setIsLoading(true); }
        setError(null);
        const eventData = (await apiClient.getEventById(eventId)) as any;
        const normalizedEvent = eventData?.data ?? eventData;
        if (normalizedEvent) {
          primeEventSnapshots([normalizedEvent]);
          const organizerData = normalizedEvent?.organizerId
            ? await apiClient.getUserByUid(String(normalizedEvent.organizerId))
            : null;
          const normalizedOrganizer = (organizerData as any)?.data ?? organizerData ?? null;
          setEvent(normalizedEvent);
          setOrganizer((normalizedOrganizer as any)?.fullName || 'Verified Organizer');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event.');
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6 py-12"><LoadingState count={1} type="chart" /></div>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <ErrorFallback title="Event not found" message={error || 'This event could not be loaded.'} onRetry={() => window.location.reload()} />
        <Link href="/"><Button variant="link" className="text-white/30 hover:text-white text-[12px]">← Back to home</Button></Link>
      </div>
    </div>
  );

  const bookSeatQuery = new URLSearchParams({
    title: event.title || '',
    ticketPrice: String(event.ticketPrice ?? 0),
    remainingSeats: String(event.availableCapacity ?? 0),
    totalCapacity: String(event.totalCapacity ?? 0),
    startDatetime: event.startDatetime || '',
    venueName: event.venueName || '',
    city: event.city || '',
  }).toString();

  const bookSeatHref = `/events/${eventId}/book?${bookSeatQuery}`;

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pb-20">

      {/* Breadcrumb nav */}
      <nav className="border-b border-white/[0.04] bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-2 text-[12px] text-white/30">
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{event.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <EventBanner
          event={event}
          onBookClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-12">

            {/* Description */}
            <section className="space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/25">About</h2>
              <p className="text-[15px] font-light leading-relaxed text-white/60 max-w-2xl">
                {event.description}
              </p>
            </section>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-white/[0.05]">
              <DetailItem icon={<Clock />} label="Date & Time"
                value={formatDate(event.startDatetime || new Date())}
                sub={new Date(event.startDatetime || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <DetailItem icon={<MapPin />} label="Venue"
                value={event.venueName || 'TBD'}
                sub={event.city || ''}
              />
              <DetailItem icon={<Users />} label="Availability"
                value={`${event.availableCapacity} seats left`}
                sub={`Total capacity: ${event.totalCapacity}`}
              />
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-1">Organizer</p>
                  <p className="text-[14px] font-medium text-white/70">{organizer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <aside id="booking-section" className="lg:sticky lg:top-20 lg:h-fit">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 space-y-8">

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">Price per ticket</p>
                <p className="text-4xl font-light text-white tracking-tight">
                  {formatINR(event.ticketPrice)}
                </p>
              </div>

              <div className="space-y-3">
                <Link href={bookSeatHref} className="block">
                  <Button className="w-full h-12 bg-white text-black hover:bg-white/90 text-[12px] font-semibold rounded-xl flex items-center justify-center gap-2 group">
                    Book Tickets
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full h-10 text-white/30 hover:text-white/70 hover:bg-white/[0.04] rounded-xl text-[12px] border border-white/[0.05]"
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: event.title, url: window.location.href });
                    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }
                  }}
                >
                  <Share2 className="w-3.5 h-3.5 mr-2" />
                  Share event
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/25 pt-2 border-t border-white/[0.05]">
                <span>{event.availableCapacity} seats remaining</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ icon, label, value, sub }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-1">{label}</p>
        <p className="text-[14px] font-medium text-white/80">{value}</p>
        {sub && <p className="text-[12px] text-white/35 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}