"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Clock, Download, Ticket } from "lucide-react";
import Link from "next/link";

// Mock Data for User Bookings
const UPCOMING_BOOKINGS = [
  {
    id: "BK-123456",
    eventTitle: "Neon Dreams Concert",
    date: "2026-03-22",
    time: "20:00",
    location: "Madison Square Garden",
    seats: ["A1", "A2", "A3"],
    totalAmount: 320.0,
    status: "confirmed",
    image: "/images/concert.jpg",
  },
];

const PAST_BOOKINGS = [
  {
    id: "BK-987654",
    eventTitle: "Tech Conference 2025",
    date: "2025-11-15",
    time: "09:00",
    location: "Convention Center",
    seats: ["General Admission"],
    totalAmount: 150.0,
    status: "completed",
    image: "/images/tech.jpg",
  },
  {
    id: "BK-456789",
    eventTitle: "Standup Comedy Night",
    date: "2025-10-05",
    time: "19:30",
    location: "Comedy Club",
    seats: ["F12", "F13"],
    totalAmount: 90.0,
    status: "completed",
    image: "/images/comedy.jpg",
  },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const BookingCard = ({
    booking,
    isPast = false,
  }: {
    booking: any;
    isPast?: boolean;
  }) => (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${isPast ? "opacity-75 hover:opacity-100" : ""}`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="bg-muted w-full md:w-48 h-32 md:h-auto flex items-center justify-center shrink-0">
          <Ticket className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl">{booking.eventTitle}</h3>
              <Badge
                variant={
                  booking.status === "confirmed" ? "default" : "secondary"
                }
              >
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{booking.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>
                  {booking.seats.length} Tickets ({booking.seats.join(", ")})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-2">
            <span className="font-bold text-lg">
              {formatINR(booking.totalAmount)}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {!isPast && (
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" /> Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <Button asChild variant="outline">
          <Link href="/">Browse Events</Link>
        </Button>
      </div>

      <Tabs
        defaultValue="upcoming"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-6">
              {UPCOMING_BOOKINGS.length > 0 ? (
                UPCOMING_BOOKINGS.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't booked any upcoming events yet.
                  </p>
                  <Button asChild>
                    <Link href="/">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {PAST_BOOKINGS.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
