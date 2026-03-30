"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { SeatLayout, type Seat } from "@/components/seat-layout";
import { toast } from "sonner";
import { Clock, ShieldCheck, Ticket, Armchair, ChevronRight, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Event } from "@/lib/types";
import { apiClient, createBooking, getBookedSeats } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function BookingPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const {data:session} = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [timer, setTimer] = useState(600);

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
        
        // Parallel fetch for Event Details and already Booked Seats
        const [eventRes, seatsRes] = await Promise.all([
          apiClient.getEventById(eventId),
          getBookedSeats(eventId)
        ]);

        const eventData = eventRes?.data ?? eventRes;
        const bookedSeatsList: string[] = seatsRes?.data ?? seatsRes ?? []; // Array of IDs like ["A1", "B5"]
        
        setEvent(eventData as Event);

        // --- DYNAMIC SEAT MAPPING ---
        const total = eventData.totalCapacity;
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        const seatsPerRow = Math.ceil(total / rows.length);
        const generatedSeats: Seat[] = [];
        
        let seatCounter = 0;

        for (let r = 0; r < rows.length; r++) {
          for (let s = 1; s <= seatsPerRow; s++) {
            if (seatCounter >= total) break;

            const seatId = `${rows[r]}${s}`;
            
            // CHECK: Is this specific seat ID in the booked list from API?
            const isAlreadyBooked = bookedSeatsList.includes(seatId);

            generatedSeats.push({
              id: seatId,
              row: rows[r],
              number: s,
              status: isAlreadyBooked ? "booked" : "available",
              price: eventData.ticketPrice,
              type: "General",
            });
            
            seatCounter++;
          }
        }
        setSeats(generatedSeats);
      } catch (err) {
        console.error("Registry Sync Error:", err);
        toast.error("Failed to synchronize seating registry");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId, router]);

  // Timer Logic — 10 minute session
  useEffect(() => {
    if (selectedSeats.length > 0 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && selectedSeats.length > 0) {
      setSelectedSeats([]);
      setTimer(600);
      toast.error("Session expired. Redirecting...");
      router.push(`/events/${eventId}/book/session-expired?reason=timeout&from=booking`);
    }
  }, [selectedSeats, timer, router, eventId]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error("Protocol limit: 8 units per transaction");
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
        userName : session?.user?.name || "Guest",
        eventId: event.id,
        quantity: selectedSeats.length,
        unitPrice: event.ticketPrice,
        currency: event.currency || "INR",
        seatNo: selectedSeats
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
    } catch (error) {
      toast.error("Booking initialization failed");
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

  if (isLoading) return <div className="min-h-screen bg-[#050505] p-8"><LoadingState count={1} type="chart" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 pb-20">
      {/* Dynamic Header */}
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Venue Registry</p>
              <p className="text-[11px] text-neutral-400 font-mono">{event?.venueName}, {event?.city}</p>
            </div>
            <div className="h-10 w-[1px] bg-neutral-800 hidden sm:block" />
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5">
              <Armchair className="w-3 h-3" /> {event?.availableCapacity} / {event?.totalCapacity} Units Left
            </Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-[1400px] mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Floor Plan Section */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-neutral-900" />
                  <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-black">Digital Floor Plan</span>
                  <div className="h-[1px] flex-1 bg-neutral-900" />
               </div>
               
               <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[40px] p-8 md:p-16 overflow-x-auto shadow-2xl">
                 <div className="min-w-[700px] flex flex-col items-center">
                    <div className="w-3/4 h-2 bg-neutral-800 rounded-full mb-20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
                    <SeatLayout
                      seats={seats}
                      onSeatSelect={handleSeatSelect}
                      selectedSeats={selectedSeats}
                    />
                 </div>
               </div>
            </div>

            <div className="flex justify-center gap-12 text-[10px] uppercase tracking-widest font-bold text-neutral-600">
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm bg-neutral-800" /> Booked</div>
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm border border-neutral-700" /> Available</div>
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm bg-white" /> Selection</div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <aside className="sticky top-28">
              <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-xl rounded-[32px] overflow-hidden border shadow-2xl">
                <CardHeader className="p-8 border-b border-neutral-800/50 flex flex-row justify-between items-center">
                  <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-black">
                    Summary
                  </CardTitle>
                  {selectedSeats.length > 0 && (
                    <div className="text-emerald-500 font-mono text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  {selectedSeats.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                      <Ticket className="w-10 h-10" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">Awaiting Selection</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="space-y-3">
                        {selectedSeats.map((id) => (
                          <div key={id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-xs font-black shadow-lg">
                                  {id}
                               </div>
                               <div>
                                 <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Standard Unit</p>
                                 <p className="text-[10px] text-neutral-400 font-mono italic">HUB-ACCESS-SEC</p>
                               </div>
                            </div>
                            <span className="text-sm font-mono text-white">{formatINR(event?.ticketPrice || 0)}</span>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-neutral-800" />

                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Total Valuation</p>
                          <p className="text-4xl font-medium text-white tracking-tighter">{formatINR(selectedSeats.length * (event?.ticketPrice || 0))}</p>
                        </div>
                        
                        <Button
                          className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex justify-between px-8 group shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                          onClick={handleCheckout}
                          disabled={isBooking}
                        >
                          {isBooking ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                            <>Initialize Pass <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-neutral-800/50">
                    <div className="flex items-start gap-4 p-5 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-[9px] leading-relaxed text-neutral-500 uppercase font-bold tracking-tight">
                        Registry Lock Active. Selected units are reserved via temporary hold protocol.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}