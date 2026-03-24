"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Ticket, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardUserDetails } from "@/lib/types";

interface UserDashboardProps {
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTickets: number;
  } | null;
  bookings: any[];
  userDetails: DashboardUserDetails | null;
}

export function UserDashboard({
  stats,
  bookings,
  userDetails,
}: UserDashboardProps) {
  const displayName = userDetails?.name?.trim() || "User";
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
            {userDetails?.email || "Your dashboard overview"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* User Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Bookings made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Tickets Bought
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalTickets}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Total tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatINR(stats.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                On event tickets
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden flex flex-col">
              <div className="h-32 bg-muted relative">
                {/* Placeholder for event image if available */}
                {booking.event?.image && (
                  <img
                    src={booking.event.image}
                    alt={booking.event.title?.trim() || "Booked event image"}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      booking.status === "confirmed" ? "default" : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="truncate text-lg">
                  {booking.event?.title || "Unknown Event"}
                </CardTitle>
                <CardDescription>
                  Purchase Date:{" "}
                  {new Date(booking.purchasedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{booking.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="font-bold text-primary">
                    {formatINR(Number(booking.totalPrice || 0))}
                  </span>
                </div>

                {booking.event && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Event Details:
                    </p>
                    <div className="flex items-center text-xs gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {(booking.event as any).startDatetime
                          ? new Date(
                              (booking.event as any).startDatetime,
                            ).toLocaleDateString()
                          : booking.event.date}{" "}
                        at{" "}
                        {(booking.event as any).startDatetime
                          ? new Date(
                              (booking.event as any).startDatetime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : booking.event.time}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
              <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Explore events and book your first ticket!
              </p>
              <Link href="/">
                <Button>Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
