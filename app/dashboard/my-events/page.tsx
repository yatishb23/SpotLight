"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Ticket,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

export default function MyEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (session?.user?.id) {
        // In mock, organizerId is userId
        try {
          setIsLoading(true);
          // Assuming the mock data uses 'org1' or similar for organizer ID
          // For now, let's fetch all events and filter by 'organizerId' locally or trust the api mock
          const data = await apiClient.getOrganizerEvents(session.user.id);
          const normalizedEvents = Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.events)
              ? (data as any).events
              : Array.isArray((data as any)?.data)
                ? (data as any).data
                : [];
          setEvents(normalizedEvents);
        } catch (error) {
          console.error("Failed to fetch events:", error);
          toast.error("Failed to load your events");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (
      session?.user?.role === "organizer" ||
      session?.user?.role === "admin"
    ) {
      fetchEvents();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    // Logic to delete event
    toast.info("Delete functionality would go here");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past events.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create-event">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No events created</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any events yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/create-event">
                Create Your First Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full">
                <Image
                  src={event.image || "/placeholder-event.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(
                    new Date(
                      event.startDatetime || (event as any).date || new Date(),
                    ),
                    "PPP",
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Capacity
                  </span>
                  <span>{event.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Ticket className="h-3 w-3" /> Tickets Sold
                  </span>
                  <span>{event.ticketsSold}</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${(event.ticketsSold / event.capacity) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 border-t pt-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/events/${event.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
