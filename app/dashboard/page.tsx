"use client";

import { useState, useEffect } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import type { DashboardUserDetails } from "@/lib/types";
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getEventsByOrganizerId, getAdminStats } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserCircle, Activity } from "lucide-react";

type DashboardStats = {
  totalEvents: number;
  totalRevenue: number;
  totalTickets: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [adminStats, setAdminStats] = useState<{
    events: any;
    users: any;
  } | null>(null);

  const [organizerData, setOrganizerData] = useState<any>([]);
  const [userDetails, setUserDetails] = useState<DashboardUserDetails | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Redirect Logic
  useEffect(() => {
    if (!session) return;
    let role = session.user.role?.toLowerCase() || "user";
    if (role === "super_admin") role = "admin";
    if (role === "user") router.replace("/");
  }, [session, router]);

  // ✅ Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        setError(null);

        let role = session.user.role?.toLowerCase() || "user";
        if (role === "super_admin") role = "admin";

        const userId = session.user.id;
        const userResponse = await axios.get(
          `/api/users/getbyuid?id=${encodeURIComponent(userId)}`
        );

        const normalizedUserDetails =
          userResponse.data?.data ??
          userResponse.data?.user ??
          userResponse.data;

        setUserDetails(normalizedUserDetails ?? null);

        if (role === "organizer") {
          const eventsData = await getEventsByOrganizerId(
            normalizedUserDetails?.organizerId || userId
          );
          setOrganizerData(eventsData);
          const organizerEvents = Array.isArray(eventsData)
            ? eventsData
            : (typeof eventsData === "object" && eventsData !== null && "events" in eventsData && Array.isArray((eventsData as any).events))
            ? (eventsData as any).events
            : Array.isArray((eventsData as any)?.data)
            ? (eventsData as any).data
            : [];

          setStats({
            totalEvents: organizerEvents.length,
            totalRevenue: 0,
            totalTickets: 0,
          });
        } else if (role === "admin") {
          const adminData = await getAdminStats();
          setAdminStats(adminData);
          const events = adminData?.events;
          const statsSource =
            events && typeof events === "object" && "data" in events
              ? (events as any).data
              : events;
          setStats({
            totalEvents: Number(statsSource?.totalEvents ?? statsSource?.eventsCount ?? 0),
            totalRevenue: Number(statsSource?.totalRevenue ?? statsSource?.revenue ?? 0),
            totalTickets: Number(statsSource?.totalTickets ?? statsSource?.ticketsSold ?? 0),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchData();
  }, [session]);

  if (!session) return <LoadingState />;

  let role = session.user.role?.toLowerCase() || "user";
  if (role === "super_admin") role = "admin";
  if (role === "user") return <LoadingState />;

  // ✅ Normalization
  const adminUsers = Array.isArray(adminStats?.users) ? adminStats.users : adminStats?.users?.data || [];
  const adminEvents = Array.isArray(adminStats?.events) ? adminStats.events : adminStats?.events?.events || adminStats?.events?.data || [];
  const organizerEvents = Array.isArray(organizerData) ? organizerData : organizerData?.events || organizerData?.data || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-neutral-800">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Minimalist Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-900 pb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                System Status: Operational
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-4xl font-medium tracking-tight text-white">
                Dashboard
              </h1>
              <div className="flex items-center gap-2 text-neutral-500">
                {role === "admin" ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
                ) : (
                  <UserCircle className="w-4 h-4 text-blue-500/80" />
                )}
                <p className="text-sm font-light">
                  {role === "admin" ? "Internal Administrator Access" : `Management Portal — ${session.user.name}`}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-1">Last Updated</p>
            <p className="text-sm font-mono text-neutral-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </header>

        {/* Content Section */}
        <main className="relative">
          {error && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <ErrorFallback
                title="Interface Interruption"
                message={error}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <LoadingState />
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 animate-pulse">Synchronizing Data</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {role === "organizer" && (
                <OrganizerDashboard
                  stats={stats}
                  events={organizerEvents}
                  userDetails={userDetails}
                />
              )}

              {role === "admin" && (
                <AdminDashboard
                  stats={stats}
                  users={adminUsers}
                  events={adminEvents}
                  userDetails={userDetails}
                />
              )}

              {!["organizer", "admin"].includes(role) && (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-neutral-800">
                  <p className="text-neutral-500 italic">Unidentified access level: {role}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}