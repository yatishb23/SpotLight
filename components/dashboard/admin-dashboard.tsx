"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventList } from "@/components/event-list";
import { BarChart3, Users, Wallet, Calendar } from "lucide-react";
import type { DashboardUserDetails, Event } from "@/lib/types";

interface AdminDashboardProps {
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTickets: number;
  } | null;
  users: any[];
  events: Event[];
  userDetails: DashboardUserDetails | null;
}

export function AdminDashboard({
  stats,
  users,
  events,
  userDetails,
}: AdminDashboardProps) {
  const displayName = userDetails?.name?.trim() || "Admin";
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Welcome, {displayName}</CardTitle>
          <CardDescription>
            {userDetails?.email || "Administration overview"}
          </CardDescription>
        </CardHeader>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Platform wide
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatINR(stats.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                All time revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tickets Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalTickets}</p>
              <p className="text-xs text-muted-foreground mt-2">Total volume</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              u.role === "admin"
                                ? "bg-purple-50 text-purple-700 ring-purple-600/10"
                                : u.role === "organizer"
                                  ? "bg-blue-50 text-blue-700 ring-blue-600/10"
                                  : "bg-gray-50 text-gray-600 ring-gray-500/10"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(
                            u.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Server Status
                </span>
                <span className="flex items-center text-sm font-medium text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="flex items-center text-sm font-medium text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Backup
                </span>
                <span className="text-sm font-medium">2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Events</h2>
        <EventList events={events.slice(0, 4)} />
      </div>
    </div>
  );
}
