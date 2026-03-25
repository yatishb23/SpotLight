"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BarChart3, Eye, Plus, Ticket, Wallet } from "lucide-react";
import { changeEventStatus } from "@/lib/api";
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

  const totalEvents = safeNumber(stats?.totalEvents);
  const totalRevenue = safeNumber(stats?.totalRevenue);
  const totalTickets = safeNumber(stats?.totalTickets);
  const displayName = userDetails?.name?.trim() || "Organizer";

  const normalizedEvents: Event[] = Array.isArray(events)
    ? events
    : Array.isArray(events?.events)
      ? events.events
      : Array.isArray(events?.data)
        ? events.data
        : [];

  const [eventItems, setEventItems] = useState<Event[]>(normalizedEvents);

  useEffect(() => {
    setEventItems(normalizedEvents);
  }, [events]);

  const getStatus = (event: any) =>
    String(event?.status || "DRAFT").toUpperCase();

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          eventItems
            .map((event: any) =>
              String(
                event?.city || event?.venueName || event?.address || "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      ),
    [eventItems],
  );

  const filteredEvents = eventItems.filter((event: any) => {
    const eventStatus = getStatus(event);
    const eventLocation = String(
      event?.city || event?.venueName || event?.address || "",
    ).trim();
    const title = String(event?.title || "").toLowerCase();
    const description = String(event?.description || "").toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      title.includes(searchLower) || description.includes(searchLower);
    const matchesStatus =
      selectedStatus === "ALL" || eventStatus === selectedStatus;
    const matchesLocation =
      selectedLocation === "ALL" || eventLocation === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
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
      router.refresh();
    } catch (error) {
      console.error("Failed to update event status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Welcome, {displayName}</CardTitle>
        </CardHeader>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalEvents}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Active events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatINR(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                From ticket sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalTickets}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Sold across all events
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Events</h2>
            <p className="text-muted-foreground">
              Manage and track your hosted events
            </p>
          </div>

          <Link href="/dashboard/create-event">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2"
          />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No events match the selected filters.
                </p>
                <Link href="/dashboard/create-event">
                  <Button variant="outline">Create Your First Event</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event: any) => {
                  const status = getStatus(event);

                  return (
                    <Card
                      key={event.id}
                      className="overflow-hidden border-muted cursor-pointer transition-colors hover:border-primary/40"
                      onClick={() =>
                        router.push(`/dashboard/my-events/${event.id}`)
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base line-clamp-1">
                              {event.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {event.city ||
                                event.venueName ||
                                "Location not set"}
                            </p>
                          </div>
                          <Badge variant="outline">{status}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="text-sm flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Ticket Price
                          </span>
                          <span className="font-medium">
                            {formatINR(Number(event.ticketPrice || 0))}
                          </span>
                        </div>
                        <div className="text-sm flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Remaining
                          </span>
                          <span className="font-medium">
                            {Number(
                              event.availableCapacity ?? event.capacity ?? 0,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdatingStatus === String(event.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(
                                  String(event.id),
                                  "PUBLISHED",
                                );
                              }}
                            >
                              Publish
                            </Button>
                          )}
                          {(status === "DRAFT" || status === "PUBLISHED") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isUpdatingStatus === String(event.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(
                                  String(event.id),
                                  "CANCELLED",
                                );
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/my-events/${event.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
