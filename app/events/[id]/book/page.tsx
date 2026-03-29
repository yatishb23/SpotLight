"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { SeatLayout, type Seat } from "@/components/seat-layout";
import { toast } from "sonner";
import { Clock, Info, ShieldCheck, Ticket, Armchair, ChevronRight, Loader2 } from "lucide-react";
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
  const [isBooking, setIsBooking] = useState(false);
  const [timer, setTimer] = useState(300);

  const carriedTicketPrice = Number(searchParams.get("ticketPrice") || 0);
  const carriedRemainingSeats = Number(searchParams.get("remainingSeats") || 0);
  const carriedTitle = searchParams.get("title") || "Event";

  useEffect(() => {
    const user = localStorage.getItem("access_token");
    if (!user) {
      toast.error("Authentication required");
      router.push(`/login?redirect=/events/${eventId}/book`);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const eventData = await apiClient.getEventById(eventId);
        const normalizedEvent = (eventData?.data ?? eventData) as Event;
        setEvent(normalizedEvent);

        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const mockSeats: Seat[] = [];
        const seatPrice = Number(normalizedEvent.ticketPrice) || carriedTicketPrice || 50;

        rows.forEach((row) => {
          for (let i = 1; i <= 10; i++) {
            const status = Math.random() > 0.85 ? "booked" : "available";
            mockSeats.push({
              id: `${row}${i}`,
              row,
              number: i,
              status: status as any,
              price: seatPrice,
              type: "General" as any,
            });
          }
        });
        setSeats(mockSeats);
      } catch (err) {
        toast.error("Failed to synchronize seating registry");
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
    } else if (timer === 0) {
      toast.warning("Session Expired", { description: "Seating hold released." });
      setSelectedSeats([]);
      setTimer(300);
    }
  }, [selectedSeats, timer]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error("Protocol limit: 8 seats per booking");
        return;
      }
      if (selectedSeats.length === 0) setTimer(300);
      setSelectedSeats((prev) => [...prev, seat.id]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0 || !event) return;
    setIsBooking(true);
    try {
      const totalAmount = selectedSeats.length * (Number(event.ticketPrice) || 0);
      const response = await createBooking({
        eventName: event.title || "",
        eventId,
        quantity: selectedSeats.length,
        unitPrice: totalAmount / selectedSeats.length,
        currency: "INR",
        seatNo: selectedSeats
      });

      const result = await response.json();
      const query = new URLSearchParams({
        seats: selectedSeats.join(","),
        amount: totalAmount.toString(),
        eventId: eventId,
        eventTitle: event.title || "",
        bookingId: result?.data?.id || "",
      }).toString();

      router.push(`/events/${eventId}/book/summary?${query}`);
    } catch (error) {
      toast.error("Booking initialization failed");
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] p-8">
        <LoadingState count={1} type="chart" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 pb-20">
      {/* Header Info */}
      <div className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
               <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold mb-1">Seating Protocol</p>
               <h1 className="text-sm font-bold text-white uppercase tracking-wider">{event?.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Registry Status</p>
              <p className="text-[11px] text-emerald-500 font-mono">Live Sync Active</p>
            </div>
            <div className="h-10 w-[1px] bg-neutral-800 hidden sm:block" />
            <Badge variant="outline" className="border-neutral-800 text-neutral-400 gap-2 px-4 py-1.5 rounded-full">
              <Armchair className="w-3 h-3" /> {event?.availableCapacity} Units Left
            </Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-[1400px] mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Seating Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-neutral-900" />
                  <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-black">Digital Floor Plan</span>
                  <div className="h-[1px] flex-1 bg-neutral-900" />
               </div>
               
               <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] p-8 md:p-12 overflow-x-auto">
                 <div className="min-w-[600px]">
                    <SeatLayout
                      seats={seats}
                      onSeatSelect={handleSeatSelect}
                      selectedSeats={selectedSeats}
                    />
                 </div>
               </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-neutral-800" /> Reserved</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-neutral-700" /> Available</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-white" /> Selected</div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <aside className="sticky top-28">
              <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl">
                <CardHeader className="p-8 border-b border-neutral-800/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-black">
                      Booking Summary
                    </CardTitle>
                    {selectedSeats.length > 0 && (
                      <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
                        <Clock className="w-3 h-3 animate-pulse" /> {formatTime(timer)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  {selectedSeats.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <Ticket className="w-8 h-8" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">Select units to initialize</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="max-h-[200px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {selectedSeats.map((id) => {
                          const seat = seats.find((s) => s.id === id);
                          if (!seat) return null;
                          return (
                            <div key={id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-[10px] font-black">
                                    {id}
                                 </div>
                                 <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">General Access</span>
                              </div>
                              <span className="text-sm font-mono text-white">{formatINR(seat.price)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <Separator className="bg-neutral-800" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Total Valuation</p>
                          <p className="text-3xl font-medium text-white tracking-tighter">{formatINR(selectedSeats.length * (event?.ticketPrice || 0))}</p>
                        </div>
                        
                        <Button
                          className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all group"
                          onClick={handleCheckout}
                          disabled={isBooking}
                        >
                          {isBooking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Initialize Pass <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-neutral-800/50 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-neutral-500 uppercase font-bold tracking-tight">
                        Encrypted selection active. Seats held for 5:00 minutes before release.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center opacity-20">
                <p className="text-[8px] uppercase tracking-[0.5em] text-neutral-500">
                  Node: hub_seat_registry_v2 // session_secure
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}