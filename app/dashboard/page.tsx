"use client";

import { useState, useEffect } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorFallback } from "@/components/error-fallback";
import type { DashboardUserDetails } from "@/lib/types";
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  getEventsByOrganizerId,
  getAdminStats,
} from "@/lib/api";
import { useRouter } from "next/navigation";

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

        } else if (role === "admin") {
          const adminData = await getAdminStats();
          setAdminStats(adminData);

          const statsSource = adminData?.events?.data ?? adminData?.events;

          setStats({
            totalEvents: Number(
              statsSource?.totalEvents ?? statsSource?.eventsCount ?? 0
            ),
            totalRevenue: Number(
              statsSource?.totalRevenue ?? statsSource?.revenue ?? 0
            ),
            totalTickets: Number(
              statsSource?.totalTickets ?? statsSource?.ticketsSold ?? 0
            ),
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data"
        );
        console.error("Error fetching dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  // ✅ Prevent flicker / unauthorized access
  if (!session) {
    return <LoadingState />;
  }

  let role = session.user.role?.toLowerCase() || "user";
  if (role === "super_admin") role = "admin";

  if (role === "user") {
    return <LoadingState />;
  }

  // ✅ Normalize data
  const adminUsers = Array.isArray(adminStats?.users)
    ? adminStats.users
    : Array.isArray(adminStats?.users?.data)
    ? adminStats.users.data
    : [];

  const adminEvents = Array.isArray(adminStats?.events)
    ? adminStats.events
    : Array.isArray(adminStats?.events?.events)
    ? adminStats.events.events
    : Array.isArray(adminStats?.events?.data)
    ? adminStats.events.data
    : [];

  const organizerEvents = Array.isArray(organizerData)
    ? organizerData
    : Array.isArray(organizerData?.events)
    ? organizerData.events
    : Array.isArray(organizerData?.data)
    ? organizerData.data
    : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {role === "admin"
            ? "System Administration"
            : "Organizer Portal"}
        </p>
      </div>

      {error && (
        <ErrorFallback
          title="Failed to load dashboard"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
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
            <div className="text-center py-12">
              <p>Unknown role: {role}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}