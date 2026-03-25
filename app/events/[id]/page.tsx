"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { EventBanner } from "@/components/event-banner";
import { TicketForm } from "@/components/ticket-form";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { Share2, MapPin, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [organizer, setOrganizer] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

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
        }

        const organizerData = normalizedEvent?.organizerId
          ? await apiClient.getUserById(String(normalizedEvent.organizerId))
          : null;

        const normalizedOrganizer =
          (organizerData as any)?.data ?? organizerData ?? null;

        setEvent(normalizedEvent);
        setOrganizer(
          (normalizedOrganizer as any)?.fullName ||
            (normalizedOrganizer as any)?.name ||
            "Organizer",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        console.error("[v0] Error fetching event:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <LoadingState count={1} type="chart" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="outline" className="mb-6">
              ← Back to Events
            </Button>
          </Link>
          <ErrorFallback
            title="Event not found"
            message={error || "This event could not be loaded."}
            onRetry={() => window.location.reload()}
          />
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
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Events
          </Link>
          <span className="text-sm text-muted-foreground mx-2">/</span>
          <span className="text-sm font-medium">{event.title}</span>
        </div>
      </div>

      {/* Event Banner */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EventBanner
          event={event}
          onBookClick={() => {
            const element = document.getElementById("booking-section");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      {/* Event Details and Booking */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          event.startDatetime ||
                            (event as any).date ||
                            new Date(),
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          event.startDatetime ||
                            (event as any).date ||
                            new Date(),
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venueName || (event as any).location},{" "}
                        {event.city || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {event.availableCapacity} of {event.totalCapacity}{" "}
                        available
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Organizer</p>
                    <Badge variant="secondary">{organizer}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div
            id="booking-section"
            className="lg:sticky lg:top-24 lg:h-fit space-y-4"
          >
            <Card className="border-primary shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Tickets</span>
                  <Badge
                    variant="secondary"
                    className="text-primary bg-primary/10"
                  >
                    Selling Fast
                  </Badge>
                </CardTitle>
                <CardDescription>Select your preferred seats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Starting from</span>
                  <span className="font-bold text-xl">
                    {formatINR(event.ticketPrice)}
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>VIP</span>
                    <span className="font-medium">{formatINR(100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold</span>
                    <span className="font-medium">{formatINR(75)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver</span>
                    <span className="font-medium">{formatINR(50)}</span>
                  </div>
                </div>

                <Link href={bookSeatHref}>
                  <Button
                    size="lg"
                    className="w-full font-bold text-md shadow-md hover:shadow-lg transition-all"
                  >
                    Book Seats
                  </Button>
                </Link>

                <p className="text-center text-xs text-muted-foreground">
                  {event.availableCapacity} seats remaining
                </p>
              </CardContent>
            </Card>

            {/* Share Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const text = `Check out ${event.title} on EventHub! ${window.location.href}`;
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(text);
                  toast.success("Event link copied!");
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
