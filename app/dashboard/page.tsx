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
import { ShieldCheck, UserCircle } from "lucide-react";

type DashboardStats = {
  totalEvents: number;
  totalRevenue: number;
  totalTickets: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [adminStats, setAdminStats] = useState<any>(null);
  const [organizerData, setOrganizerData] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<DashboardUserDetails | null>(
    null,
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    let role = session.user.role?.toLowerCase() || "user";
    if (role === "super_admin") role = "admin";

    if (role === "user") router.replace("/");
  }, [session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        setError(null);

        let role = session.user.role?.toLowerCase() || "user";
        if (role === "super_admin") role = "admin";

        const userId = session.user.id;

        // USER DETAILS
        const res = await axios.get(`/api/users/getbyuid?id=${userId}`);
        const user = res.data?.data ?? res.data;
        setUserDetails(user);

        // ORGANIZER
        if (role === "organizer") {
          const events = await getEventsByOrganizerId(
            user?.organizerId || userId,
          );
          const normalized = Array.isArray(events)
            ? events
            : events && typeof events === "object" && "data" in events
              ? (events as { data: any }).data
              : [];

          setOrganizerData(normalized);

          setStats({
            totalEvents: normalized.length,
            totalRevenue: 0,
            totalTickets: 0,
          });
        }

        // ADMIN
        if (role === "admin") {
          const adminData = await getAdminStats();
          setAdminStats(adminData);

          const s =
            (adminData?.events &&
            typeof adminData.events === "object" &&
            "data" in adminData.events
              ? (adminData.events as { data?: any }).data
              : adminData?.events) || {};

          setStats({
            totalEvents: Number(s?.totalEvents || 0),
            totalRevenue: Number(s?.totalRevenue || 0),
            totalTickets: Number(s?.totalTickets || 0),
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
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

  const adminUsers = adminStats?.users?.data || adminStats?.users || [];
  const adminEvents = adminStats?.events?.data || adminStats?.events || [];
  const organizerEvents = organizerData;

  return (
    <div className="space-y-10">
      {/* HEADER (MATCHED WITH USERS + EVENTS) */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 border-b border-white/[0.04] pb-10">
        <div className="space-y-2">
          <p className="text-[11px] text-white/25">Dashboard</p>

          <h1 className="text-2xl font-light text-white tracking-tight">
            Welcome back
          </h1>

          <div className="flex items-center gap-2">
            {role === "admin" ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <UserCircle className="w-3.5 h-3.5 text-blue-400/70" />
            )}

            <span className="text-[12px] text-white/30">
              {role === "admin" ? "Administrator" : session.user.name}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-white/20 font-mono hidden md:block">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <ErrorFallback
          title="Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <LoadingState />
          <p className="text-[11px] text-white/20 animate-pulse">
            Loading dashboard…
          </p>
        </div>
      ) : (
        /* CONTENT */
        <div className="space-y-10">
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
        </div>
      )}
    </div>
  );
}
