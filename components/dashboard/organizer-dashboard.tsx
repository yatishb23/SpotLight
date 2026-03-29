"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BarChart3, Eye, Plus, Ticket, Wallet, Trash2 } from "lucide-react";
import { changeEventStatus, deleteEvent } from "@/lib/api"; // Ensure deleteEvent is exported from your API lib
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
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const displayName = userDetails?.name?.trim() || "Organizer";

  // Logic to normalize incoming event data
  const normalizedEvents: Event[] = useMemo(() => {
    if (Array.isArray(events)) return events;
    if (Array.isArray(events?.events)) return events.events;
    if (Array.isArray(events?.data)) return events.data;
    return [];
  }, [events]);

  // Local state for event items so we can remove deleted items instantly
  const [eventItems, setEventItems] = useState<Event[]>(normalizedEvents);

  useEffect(() => {
    setEventItems(normalizedEvents);
  }, [normalizedEvents]);

  // --- DELETE LOGIC ---
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      setIsUpdatingStatus(eventId);
      await deleteEvent(eventId);
      
      // Update local state to reflect deletion immediately
      setEventItems((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
      
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getStatus = (event: any) =>
    String(event?.status || "DRAFT").toUpperCase();

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          eventItems
            .map((event: any) =>
              String(event?.city || event?.venueName || event?.address || "").trim(),
            )
            .filter(Boolean),
        ),
      ),
    [eventItems],
  );

  const filteredEvents = eventItems.filter((event: any) => {
    const eventStatus = getStatus(event);
    const eventLocation = String(event?.city || event?.venueName || event?.address || "").trim();
    const title = String(event?.title || "").toLowerCase();
    const searchLower = search.toLowerCase();

    return (
      (title.includes(searchLower)) &&
      (selectedStatus === "ALL" || eventStatus === selectedStatus) &&
      (selectedLocation === "ALL" || eventLocation === selectedLocation)
    );
  });

  const handleStatusChange = async (
    eventId: string,
    nextStatus: "PUBLISHED" | "CANCELLED",
  ) => {
    try {
      setIsUpdatingStatus(eventId);
      await changeEventStatus(eventId, nextStatus);
      setEventItems((prev) =>
        prev.map((event: any) =>
          String(event.id) === String(eventId)
            ? { ...event, status: nextStatus }
            : event,
        ),
      );
      toast.success(`Event ${nextStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Card */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Welcome back, <span className="text-blue-500">{displayName}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Events", val: safeNumber(eventItems.length), icon: BarChart3, color: "text-blue-500" },
            { label: "Total Revenue", val: formatINR(safeNumber(stats.totalRevenue)), icon: Wallet, color: "text-emerald-500" },
            { label: "Tickets Sold", val: safeNumber(stats.totalTickets), icon: Ticket, color: "text-purple-500" },
          ].map((s, i) => (
            <Card key={i} className="bg-neutral-900/40 border-neutral-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tighter">{s.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Events</h2>
            <p className="text-sm text-neutral-500">Manage and track your hosted events</p>
          </div>
          <Link href="/dashboard/create-event">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 bg-neutral-900/20 p-4 rounded-xl border border-neutral-800">
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2 bg-neutral-950 border-neutral-800 focus:border-blue-500 transition-all"
          />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="bg-neutral-950 border-neutral-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="bg-neutral-950 border-neutral-800">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 border border-dashed border-neutral-800 rounded-3xl">
            <p className="text-neutral-500">No events match your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event: any) => {
              const status = getStatus(event);
              const isBusy = isUpdatingStatus === String(event.id);

              return (
                <Card
                  key={event.id}
                  className="group relative overflow-hidden bg-neutral-900/40 border-neutral-800 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/my-events/${event.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {event.title}
                        </CardTitle>
                        <p className="text-xs text-neutral-500 line-clamp-1">
                          {event.city || event.venueName || "Remote/No Location"}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-neutral-950 text-[10px] uppercase">
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-xs border-b border-neutral-800 pb-2">
                      <span className="text-neutral-500">Price: <span className="text-emerald-400 font-bold">{formatINR(event.ticketPrice)}</span></span>
                      <span className="text-neutral-500">Seats: <span className="text-blue-400 font-bold">{event.availableCapacity ?? event.capacity}</span></span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {status === "DRAFT" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border-emerald-600/20"
                            disabled={isBusy}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(String(event.id), "PUBLISHED");
                            }}
                          >
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-500/10"
                            disabled={isBusy}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(String(event.id));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {status === "PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-900/50 text-red-500 hover:bg-red-900/20"
                          disabled={isBusy}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(String(event.id), "CANCELLED");
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="ml-auto bg-neutral-800 hover:bg-neutral-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/my-events/${event.id}`);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}