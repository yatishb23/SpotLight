"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { ErrorFallback } from "@/components/error-fallback";
import {
  getBookingsByEvent,
  getEvents,
  getEventsByOrganizerId,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  TrendingUp,
  Users,
  CreditCard,
  RefreshCcw,
  Zap,
  Info,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const AGGREGATED_EVENT_ID = "ALL_EVENTS";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  const [analytics, setAnalytics] = useState<any>(null);
  const [allAnalytics, setAllAnalytics] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(AGGREGATED_EVENT_ID);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const normalizeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.events)) return res.events;
    if (Array.isArray(res?.bookings)) return res.bookings;
    return [];
  };

  const buildWeekly = (bookings: any[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map: any = {};

    days.forEach((d) => (map[d] = { day: d, tickets: 0, revenue: 0 }));

    bookings.forEach((b) => {
      const d = new Date(b.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (!map[d]) return;

      map[d].tickets += Number(b.quantity || 0);
      map[d].revenue += Number(b.totalAmount || 0);
    });

    return Object.values(map);
  };

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let eventsRes;

        if (session?.user?.role === "organizer") {
          eventsRes = await getEventsByOrganizerId(session.user.id);
        } else {
          eventsRes = await getEvents();
        }

        const events = normalizeArray(eventsRes);

        const analyticsList = await Promise.all(
          events.map(async (event: any) => {
            const bookingsRes = await getBookingsByEvent(event.id);
            const bookings = normalizeArray(bookingsRes);

            const sold = bookings.reduce(
              (s, b) => s + Number(b.quantity || 0),
              0,
            );

            const revenue = bookings.reduce(
              (s, b) => s + Number(b.totalAmount || 0),
              0,
            );

            return {
              eventId: String(event.id),
              eventTitle: event.title || "Untitled",
              totalTickets: Number(event.totalCapacity || event.capacity || 0),
              soldTickets: sold,
              totalRevenue: revenue,
              weeklyData: buildWeekly(bookings),
            };
          }),
        );

        const aggregate = {
          eventId: AGGREGATED_EVENT_ID,
          eventTitle: "All Events",
          totalTickets: analyticsList.reduce((s, e) => s + e.totalTickets, 0),
          soldTickets: analyticsList.reduce((s, e) => s + e.soldTickets, 0),
          totalRevenue: analyticsList.reduce((s, e) => s + e.totalRevenue, 0),
          weeklyData: buildWeekly([]),
        };

        const finalData = [aggregate, ...analyticsList];

        setAllAnalytics(finalData);

        const selected =
          finalData.find((a) => a.eventId === selectedEventId) || finalData[0];

        setSelectedEventId(selected.eventId);
        setAnalytics(selected);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const handleChange = (id: string) => {
    setSelectedEventId(id);
    const found = allAnalytics.find((a) => a.eventId === id);
    if (found) setAnalytics(found);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorFallback title="Error" message={error} />
      </div>
    );
  }

  const percent =
    analytics?.totalTickets > 0
      ? Math.round((analytics.soldTickets / analytics.totalTickets) * 100)
      : 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-white/[0.04]">
        <div>
          <Link
            href="/dashboard"
            className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-4xl text-white font-medium mt-2">Intelligence</h1>
          <p className="text-sm text-neutral-500 font-light">
            Real-time analytics of event performance
          </p>
        </div>

        <Select value={selectedEventId} onValueChange={handleChange}>
          <SelectTrigger className="w-[260px] bg-[#050505] border-white/[0.04]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#050505] border-white/[0.04]">
            {allAnalytics.map((e) => (
              <SelectItem key={e.eventId} value={e.eventId}>
                {e.eventTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricCard
          label="Capacity"
          value={analytics.totalTickets}
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          label="Sold"
          value={analytics.soldTickets}
          sub={`${percent}% filled`}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="Revenue"
          value={formatINR(analytics.totalRevenue)}
          icon={<CreditCard className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Ticket Flow"
          description="Weekly bookings"
          data={analytics.weeklyData}
          type="line"
        />
        <AnalyticsChart
          title="Revenue Flow"
          description="Weekly revenue"
          data={analytics.weeklyData}
          type="bar"
        />
      </div>

      {/* Insight */}
      <Card className="bg-white/[0.02] border-white/[0.04]">
        <CardHeader>
          <CardTitle>Insight</CardTitle>
          <CardDescription>AI-driven suggestion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 text-sm text-neutral-400">
            <Info className="w-4 h-4 mt-1" />
            {percent < 50
              ? "Low sales detected. Consider marketing push."
              : "Sales performing well. Focus on engagement."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: any) {
  return (
    <Card className="bg-white/[0.02] border-white/[0.04]">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-3">
          <p className="text-xs text-neutral-500 uppercase">{label}</p>
          {icon}
        </div>
        <h2 className="text-2xl text-white">{value}</h2>
        {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
