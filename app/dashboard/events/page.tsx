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
import { MoreHorizontal, Search, RotateCcw, Loader2, Calendar, User, ShieldCheck } from "lucide-react";
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
        toast.error("Security sync failed: Could not load platform events");
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
      toast.success(`Protocol updated: Event marked as ${nextStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Request failed: Unable to update event status");
    } finally {
      setUpdatingEventId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    const s = String(status || "PUBLISHED").toUpperCase();
    switch (s) {
      case "DRAFT": return "text-neutral-500 border-neutral-800 bg-neutral-900/50";
      case "PUBLISHED": return "text-emerald-400 border-emerald-900/50 bg-emerald-500/5";
      case "ONGOING": return "text-blue-400 border-blue-900/50 bg-blue-500/5";
      case "COMPLETED": return "text-purple-400 border-purple-900/50 bg-purple-500/5";
      case "CANCELLED": return "text-red-400 border-red-900/50 bg-red-500/5";
      default: return "text-neutral-400 border-neutral-800 bg-neutral-900/50";
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-neutral-800 border-t-neutral-400 rounded-full animate-spin" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Synchronizing Records</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Refined Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-neutral-900">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Administrative Governance</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-medium tracking-tight text-neutral-50">Global Catalog</h1>
            <p className="text-sm font-light text-neutral-500 italic">Oversight and lifecycle management for all platform activities.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-neutral-300 transition-colors" />
            <Input
              placeholder="Query events or hosts..."
              className="w-full sm:w-[320px] pl-10 h-11 bg-neutral-950 border-neutral-900 focus:ring-1 focus:ring-neutral-700 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 border border-neutral-900 hover:bg-neutral-900 text-neutral-500"
            onClick={() => {
              setSelectedStatus("ALL");
              setSelectedOrganizer("ALL");
              setSearchTerm("");
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Filters & Content */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-44 h-10 bg-neutral-950 border-neutral-900 text-xs uppercase tracking-widest font-semibold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-900">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
            <SelectTrigger className="w-full sm:w-56 h-10 bg-neutral-950 border-neutral-900 text-xs uppercase tracking-widest font-semibold">
              <SelectValue placeholder="Organizer" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-900">
              <SelectItem value="ALL">All Organizers</SelectItem>
              {organizers.map((org) => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-neutral-950 border-neutral-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-neutral-900/40">
              <TableRow className="border-neutral-900 hover:bg-transparent">
                <TableHead className="py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Identity</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Host</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Timeline</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Utilization</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Protocol</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-48 text-center">
                    <p className="text-sm font-light text-neutral-600 italic">No records matching your current filter set.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const status = String(event?.status || "DRAFT").toUpperCase();
                  const isUpdating = updatingEventId === event.id;

                  return (
                    <TableRow key={event.id} className="border-neutral-900 hover:bg-neutral-900/30 transition-colors group">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-neutral-200 tracking-tight">{event.title}</span>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold group-hover:text-neutral-400 transition-colors">{event.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <User className="h-3.5 w-3.5 text-neutral-600" /> {event.organizer || event.organizerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-neutral-500 gap-1.5">
                          <span className="flex items-center gap-2 text-neutral-300 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-neutral-600" />
                            {event.startDatetime ? new Date(event.startDatetime).toLocaleDateString('en-GB') : "TBD"}
                          </span>
                          <span className="text-[10px] uppercase text-neutral-600 ml-5">
                            {event.startDatetime ? new Date(event.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-200 font-medium">{event.ticketsSold ?? 0}</span>
                          <span className="text-neutral-800">/</span>
                          <span className="text-neutral-500 font-light italic">{event.capacity ?? event.totalCapacity ?? "∞"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 ${getStatusStyles(status)}`}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 text-neutral-500 hover:text-white hover:bg-neutral-800">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-neutral-950 border-neutral-800 text-neutral-300 shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-tighter text-neutral-500">Command Control</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            
                            {status === "DRAFT" && (
                              <DropdownMenuItem 
                                className="text-emerald-400 focus:bg-emerald-950 focus:text-emerald-300"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(event.id, "PUBLISHED")}
                              >
                                Commit to Platform
                              </DropdownMenuItem>
                            )}

                            {(status === "DRAFT" || status === "PUBLISHED") && (
                              <DropdownMenuItem 
                                className="text-red-400 focus:bg-red-950 focus:text-red-300"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(event.id, "CANCELLED")}
                              >
                                Abort Lifecycle
                              </DropdownMenuItem>
                            )}

                            {["ONGOING", "COMPLETED", "CANCELLED"].includes(status) && (
                              <DropdownMenuItem disabled className="text-neutral-700 italic text-xs">
                                Read-only state
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem className="text-[10px] font-mono text-neutral-600" disabled>
                              UID: {event.id}
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
        </Card>
      </div>
    </div>
  );
}