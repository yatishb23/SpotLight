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
import { apiClient, getBookingsByEvent, getEvents, getEventsByOrganizerId } from "../../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventAnalytics } from "@/lib/types";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  RefreshCcw, 
  BarChart3, 
  Zap,
  Info
} from "lucide-react";

const LIVE_REFRESH_INTERVAL_MS = 30000;
const AGGREGATED_EVENT_ID = "ALL_EVENTS";

export default function AnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [allAnalytics, setAllAnalytics] = useState<EventAnalytics[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(AGGREGATED_EVENT_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0, // Cleaner look for dashboards
    }).format(Number(amount || 0));

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session?.user?.id) {
      setError("Authorization required to access intelligence data.");
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
      const days: { key: string; day: string; tickets: number; revenue: number; }[] = [];
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
        const createdAt = booking?.createdAt ? new Date(booking.createdAt) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return;
        const key = createdAt.toISOString().slice(0, 10);
        const bucket = dayMap.get(key);
        if (!bucket) return;
        bucket.tickets += Number(booking?.quantity || 0);
        bucket.revenue += Number(booking?.totalAmount || booking?.totalPrice || 0);
      });
      return days.map(({ day, tickets, revenue }) => ({ day, tickets, revenue }));
    };

    const fetchAnalytics = async (showLoader = false) => {
      try {
        if (showLoader) setIsLoading(true);
        setError(null);

        let eventsResponse;
        if (session?.user?.role?.toLowerCase() === "organizer") {
          eventsResponse = await getEventsByOrganizerId(session.user.id);
        } else {
          eventsResponse = await getEvents();
        }
        const organizerEvents = normalizeArrayPayload(eventsResponse);

        const eventAnalyticsList = await Promise.all(
          organizerEvents.map(async (event: any) => {
            const bookingResponse = await getBookingsByEvent(String(event.id));
            const eventBookings = normalizeArrayPayload(bookingResponse);
            const soldTicketsFromBookings = eventBookings.reduce((sum: number, b: any) => sum + Number(b?.quantity || 0), 0);
            const soldTickets = soldTicketsFromBookings > 0 ? soldTicketsFromBookings : Number(event?.ticketsSold || 0);
            const totalRevenue = eventBookings.reduce((sum: number, b: any) => sum + Number(b?.totalAmount || b?.totalPrice || 0), 0);

            return {
              eventId: String(event.id),
              eventTitle: String(event.title || "Untitled Event"),
              totalTickets: Number(event?.totalCapacity ?? event?.capacity ?? 0),
              soldTickets,
              totalRevenue,
              weeklyData: buildWeeklyData(eventBookings),
            } as EventAnalytics;
          })
        );

        const allEventsAnalytics: EventAnalytics = {
          eventId: AGGREGATED_EVENT_ID,
          eventTitle: "Universal View (All Events)",
          totalTickets: eventAnalyticsList.reduce((sum, item) => sum + Number(item.totalTickets || 0), 0),
          soldTickets: eventAnalyticsList.reduce((sum, item) => sum + Number(item.soldTickets || 0), 0),
          totalRevenue: eventAnalyticsList.reduce((sum, item) => sum + Number(item.totalRevenue || 0), 0),
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
                if (slot) {
                  slot.tickets += Number(point.tickets || 0);
                  slot.revenue += Number(point.revenue || 0);
                }
              });
            });
            return initial;
          })(),
        };

        const nextAnalytics = [allEventsAnalytics, ...eventAnalyticsList];
        setAllAnalytics(nextAnalytics);

        const activeEventId = nextAnalytics.some((item) => item.eventId === selectedEventId) 
          ? selectedEventId 
          : AGGREGATED_EVENT_ID;

        setSelectedEventId(activeEventId);
        setAnalytics(nextAnalytics.find((item) => item.eventId === activeEventId) || nextAnalytics[0] || null);
        setLastUpdatedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics(true);
    const intervalId = setInterval(() => fetchAnalytics(false), LIVE_REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [session?.user?.id, sessionStatus, selectedEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = allAnalytics.find((a) => a.eventId === eventId);
    if (event) setAnalytics(event);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
          <div>
            <div className="flex items-center gap-2 text-neutral-500 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Analytics Engine v2.0</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Intelligence</h1>
            <p className="text-neutral-500 text-sm max-w-md font-light leading-relaxed">
              Real-time synchronization with global booking streams. Monitoring sales velocity and revenue distribution.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-[280px] bg-neutral-900 border-neutral-800 text-neutral-300 focus:ring-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-300">
                {allAnalytics.map((event) => (
                  <SelectItem key={event.eventId} value={event.eventId} className="focus:bg-neutral-800 focus:text-white">
                    {event.eventTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lastUpdatedAt && (
              <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono uppercase tracking-wider">
                <RefreshCcw className="w-3 h-3 animate-spin-slow" />
                Live Sync: {lastUpdatedAt.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ErrorFallback title="System Interruption" message={error} onRetry={() => window.location.reload()} />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />)}
            </div>
            <div className="h-[400px] bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800" />
          </div>
        ) : (
          analytics && (
            <div className="animate-in fade-in duration-700 space-y-8">
              
              {/* Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  label="Total Capacity" 
                  value={analytics.totalTickets} 
                  sub="Available Inventory" 
                  icon={<Users className="w-4 h-4 text-neutral-500" />} 
                />
                <MetricCard 
                  label="Tickets Sold" 
                  value={analytics.soldTickets} 
                  sub={`${Math.round((analytics.soldTickets / analytics.totalTickets) * 100)}% Conversion Rate`} 
                  icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} 
                  trend={Math.round((analytics.soldTickets / analytics.totalTickets) * 100)}
                />
                <MetricCard 
                  label="Net Revenue" 
                  value={formatINR(analytics.totalRevenue)} 
                  sub="Gross Sales Volume" 
                  icon={<CreditCard className="w-4 h-4 text-neutral-500" />} 
                />
              </div>

              {/* Visualization Layer */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <AnalyticsChart
                    title="Sales Velocity"
                    description="Weekly ticket throughput"
                    data={analytics.weeklyData}
                    type="line"
                  />
                </div>
                <div className="lg:col-span-2">
                  <AnalyticsChart
                    title="Revenue Density"
                    description="Distribution by weekday"
                    data={analytics.weeklyData}
                    type="bar"
                  />
                </div>
              </div>

              {/* Intelligence Layer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-neutral-950 border-neutral-900">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Performance Insights</CardTitle>
                      <CardDescription className="text-neutral-500">Heuristic analysis of current event trajectory</CardDescription>
                    </div>
                    <Zap className="w-5 h-5 text-neutral-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">AOV (Avg. Order Value)</p>
                        <p className="text-3xl font-light text-white italic">
                          {formatINR(analytics.totalRevenue > 0 && analytics.soldTickets > 0 ? analytics.totalRevenue / analytics.soldTickets : 0)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Unfilled Inventory</p>
                        <p className="text-3xl font-light text-white italic">
                          {analytics.totalTickets - analytics.soldTickets}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                      <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed text-neutral-400">
                        <strong className="text-neutral-200 block mb-1">Strategic Recommendation:</strong>
                        {analytics.soldTickets < analytics.totalTickets * 0.5
                          ? "Current velocity indicates potential under-fill. Recommendation: Deploy remarketing campaigns or dynamic pricing tiers to accelerate remaining 50% inventory."
                          : "Inventory is moving at optimal velocity. Recommendation: Shift focus to pre-event engagement and upsell opportunities for existing ticket holders."}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                   <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                      <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Marketing Health</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">Inventory Clearance</span>
                          <span className="text-white">{Math.round((analytics.soldTickets / analytics.totalTickets) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-1000" 
                            style={{ width: `${(analytics.soldTickets / analytics.totalTickets) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed italic border-t border-neutral-800 pt-4">
                        Data is aggregated across all selected ticket categories and promotional channels.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Minimalist Metric Component
function MetricCard({ label, value, sub, icon, trend }: any) {
  return (
    <Card className="bg-neutral-950 border-neutral-900 hover:border-neutral-800 transition-colors">
      <CardContent className="pt-6 pb-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">{label}</p>
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">{value}</h2>
        </div>
        <p className="text-xs text-neutral-600 mt-2 font-light italic">{sub}</p>
      </CardContent>
    </Card>
  );
}