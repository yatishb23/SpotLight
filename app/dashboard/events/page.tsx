"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Filter, Loader2, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeEventStatus, getAdminStats } from "@/lib/api";
import { toast } from "sonner";

export default function ManageEventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrganizer, setSelectedOrganizer] = useState("ALL");

  useEffect(() => {
    if (status === "loading") return;

    const role = session?.user?.role?.toLowerCase();
    if (role !== "admin" && role !== "super_admin") {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const adminData = (await getAdminStats()) as any;
        const eventsPayload = adminData?.events;

        const normalizedEvents = Array.isArray(eventsPayload)
          ? eventsPayload
          : eventsPayload?.events || eventsPayload?.data || [];
        setEvents(normalizedEvents);
      } catch (error) {
        toast.error("Failed to load platform events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [session, status]);

  const handleStatusChange = async (id: string, nextStatus: "PUBLISHED" | "CANCELLED") => {
    try {
      setUpdatingEventId(id);
      await changeEventStatus(id, nextStatus);
      setEvents((prev) =>
        prev.map((event) =>
          String(event.id) === String(id) ? { ...event, status: nextStatus } : event
        )
      );
      toast.success(`Event marked as ${nextStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingEventId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    const s = String(status || "PUBLISHED").toUpperCase();
    switch (s) {
      case "DRAFT": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "PUBLISHED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "ONGOING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "COMPLETED": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const organizers = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => String(event?.organizer || event?.organizerName || "").trim())
          .filter(Boolean)
      )
    ).sort();
  }, [events]);

  const filteredEvents = events.filter((event) => {
    const title = String(event?.title || "").toLowerCase();
    const organizer = String(event?.organizer || event?.organizerName || "").trim();
    const currentStatus = String(event?.status || "").toUpperCase();

    const matchesSearch = title.includes(searchTerm.toLowerCase()) || 
                          organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || currentStatus === selectedStatus;
    const matchesOrganizer = selectedOrganizer === "ALL" || organizer === selectedOrganizer;

    return matchesSearch && matchesStatus && matchesOrganizer;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm text-neutral-500 animate-pulse">Fetching platform events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-neutral-900 pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Platform Events</h1>
          <p className="text-neutral-500">Global oversight of all published and drafted events.</p>
        </div>
        <Button
          variant="ghost"
          className="text-neutral-400 hover:text-white"
          onClick={() => {
            setSelectedStatus("ALL");
            setSelectedOrganizer("ALL");
            setSearchTerm("");
          }}
        >
          <Filter className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      </div>

      <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl font-bold">Event Catalog</CardTitle>
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search events or organizers..."
                  className="pl-9 bg-neutral-950 border-neutral-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40 bg-neutral-950 border-neutral-800">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                <SelectTrigger className="w-full sm:w-48 bg-neutral-950 border-neutral-800">
                  <SelectValue placeholder="Organizer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Organizers</SelectItem>
                  {organizers.map((org) => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-900/60">
                <TableRow className="hover:bg-transparent border-neutral-800">
                  <TableHead className="py-4">Event Details</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Booking Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-neutral-500">
                      No events found matching current criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const status = String(event?.status || "DRAFT").toUpperCase();
                    const isUpdating = updatingEventId === event.id;

                    return (
                      <TableRow key={event.id} className="border-neutral-800 hover:bg-neutral-900/40 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-neutral-200">{event.title}</span>
                            <span className="text-[10px] uppercase tracking-tighter text-neutral-500">{event.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <User className="h-3 w-3" /> {event.organizer || event.organizerName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs text-neutral-400 gap-1">
                            <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                              <Calendar className="h-3 w-3" />
                              {event.startDatetime ? new Date(event.startDatetime).toLocaleDateString() : "TBD"}
                            </span>
                            <span>{event.startDatetime ? new Date(event.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-200 font-bold">{event.ticketsSold ?? 0}</span>
                            <span className="text-neutral-600">/</span>
                            <span className="text-neutral-500">{event.capacity ?? event.totalCapacity ?? "∞"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-widest ${getStatusStyles(status)}`}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-800">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
                              <DropdownMenuLabel>Administrative Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-neutral-800" />
                              
                              {status === "DRAFT" && (
                                <DropdownMenuItem 
                                  className="text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(event.id, "PUBLISHED")}
                                >
                                  Publish Platform-wide
                                </DropdownMenuItem>
                              )}

                              {(status === "DRAFT" || status === "PUBLISHED") && (
                                <DropdownMenuItem 
                                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(event.id, "CANCELLED")}
                                >
                                  Cancel Event
                                </DropdownMenuItem>
                              )}

                              {["ONGOING", "COMPLETED", "CANCELLED"].includes(status) && (
                                <DropdownMenuItem disabled className="text-neutral-600">
                                  No actions available
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator className="bg-neutral-800" />
                              <DropdownMenuItem className="text-neutral-400" disabled>
                                ID: {event.id}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}