"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import { apiClient, getBookingsByEvent } from "../../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventAnalytics } from "@/lib/types";

const LIVE_REFRESH_INTERVAL_MS = 30000;
const AGGREGATED_EVENT_ID = "ALL_EVENTS";

export default function AnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [allAnalytics, setAllAnalytics] = useState<EventAnalytics[]>([]);
  const [selectedEventId, setSelectedEventId] =
    useState<string>(AGGREGATED_EVENT_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!session?.user?.id) {
      setError("You need to be logged in to view analytics.");
      setIsLoading(false);
      return;
    }

    const normalizeArrayPayload = (response: any): any[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.events)) return response.events;
      if (Array.isArray(response?.bookings)) return response.bookings;
      return [];
    };

    const buildWeeklyData = (bookings: any[]) => {
      const days: {
        key: string;
        day: string;
        tickets: number;
        revenue: number;
      }[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const key = date.toISOString().slice(0, 10);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        days.push({ key, day, tickets: 0, revenue: 0 });
      }

      const dayMap = new Map(days.map((d) => [d.key, d]));

      bookings.forEach((booking: any) => {
        const createdAt = booking?.createdAt
          ? new Date(booking.createdAt)
          : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return;

        const key = createdAt.toISOString().slice(0, 10);
        const bucket = dayMap.get(key);
        if (!bucket) return;

        bucket.tickets += Number(booking?.quantity || 0);
        bucket.revenue += Number(
          booking?.totalAmount || booking?.totalPrice || 0,
        );
      });

      return days.map(({ day, tickets, revenue }) => ({
        day,
        tickets,
        revenue,
      }));
    };

    const fetchAnalytics = async (showLoader = false) => {
      try {
        if (showLoader) {
          setIsLoading(true);
        }
        setError(null);

        const eventsResponse = await apiClient.getOrganizerEvents(
          session.user.id,
        );
        const organizerEvents = normalizeArrayPayload(eventsResponse);

        const eventAnalyticsList = await Promise.all(
          organizerEvents.map(async (event: any) => {
            const bookingResponse = await getBookingsByEvent(String(event.id));
            const eventBookings = normalizeArrayPayload(bookingResponse);

            const soldTicketsFromBookings = eventBookings.reduce(
              (sum: number, booking: any) =>
                sum + Number(booking?.quantity || 0),
              0,
            );

            const soldTicketsFallback = Number(event?.ticketsSold || 0);
            const soldTickets =
              soldTicketsFromBookings > 0
                ? soldTicketsFromBookings
                : soldTicketsFallback;

            const totalRevenue = eventBookings.reduce(
              (sum: number, booking: any) =>
                sum + Number(booking?.totalAmount || booking?.totalPrice || 0),
              0,
            );

            return {
              eventId: String(event.id),
              eventTitle: String(event.title || "Untitled Event"),
              totalTickets: Number(
                event?.totalCapacity ?? event?.capacity ?? 0,
              ),
              soldTickets,
              totalRevenue,
              weeklyData: buildWeeklyData(eventBookings),
            } as EventAnalytics;
          }),
        );

        const allEventsAnalytics: EventAnalytics = {
          eventId: AGGREGATED_EVENT_ID,
          eventTitle: "All Events",
          totalTickets: eventAnalyticsList.reduce(
            (sum, item) => sum + Number(item.totalTickets || 0),
            0,
          ),
          soldTickets: eventAnalyticsList.reduce(
            (sum, item) => sum + Number(item.soldTickets || 0),
            0,
          ),
          totalRevenue: eventAnalyticsList.reduce(
            (sum, item) => sum + Number(item.totalRevenue || 0),
            0,
          ),
          weeklyData: (() => {
            const initial = [
              { day: "Mon", tickets: 0, revenue: 0 },
              { day: "Tue", tickets: 0, revenue: 0 },
              { day: "Wed", tickets: 0, revenue: 0 },
              { day: "Thu", tickets: 0, revenue: 0 },
              { day: "Fri", tickets: 0, revenue: 0 },
              { day: "Sat", tickets: 0, revenue: 0 },
              { day: "Sun", tickets: 0, revenue: 0 },
            ];

            const map = new Map(initial.map((point) => [point.day, point]));
            eventAnalyticsList.forEach((item) => {
              item.weeklyData.forEach((point) => {
                const slot = map.get(point.day);
                if (!slot) return;
                slot.tickets += Number(point.tickets || 0);
                slot.revenue += Number(point.revenue || 0);
              });
            });

            return initial;
          })(),
        };

        const nextAnalytics = [allEventsAnalytics, ...eventAnalyticsList];
        setAllAnalytics(nextAnalytics);

        const activeEventId = nextAnalytics.some(
          (item) => item.eventId === selectedEventId,
        )
          ? selectedEventId
          : AGGREGATED_EVENT_ID;

        setSelectedEventId(activeEventId);
        setAnalytics(
          nextAnalytics.find((item) => item.eventId === activeEventId) ||
            nextAnalytics[0] ||
            null,
        );
        setLastUpdatedAt(new Date());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
        console.error("Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics(true);

    const intervalId = setInterval(() => {
      fetchAnalytics(false);
    }, LIVE_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [session?.user?.id, sessionStatus, selectedEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = allAnalytics.find((a) => a.eventId === eventId);
    if (event) {
      setAnalytics(event);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track ticket sales and revenue for your events in real time
        </p>
        {lastUpdatedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdatedAt.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <ErrorFallback
          title="Failed to load analytics"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {isLoading ? (
        <div className="space-y-6">
          <LoadingState count={2} type="chart" />
        </div>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm">Select Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEventId} onValueChange={handleEventChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allAnalytics.map((event) => (
                    <SelectItem key={event.eventId} value={event.eventId}>
                      {event.eventTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {analytics && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Capacity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {analytics.totalTickets}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      seats available
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tickets Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {analytics.soldTickets}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(
                        (analytics.soldTickets / analytics.totalTickets) * 100,
                      )}
                      % sold
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatINR(analytics.totalRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      from ticket sales
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsChart
                  title="Sales Over Time"
                  description="Weekly ticket sales and revenue"
                  data={analytics.weeklyData}
                  type="line"
                />

                <AnalyticsChart
                  title="Revenue Distribution"
                  description="Weekly revenue breakdown"
                  data={analytics.weeklyData}
                  type="bar"
                />
              </div>

              {/* Additional Insights */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    Performance metrics for your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Average Price per Ticket
                      </p>
                      <p className="text-2xl font-bold">
                        {formatINR(
                          analytics.totalRevenue > 0 &&
                            analytics.soldTickets > 0
                            ? analytics.totalRevenue / analytics.soldTickets
                            : 0,
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Remaining Tickets</p>
                      <p className="text-2xl font-bold">
                        {analytics.totalTickets - analytics.soldTickets}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-secondary rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>
                        •{" "}
                        {analytics.soldTickets < analytics.totalTickets * 0.5
                          ? "Consider promoting your event to increase ticket sales"
                          : "Great job! Your event is gaining traction"}
                      </li>
                      <li>
                        • Monitor daily sales patterns to optimize marketing
                        efforts
                      </li>
                      <li>
                        • Engage with attendees to build anticipation for the
                        event
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
