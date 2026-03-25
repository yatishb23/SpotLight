"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Ticket, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user?.id) {
        try {
          setIsLoading(true);
          const data = await apiClient.getUserBookings(session.user.id);
          const normalizedBookings = Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.bookings)
              ? (data as any).bookings
              : Array.isArray((data as any)?.data)
                ? (data as any).data
                : [];
          setBookings(normalizedBookings);
        } catch (error) {
          console.error("Failed to fetch bookings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't booked any events yet.
            </p>
            <Button asChild>
              <Link href="/">Find Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden flex flex-col group"
            >
              <div className="relative h-40 w-full overflow-hidden">
                {booking.event?.image ? (
                  <Image
                    src={booking.event.image}
                    alt={booking.event.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      booking.status === "confirmed" ? "default" : "secondary"
                    }
                  >
                    {booking.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle
                  className="truncate line-clamp-1"
                  title={booking.event?.title}
                >
                  {booking.event?.title || "Unknown Event"}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {(booking.event as any)?.startDatetime || booking.event?.date
                    ? format(
                        new Date(
                          (booking.event as any)?.startDatetime ||
                            booking.event?.date,
                        ),
                        "PPP",
                      )
                    : "Date TBD"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {(booking.event as any)?.startDatetime
                      ? new Date(
                          (booking.event as any).startDatetime,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : booking.event?.time || "Time TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {(booking.event as any)?.venueName ||
                      (booking.event as any)?.location ||
                      "Location TBD"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {booking.quantity} Ticket{booking.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                    <p className="font-bold text-primary">
                      {formatINR(Number(booking.totalPrice || 0))}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full">
                  View Ticket Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
