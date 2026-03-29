"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { SeatLayout, type Seat } from "@/components/seat-layout";
import { toast } from "sonner";
import { Clock, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Event } from "@/lib/types";
import { apiClient, createBooking } from "@/lib/api";

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  const carriedTicketPrice = Number(searchParams.get("ticketPrice") || 0);
  const carriedRemainingSeats = Number(searchParams.get("remainingSeats") || 0);
  const carriedTotalCapacity = Number(searchParams.get("totalCapacity") || 0);
  const carriedStartDatetime = searchParams.get("startDatetime") || undefined;
  const carriedVenueName = searchParams.get("venueName") || undefined;
  const carriedCity = searchParams.get("city") || undefined;
  const carriedTitle = searchParams.get("title") || undefined;

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("access_token");
    if (!user) {
      toast.error("Please login to book tickets");
      router.push(`/login?redirect=/events/${eventId}/book`);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Use carried data immediately so ticket price and remaining seats are available on first render.
        if (carriedTitle || carriedTicketPrice || carriedRemainingSeats) {
          setEvent(
            (prev) =>
              prev ??
              ({
                id: eventId,
                title: carriedTitle || "Event",
                ticketPrice: carriedTicketPrice,
                availableCapacity: carriedRemainingSeats,
                totalCapacity: carriedTotalCapacity,
                startDatetime: carriedStartDatetime,
                venueName: carriedVenueName,
                city: carriedCity,
              } as Event),
          );
        }

        const eventData = await apiClient.getEventById(eventId);
        setEvent((eventData?.data ?? eventData) as Event);

        // Mock seat data fetch
        // In a real app, adjust this to use the API
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const mockSeats: Seat[] = [];
        const seatPrice =
          Number((eventData?.data ?? eventData)?.ticketPrice) ||
          carriedTicketPrice ||
          50;

        rows.forEach((row, rowIndex) => {
          const type: Seat["type"] = "General";

          for (let i = 1; i <= 10; i++) {
            const status = Math.random() > 0.8 ? "booked" : "available";
            mockSeats.push({
              id: `${row}${i}`,
              row,
              number: i,
              status: status as any,
              price: seatPrice,
              type: type as any,
            });
          }
        });
        setSeats(mockSeats);
      } catch (err) {
        console.error("Error loading booking data", err);
        toast.error("Failed to load seating chart");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId, router]);

  // Timer logic
  useEffect(() => {
    if (selectedSeats.length > 0 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      toast.warning("Session Expired", {
        description: "Your seat hold has expired.",
      });
      setSelectedSeats([]);
      setTimer(300); // Reset
    }
  }, [selectedSeats, timer]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error("Maximum 8 seats allowed per booking");
        return;
      }
      if (selectedSeats.length === 0) {
        setTimer(300); // Start timer on first selection
      }
      setSelectedSeats((prev) => [...prev, seat.id]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, id) => {
      const seat = seats.find((s) => s.id === id);
      return total + (seat ? seat.price : 0);
    }, 0);
  };

const handleCheckout = async () => {
  if (selectedSeats.length === 0 || !event) return;

  const totalAmount = calculateTotal();

  // ✅ Convert seats to string format: A1,B10,A5
  const seatsString = selectedSeats.join(",");

  const response = await createBooking({
    eventName: event.title || "",
    eventId,
    quantity: selectedSeats.length,
    unitPrice: totalAmount / selectedSeats.length,
    currency: "INR",
    seatNo:selectedSeats
  });

  const result = await response.json();

  const query = new URLSearchParams({
    seats: seatsString, // ✅ CLEAN STRING
    amount: totalAmount.toString(),
    eventId: eventId,
    eventTitle: event.title || "",
    eventDate: event.startDatetime || (event as any).date || "",
    eventVenue: event.venueName || (event as any).location || "",
    eventCity: event.city || "",
    ticketPrice: String(Number(event.ticketPrice || 0)),
    bookingId: result?.data?.id || "",
  }).toString();

  router.push(`/events/${eventId}/book/summary?${query}`);
};

  if (isLoading) return <LoadingState />;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="container max-w-[1400px] mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area: Seat Map */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Select Seats
            </h1>
            <div className="flex items-center text-muted-foreground text-sm">
              <span>{event.title}</span>
              <span className="mx-2">•</span>
              <span>{event.venueName || (event as any).location}</span>
              <span className="mx-2">•</span>
              <span>
                {new Date(
                  event.startDatetime || (event as any).date || new Date(),
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              From{" "}
              {formatINR(Number(event.ticketPrice || carriedTicketPrice || 0))}{" "}
              • {Number(event.availableCapacity || carriedRemainingSeats || 0)}{" "}
              seats left
            </div>
          </div>

          <Card className="border-0 shadow-none bg-background">
            <CardContent className="p-0 overflow-hidden">
              <SeatLayout
                seats={seats}
                onSeatSelect={handleSeatSelect}
                selectedSeats={selectedSeats}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-lg border-muted">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="flex justify-between items-center text-lg">
                  Booking Summary
                  {selectedSeats.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-background text-primary border-primary flex items-center gap-1 font-mono"
                    >
                      <Clock className="w-3 h-3" /> {formatTime(timer)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {selectedSeats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-sm">Please select seats to proceed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {selectedSeats.map((id) => {
                        const seat = seats.find((s) => s.id === id);
                        if (!seat) return null;
                        return (
                          <div
                            key={id}
                            className="flex justify-between text-sm items-center py-1"
                          >
                            <div>
                              <span className="font-semibold">
                                {seat.row}
                                {seat.number}
                              </span>
                            </div>
                            <span>{formatINR(seat.price)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>{formatINR(calculateTotal())}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Remaining Seats</span>
                      <span>
                        {Number(
                          event.availableCapacity || carriedRemainingSeats || 0,
                        )}
                      </span>
                    </div>

                    <Button
                      className="w-full mt-4"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Book Seats
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-4 flex items-start gap-2 bg-primary/10 dark:bg-primary/20 p-3 rounded text-primary">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Seats are reserved for 5 minutes once selected. Please
                    complete your transaction within this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
