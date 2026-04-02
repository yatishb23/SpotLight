"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { SeatLayout, type Seat } from "@/components/seat-layout";
import { toast } from "sonner";
import { ShieldCheck, Ticket, ChevronRight, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Event } from "@/lib/types";
import { apiClient, createBooking, getSeats } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function BookingPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [timer, setTimer] = useState(600);

  useEffect(() => {
    const user = localStorage.getItem("access_token");
    if (!user) {
      toast.error("Please sign in to continue");
      router.push(`/auth/login?redirect=/events/${eventId}/book`);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventRes, seatsRes] = await Promise.all([
          apiClient.getEventById(eventId),
          getSeats(eventId),
        ]);

        const eventData = eventRes?.data ?? eventRes;
        const seatsData = seatsRes?.data ?? seatsRes ?? [];

        const bookedSeatsList: string[] = [];
        if (Array.isArray(seatsData)) {
          seatsData.forEach((booking: any) => {
            const status = booking.status?.toUpperCase();
            if (status === "PENDING_PAYMENT" || status === "CONFIRMED") {
              if (Array.isArray(booking.seatNo)) {
                bookedSeatsList.push(...booking.seatNo);
              }
            }
          });
        }

        setEvent(eventData as Event);

        const total = eventData.totalCapacity;
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        const seatsPerRow = Math.ceil(total / rows.length);
        const generatedSeats: Seat[] = [];
        let counter = 0;

        for (let r = 0; r < rows.length; r++) {
          for (let s = 1; s <= seatsPerRow; s++) {
            if (counter >= total) break;
            const seatId = `${rows[r]}${s}`;
            generatedSeats.push({
              id: seatId,
              row: rows[r],
              number: s,
              status: bookedSeatsList.includes(seatId) ? "booked" : "available",
              price: eventData.ticketPrice,
              type: "General",
            });
            counter++;
          }
        }
        setSeats(generatedSeats);
      } catch {
        toast.error("Failed to load seating map");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId, router]);

  useEffect(() => {
    if (selectedSeats.length > 0 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && selectedSeats.length > 0) {
      setSelectedSeats([]);
      setTimer(600);
      router.push(
        `/events/${eventId}/book/session-expired?reason=timeout&from=booking`,
      );
    }
  }, [selectedSeats, timer, router, eventId]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error("Maximum 8 tickets per booking");
        return;
      }
      setSelectedSeats((prev) => [...prev, seat.id]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0 || !event) return;
    setIsBooking(true);
    try {
      const response = await createBooking({
        eventName: event.title,
        userName: session?.user?.name || "Guest",
        eventId: event.id,
        quantity: selectedSeats.length,
        unitPrice: event.ticketPrice,
        currency: event.currency || "INR",
        seatNo: selectedSeats,
      });
      const result = await response.json();
      const query = new URLSearchParams({
        seats: selectedSeats.join(","),
        amount: (selectedSeats.length * event.ticketPrice).toString(),
        eventId: event.id,
        eventTitle: event.title,
        bookingId: result?.data?.id || result?.id || "",
      }).toString();
      router.push(`/events/${eventId}/book/summary?${query}`);
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#050505] p-8">
        <LoadingState count={1} type="chart" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pb-20">
      {/* Header */}
      <div className="border-b border-white/[0.04] bg-[#050505]/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-white/30 mb-0.5">
              Select your seats
            </p>
            <h1 className="text-[14px] font-medium text-white">
              {event?.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-white/35 hidden sm:block">
              {event?.venueName}, {event?.city}
            </span>
            <Badge
              variant="outline"
              className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[10px]"
            >
              {event?.availableCapacity} seats left
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto py-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Seat map */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 md:p-14 overflow-x-auto">
              <div className="min-w-[700px] flex flex-col items-center">
                <div className="w-2/3 h-1.5 bg-white/10 rounded-full mb-16 text-center">
                  <span className="block text-[9px] text-white/20 uppercase tracking-widest mt-3">
                    Stage
                  </span>
                </div>
                <SeatLayout
                  seats={seats}
                  onSeatSelect={handleSeatSelect}
                  selectedSeats={selectedSeats}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 text-[10px] text-white/30 uppercase tracking-widest">
              {[
                { color: "bg-white/10", label: "Booked" },
                { color: "border border-white/20", label: "Available" },
                { color: "bg-white", label: "Selected" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-white/[0.05] flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">
                  Order summary
                </span>
                {selectedSeats.length > 0 && (
                  <span
                    className={`text-[11px] font-mono ${timer < 60 ? "text-red-400" : "text-white/30"}`}
                  >
                    {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                  </span>
                )}
              </div>

              <div className="p-7">
                {selectedSeats.length === 0 ? (
                  <div className="py-14 flex flex-col items-center text-center gap-3 opacity-25">
                    <Ticket className="w-8 h-8" />
                    <p className="text-[11px] uppercase tracking-widest">
                      No seats selected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                    <div className="space-y-2">
                      {selectedSeats.map((id) => (
                        <div
                          key={id}
                          className="flex items-center justify-between bg-white/[0.04] px-4 py-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-[11px] font-bold">
                              {id}
                            </div>
                            <span className="text-[12px] text-white/50">
                              General
                            </span>
                          </div>
                          <span className="text-[12px] font-medium text-white/70">
                            {formatINR(event?.ticketPrice || 0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-white/[0.05]" />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/35 uppercase tracking-widest">
                        Total
                      </span>
                      <span className="text-2xl font-light text-white">
                        {formatINR(
                          selectedSeats.length * (event?.ticketPrice || 0),
                        )}
                      </span>
                    </div>

                    <Button
                      className="w-full h-11 bg-white text-black hover:bg-white/90 text-[12px] font-semibold rounded-xl flex items-center justify-center gap-2 group"
                      onClick={handleCheckout}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Proceed to payment{" "}
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-white/[0.05]">
                  <div className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-white/25">
                      Selected seats are held for your session. Complete payment
                      to confirm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
