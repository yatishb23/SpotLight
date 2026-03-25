"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Search, Filter, Loader2 } from "lucide-react";
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

    const rawRole = session?.user?.role?.toLowerCase();
    const role = rawRole;
    if (role !== "admin") {
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
          : Array.isArray(eventsPayload?.events)
            ? eventsPayload.events
            : Array.isArray(eventsPayload?.data)
              ? eventsPayload.data
              : [];
        setEvents(normalizedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load admin events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [session, status]);

  const handleStatusChange = async (
    id: string,
    nextStatus: "PUBLISHED" | "CANCELLED",
  ) => {
    try {
      setUpdatingEventId(id);
      await changeEventStatus(id, nextStatus);

      setEvents((prev) =>
        prev.map((event) =>
          String(event.id) === String(id)
            ? { ...event, status: nextStatus }
            : event,
        ),
      );

      toast.success(`Event ${nextStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Failed to update event status:", error);
      toast.error("Failed to update event status");
    } finally {
      setUpdatingEventId(null);
    }
  };

  const getNormalizedStatus = (event: any) =>
    String(event?.status || "PUBLISHED").toUpperCase();

  const organizers = Array.from(
    new Set(
      events
        .map((event) =>
          String(event?.organizer || event?.organizerName || "").trim(),
        )
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredEvents = events.filter((event) => {
    const title = String(event?.title || "").toLowerCase();
    const organizer = String(
      event?.organizer || event?.organizerName || "",
    ).trim();
    const organizerLower = organizer.toLowerCase();
    const normalizedStatus = getNormalizedStatus(event);

    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      organizerLower.includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" || normalizedStatus === selectedStatus;
    const matchesOrganizer =
      selectedOrganizer === "ALL" || organizer === selectedOrganizer;

    return matchesSearch && matchesStatus && matchesOrganizer;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentRole = session?.user?.role?.toLowerCase();
  const normalizedRole = currentRole === "super_admin" ? "admin" : currentRole;

  if (normalizedRole !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You are not authorized to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage all events currently on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedStatus("ALL");
              setSelectedOrganizer("ALL");
              setSearchTerm("");
            }}
          >
            <Filter className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Events</CardTitle>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedOrganizer}
                onValueChange={(value) => setSelectedOrganizer(value)}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Filter by organizer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Organizers</SelectItem>
                  {organizers.map((organizer) => (
                    <SelectItem key={organizer} value={organizer}>
                      {organizer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const normalizedStatus = getNormalizedStatus(event);
                const canPublish = normalizedStatus === "DRAFT";
                const canCancel =
                  normalizedStatus === "DRAFT" ||
                  normalizedStatus === "PUBLISHED";

                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {event.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>
                          {event.startDatetime
                            ? new Date(event.startDatetime).toLocaleDateString()
                            : (event as any).date}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.startDatetime
                            ? new Date(event.startDatetime).toLocaleTimeString()
                            : (event as any).time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.ticketsSold ?? 0} /{" "}
                      {event.capacity ?? event.totalCapacity ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {normalizedStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {canPublish && (
                            <DropdownMenuItem
                              disabled={updatingEventId === event.id}
                              onClick={() =>
                                handleStatusChange(event.id, "PUBLISHED")
                              }
                            >
                              Publish Event
                            </DropdownMenuItem>
                          )}
                          {canCancel && (
                            <DropdownMenuItem
                              className="text-red-600"
                              disabled={updatingEventId === event.id}
                              onClick={() =>
                                handleStatusChange(event.id, "CANCELLED")
                              }
                            >
                              Cancel Event
                            </DropdownMenuItem>
                          )}
                          {!canPublish && !canCancel && (
                            <DropdownMenuItem disabled>
                              No status actions
                            </DropdownMenuItem>
                          )}
                          {(canPublish || canCancel) && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem disabled>
                            Event ID: {event.id}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
