"use client";

import { useState, useEffect } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import type { DashboardUserDetails } from "@/lib/types";
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserCircle } from "lucide-react";

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

  // ✅ Redirect normal users
  useEffect(() => {
    if (!session) return;

    let role = session.user.role?.toLowerCase() || "user";
    if (role === "super_admin") role = "admin";

    if (role === "user") {
      router.replace("/");
    }
  }, [session, router]);

  // ✅ Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        setError(null);

        let role = session.user.role?.toLowerCase() || "user";
        if (role === "super_admin") role = "admin";

        const userId = session.user.id;

        if (role === "admin") {
          const [userResponse, adminData] = (await Promise.all([
            apiClient.getUserByUid(userId),
            apiClient.getAdminStats(),
          ])) as [any, any];

          const normalizedUserDetails =
            userResponse.data?.data ??
            userResponse.data?.user ??
            userResponse.data;
          setUserDetails(normalizedUserDetails ?? null);

          setAdminStats(adminData);

          const statsSource = adminData?.events?.data ?? adminData?.events;

          setStats({
            totalEvents: Number(statsSource?.totalEvents ?? statsSource?.eventsCount ?? 0),
            totalRevenue: Number(statsSource?.totalRevenue ?? statsSource?.revenue ?? 0),
            totalTickets: Number(statsSource?.totalTickets ?? statsSource?.ticketsSold ?? 0),
          });
          return;
        }

        const userResponse = (await apiClient.getUserByUid(userId)) as any;
        const normalizedUserDetails =
          userResponse.data?.data ??
          userResponse.data?.user ??
          userResponse.data;

        setUserDetails(normalizedUserDetails ?? null);

        if (role === "organizer") {
          const eventsData = (await apiClient.getOrganizerEvents(
            normalizedUserDetails?.organizerId || userId,
          )) as any;

          setOrganizerData(eventsData);

          const organizerEvents = Array.isArray(eventsData)
            ? eventsData
            : Array.isArray(eventsData?.events)
              ? eventsData.events
              : Array.isArray(eventsData?.data)
                ? eventsData.data
                : [];

          setStats({
            totalEvents: organizerEvents.length,
            totalRevenue: 0,
            totalTickets: 0,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (!session) return <LoadingState />;

  let role = session.user.role?.toLowerCase() || "user";
  if (role === "super_admin") role = "admin";
  if (role === "user") return <LoadingState />;

  // ✅ Normalizing data for components
  const adminUsers = Array.isArray(adminStats?.users) ? adminStats.users : adminStats?.users?.data || [];
  const adminEvents = Array.isArray(adminStats?.events) ? adminStats.events : adminStats?.events?.events || adminStats?.events?.data || [];
  const organizerEvents = Array.isArray(organizerData) ? organizerData : organizerData?.events || organizerData?.data || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Control Center</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 text-neutral-400">
              {role === "admin" ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <UserCircle className="w-4 h-4 text-blue-500" />
              )}
              <p className="text-sm font-medium">
                {role === "admin" ? "System Administration Mode" : `Organizer Portal: ${session.user.name}`}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block">
             <div className="px-4 py-2 rounded-full bg-neutral-900/50 border border-neutral-800 text-xs font-mono text-neutral-500">
                Last Updated: {new Date().toLocaleTimeString()}
             </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="relative">
          {error && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <ErrorFallback
                title="System Interruption"
                message={error}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <LoadingState />
               <p className="text-neutral-500 animate-pulse text-sm">Synchronizing your data...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
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
                <div className="text-center py-20 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-3xl">
                  <p className="text-neutral-500 italic">Unknown access level detected: {role}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}