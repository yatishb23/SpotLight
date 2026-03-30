"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  BarChart3, 
  Eye, 
  Plus, 
  Ticket, 
  Wallet, 
  Trash2, 
  MapPin, 
  Calendar, 
  Loader2, 
  ShieldCheck,
  ChevronRight,
  Search
} from "lucide-react";
import { changeEventStatus, deleteEvent } from "@/lib/api";
import type { DashboardUserDetails, Event } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface OrganizerDashboardProps {
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTickets: number;
  } | null;
  events: any;
  userDetails: DashboardUserDetails | null;
}

export function OrganizerDashboard({
  stats,
  events,
  userDetails,
}: OrganizerDashboardProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const safeNumber = (val: any) =>
    typeof val === "number" && !isNaN(val) ? val : 0;
  
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const displayName = userDetails?.name?.trim() || "Authorized Organizer";

  const normalizedEvents: Event[] = useMemo(() => {
    if (Array.isArray(events)) return events;
    if (Array.isArray(events?.events)) return events.events;
    if (Array.isArray(events?.data)) return events.data;
    return [];
  }, [events]);

  const [eventItems, setEventItems] = useState<Event[]>(normalizedEvents);

  useEffect(() => {
    setEventItems(normalizedEvents);
  }, [normalizedEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Confirm Protocol: Deletion of this event registry cannot be reversed.")) return;

    try {
      setIsUpdatingStatus(eventId);
      await deleteEvent(eventId);
      setEventItems((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
      toast.success("Registry Deleted");
    } catch (error) {
      toast.error("Deletion protocol failed");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          eventItems
            .map((event: any) => String(event?.city || event?.venueName || "").trim())
            .filter(Boolean),
        ),
      ),
    [eventItems],
  );

  const filteredEvents = eventItems.filter((event: any) => {
    const status = String(event?.status || "DRAFT").toUpperCase();
    const loc = String(event?.city || event?.venueName || "").trim();
    const title = String(event?.title || "").toLowerCase();
    return (
      title.includes(search.toLowerCase()) &&
      (selectedStatus === "ALL" || status === selectedStatus) &&
      (selectedLocation === "ALL" || loc === selectedLocation)
    );
  });

  const handleStatusChange = async (eventId: string, nextStatus: "PUBLISHED" | "CANCELLED") => {
    try {
      setIsUpdatingStatus(eventId);
      await changeEventStatus(eventId, nextStatus);
      setEventItems((prev) =>
        prev.map((e: any) => String(e.id) === String(eventId) ? { ...e, status: nextStatus } : e)
      );
      toast.success(`Protocol: ${nextStatus}`);
    } catch (error) {
      toast.error("Status update synchronization failed");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Ledger */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">Registry: {userDetails?.id?.slice(0, 8) || "LIVE"}</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-white italic">
            Welcome, <span className="text-neutral-400 font-light not-italic">{displayName}</span>
          </h1>
          <p className="text-sm text-neutral-500 font-light">Global management system for your authorized events.</p>
        </div>
        <Link href="/dashboard/create-event">
          <Button className="bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Plus className="w-3 h-3 mr-2 stroke-[3px]" /> Create New Event
          </Button>
        </Link>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Active Events", val: eventItems.length, icon: BarChart3, color: "text-blue-500" },
          { label: "Total Valuation", val: formatINR(safeNumber(stats?.totalRevenue)), icon: Wallet, color: "text-emerald-500" },
          { label: "Units Dispatched", val: safeNumber(stats?.totalTickets), icon: Ticket, color: "text-purple-500" },
        ].map((s, i) => (
          <Card key={i} className="bg-neutral-900/20 border-neutral-800/50 backdrop-blur-xl group hover:border-neutral-700 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-3">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} /> {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium tracking-tighter text-white">{s.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Terminal */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Search Event Registry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-neutral-900/50 border-neutral-800 pl-12 h-12 focus:ring-0 focus:border-neutral-600 text-sm tracking-wide rounded-2xl"
            />
          </div>
          <div className="flex gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px] bg-neutral-900/50 border-neutral-800 h-12 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                <SelectItem value="ALL">ALL STATUS</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[160px] bg-neutral-900/50 border-neutral-800 h-12 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                <SelectValue placeholder="LOCATION" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                <SelectItem value="ALL">ALL NODES</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-neutral-950 rounded-[32px] border border-dashed border-neutral-800 group">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800 opacity-20 group-hover:opacity-100 transition-opacity">
               <Plus className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 font-black">No registry records found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event: any) => {
              const status = String(event?.status || "DRAFT").toUpperCase();
              const isBusy = isUpdatingStatus === String(event.id);

              return (
                <Card
                  key={event.id}
                  className="bg-[#0a0a0a] border-neutral-900 rounded-[24px] overflow-hidden group hover:border-neutral-700 transition-all cursor-pointer relative"
                  onClick={() => router.push(`/dashboard/my-events/${event.id}`)}
                >
                  <CardHeader className="p-6 pb-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <Badge variant="outline" className={`border-none p-0 text-[8px] font-black tracking-[0.2em] ${status === 'PUBLISHED' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                          {status} // AUTH_V2
                        </Badge>
                        <CardTitle className="text-xl font-bold tracking-tight text-white line-clamp-1">
                          {event.title}
                        </CardTitle>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-4 space-y-6">
                    <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500">
                       <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {event.city || "REMOTE"}</span>
                       <Separator orientation="vertical" className="h-3 bg-neutral-800" />
                       <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {event.startDate || "TBD"}</span>
                    </div>

                    <div className="bg-neutral-900/40 rounded-xl p-4 flex justify-between border border-neutral-800/50">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Entry Fee</p>
                        <p className="text-sm font-medium text-white">{formatINR(event.ticketPrice)}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Allocated</p>
                        <p className="text-sm font-medium text-white">{event.availableCapacity ?? event.capacity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {status === "DRAFT" && (
                        <>
                          <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(String(event.id), "PUBLISHED"); }}
                            className="bg-white text-black hover:bg-neutral-200 text-[10px] font-black uppercase tracking-widest px-4 h-8 rounded-lg"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-500/10 h-8 px-2"
                            disabled={isBusy}
                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(String(event.id)); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {status === "PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-900/50 text-red-500 hover:bg-red-900/20 text-[10px] font-black uppercase tracking-widest h-8 px-4 rounded-lg"
                          disabled={isBusy}
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(String(event.id), "CANCELLED"); }}
                        >
                          {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                      
                      <div className="ml-auto flex items-center gap-2 text-neutral-600 group-hover:text-white transition-colors">
                        <span className="text-[9px] font-bold uppercase tracking-widest">View Analytics</span>
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Footer */}
      <footer className="pt-10 border-t border-neutral-900 flex justify-between items-center opacity-20">
         <p className="text-[9px] font-mono tracking-widest uppercase text-neutral-500 flex items-center gap-2">
           <ShieldCheck className="w-3 h-3" /> HUB_ADMIN_SESSION: ACTIVE
         </p>
         <p className="text-[9px] font-mono tracking-widest uppercase text-neutral-500">
           LAST_SYNC: {new Date().toLocaleTimeString()}
         </p>
      </footer>
    </div>
  );
}