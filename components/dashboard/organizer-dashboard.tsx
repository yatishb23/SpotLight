'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { BarChart3, Eye, Plus, Ticket, Wallet, Trash2, MapPin, Calendar, Loader2, ShieldCheck, Search } from 'lucide-react';
import { changeEventStatus, deleteEvent } from '@/lib/api';
import type { DashboardUserDetails, Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface OrganizerDashboardProps {
  stats: { totalEvents: number; totalRevenue: number; totalTickets: number } | null;
  events: any;
  userDetails: DashboardUserDetails | null;
}

export function OrganizerDashboard({ stats, events, userDetails }: OrganizerDashboardProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));

  const displayName = userDetails?.name?.trim() || 'Organizer';

  const normalizedEvents: Event[] = useMemo(() => {
    if (Array.isArray(events)) return events;
    if (Array.isArray(events?.events)) return events.events;
    if (Array.isArray(events?.data)) return events.data;
    return [];
  }, [events]);

  const [eventItems, setEventItems] = useState<Event[]>(normalizedEvents);
  useEffect(() => { setEventItems(normalizedEvents); }, [normalizedEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    try {
      setIsUpdatingStatus(eventId);
      await deleteEvent(eventId);
      setEventItems((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
    finally { setIsUpdatingStatus(null); }
  };

  const locations = useMemo(() =>
    Array.from(new Set(eventItems.map((e: any) => String(e?.city || e?.venueName || '').trim()).filter(Boolean))),
    [eventItems]
  );

  const filteredEvents = eventItems.filter((event: any) => {
    const status = String(event?.status || 'DRAFT').toUpperCase();
    const loc = String(event?.city || event?.venueName || '').trim();
    return (
      String(event?.title || '').toLowerCase().includes(search.toLowerCase()) &&
      (selectedStatus === 'ALL' || status === selectedStatus) &&
      (selectedLocation === 'ALL' || loc === selectedLocation)
    );
  });

  const handleStatusChange = async (eventId: string, nextStatus: 'PUBLISHED' | 'CANCELLED') => {
    try {
      setIsUpdatingStatus(eventId);
      await changeEventStatus(eventId, nextStatus);
      setEventItems((prev) => prev.map((e: any) => String(e.id) === String(eventId) ? { ...e, status: nextStatus } : e));
      toast.success(`Event ${nextStatus.toLowerCase()}`);
    } catch { toast.error('Failed to update status'); }
    finally { setIsUpdatingStatus(null); }
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-8 border-b border-white/[0.05]">
        <div>
          <p className="text-[11px] text-white/25 mb-1">Welcome back</p>
          <h1 className="text-2xl font-light text-white">{displayName}</h1>
        </div>
        <Link href="/dashboard/create-event">
          <Button className="bg-white text-black hover:bg-white/90 text-[12px] font-semibold px-6 h-10 rounded-xl flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total events', value: eventItems.length, icon: BarChart3 },
          { label: 'Revenue', value: formatINR(stats?.totalRevenue || 0), icon: Wallet },
          { label: 'Tickets sold', value: stats?.totalTickets || 0, icon: Ticket },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-white/25 uppercase tracking-widest">{s.label}</span>
              <s.icon className="w-4 h-4 text-white/15" />
            </div>
            <p className="text-2xl font-light text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/[0.03] border-white/[0.06] pl-10 h-10 text-[13px] text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/15 rounded-xl"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.06] h-10 rounded-xl text-[12px] text-white/40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/[0.07]">
            {['ALL', 'DRAFT', 'PUBLISHED', 'CANCELLED'].map((s) => (
              <SelectItem key={s} value={s} className="text-[12px] text-white/50">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.06] h-10 rounded-xl text-[12px] text-white/40">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/[0.07]">
            <SelectItem value="ALL" className="text-[12px] text-white/50">All cities</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc} className="text-[12px] text-white/50">{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <p className="text-[12px] text-white/20">No events found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event: any) => {
            const status = String(event?.status || 'DRAFT').toUpperCase();
            const isBusy = isUpdatingStatus === String(event.id);

            return (
              <div
                key={event.id}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all cursor-pointer group"
                onClick={() => router.push(`/dashboard/my-events/${event.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-widest mb-1.5 block',
                      status === 'PUBLISHED' ? 'text-emerald-500' : status === 'CANCELLED' ? 'text-red-400' : 'text-white/25'
                    )}>
                      {status}
                    </span>
                    <h3 className="text-[14px] font-medium text-white truncate">{event.title}</h3>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors shrink-0 mt-1" />
                </div>

                <div className="flex gap-4 text-[11px] text-white/30 mb-5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city || 'TBD'}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.startDate || 'TBD'}</span>
                </div>

                <div className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 mb-4">
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Price</p>
                    <p className="text-[13px] font-medium text-white/70">{formatINR(event.ticketPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Seats</p>
                    <p className="text-[13px] font-medium text-white/70">{event.availableCapacity ?? event.capacity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {status === 'DRAFT' && (
                    <>
                      <Button size="sm" disabled={isBusy}
                        onClick={() => handleStatusChange(String(event.id), 'PUBLISHED')}
                        className="bg-white text-black hover:bg-white/90 text-[11px] font-semibold h-8 px-4 rounded-lg">
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Publish'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={isBusy}
                        onClick={() => handleDeleteEvent(String(event.id))}
                        className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {status === 'PUBLISHED' && (
                    <Button size="sm" variant="outline" disabled={isBusy}
                      onClick={() => handleStatusChange(String(event.id), 'CANCELLED')}
                      className="border-red-500/20 text-red-400/70 hover:bg-red-500/10 text-[11px] h-8 px-4 rounded-lg">
                      {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}