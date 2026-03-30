"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/TicketPDF";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewDialog } from "@/components/ReviewDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Loader2,
  Download,
  Calendar,
  Ticket,
  Wallet,
  Info,
  Zap,
  MessageSquarePlus,
  ArrowUpRight,
  Fingerprint,
} from "lucide-react";
import { getUserBookings } from "@/lib/api";

interface Booking {
  id: string;
  eventName: string;
  status: string;
  createdAt: string;
  eventDate?: string;
  quantity: number;
  currency: string;
  totalAmount: number;
  unitPrice: number;
  qr: string;
  eventId: string;
}

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await getUserBookings(session.user.id);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Registry fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [session?.user?.id]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white opacity-10" />
      </div>
    );
  }

  const handleOpenReview = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setIsReviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-16 px-6 lg:px-12 selection:bg-neutral-800">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
                Registry: AUTH_USER_VAULT
              </span>
            </div>
            <h1 className="text-5xl font-medium tracking-tighter text-white italic">My Ledger.</h1>
            <p className="text-sm text-neutral-500 font-light italic leading-relaxed">
              Authorized access tokens and historical event settlement records.
            </p>
          </div>
        </header>

        {/* All Bookings */}
        {bookings.length === 0 ? (
          <div className="py-20 text-center bg-neutral-900/5 border border-dashed border-neutral-800 rounded-[32px]">
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-black">No protocols detected in registry</p>
          </div>
        ) : (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-white fill-current" />
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-black">All Bookings</h2>
              <div className="h-[1px] flex-1 bg-neutral-900" />
              <span className="text-[9px] font-mono text-neutral-600">{bookings.length} records</span>
            </div>

            <div className="grid gap-8">
              {bookings.map((b) => {
                const statusUpper = b.status?.toUpperCase() || "";
                const eventDate = new Date(b.eventDate || b.createdAt);
                const isEventOver = eventDate < new Date();
                const isCompleted = statusUpper === "COMPLETED";
                const isCancelled = statusUpper === "CANCELLED";
                const canReview = !isCancelled && (isCompleted || isEventOver);

                return (
                  <TicketCard 
                    key={b.id} 
                    booking={b} 
                    session={session} 
                    canReview={canReview}
                    onReview={() => handleOpenReview(b)}
                  />
                );
              })}
            </div>
          </section>
        )}

        <ReviewDialog 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          booking={selectedBookingForReview}
          onRefresh={fetchBookings}
        />
      </div>
    </div>
  );
}

function TicketCard({ booking, session, canReview, onReview }: { booking: Booking; session: any; canReview: boolean; onReview: () => void }) {
  return (
    <div className="group relative">
      {/* Changed Glow from blue/emerald to neutral white/neutral-900 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neutral-500/10 to-neutral-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-700 blur-2xl" />
      
      <div className="relative flex flex-col md:flex-row bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* Left Side: QR Stub */}
        <div className="relative w-full md:w-64 bg-white flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-dashed border-neutral-200">
          <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-[#050505] rounded-full border border-neutral-800" />
          <div className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 bg-[#050505] rounded-full border border-neutral-800" />
          
          <div className="p-3 border-[1px] border-neutral-200 rounded-xl">
             <img 
               src={`data:image/png;base64,${booking.qr}`} 
               className="w-32 h-32 image-render-pixelated grayscale hover:grayscale-0 transition-all duration-500" 
               alt="QR"
             />
          </div>
          <p className="mt-4 text-[8px] font-black text-black uppercase tracking-[0.3em]">Entry Identity</p>
        </div>

        {/* Right Side: Info */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px] font-black tracking-widest uppercase rounded-sm">
                  {booking.status} // VERIFIED
                </Badge>
                <h3 className="text-3xl font-bold text-white tracking-tighter italic">{booking.eventName}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Registry ID</p>
                <p className="text-xs font-mono text-neutral-400">#{booking.id.slice(0, 12)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-t border-neutral-900">
               <div className="space-y-1">
                  <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Temporal</p>
                  <p className="text-sm text-neutral-200 font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Units</p>
                  <p className="text-sm text-neutral-200 font-medium">{booking.quantity} ACCESS_PASS</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Settlement</p>
                  <p className="text-sm text-neutral-200 font-medium">{booking.currency} {booking.totalAmount}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Node</p>
                  <p className="text-sm text-neutral-200 font-medium">HUB_GATE_01</p>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-8">
            {canReview && (
              <Button 
                onClick={onReview}
                variant="ghost" 
                className="text-neutral-500 hover:text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest px-6 h-11 rounded-xl"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 mr-2" /> Give Review
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-neutral-500 hover:text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest px-6 h-11 rounded-xl">
                  Inspect Metadata <Info className="w-3.5 h-3.5 ml-2" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#050505] border-neutral-900 text-neutral-200 w-full sm:max-w-[400px]">
                <SheetHeader className="mb-10 text-left">
                  <SheetTitle className="text-white tracking-tighter text-3xl italic">Pass Metadata.</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  <DetailItem label="Event Designation" value={booking.eventName} icon={<Fingerprint size={14}/>} />
                  <DetailItem label="Allocated Quantity" value={`${booking.quantity} Units`} icon={<Ticket size={14}/>} />
                  <DetailItem label="Registry Sync Date" value={new Date(booking.createdAt).toLocaleDateString()} icon={<Calendar size={14}/>} />
                  <DetailItem label="Gross Settlement" value={`${booking.currency} ${booking.totalAmount}`} icon={<Wallet size={14}/>} />
                  <DetailItem label="Unit Price" value={`${booking.currency} ${booking.unitPrice}`} icon={<ArrowUpRight size={14}/>} />
                </div>
                <div className="mt-12 p-8 bg-white rounded-3xl flex flex-col items-center gap-4">
                    <img src={`data:image/png;base64,${booking.qr}`} className="w-48 h-48" alt="Details QR"/>
                    <p className="text-[10px] text-black font-black uppercase tracking-[0.4em]">Biometric Entry Token</p>
                </div>
              </SheetContent>
            </Sheet>

            <PDFDownloadLink
              document={<TicketPDF booking={booking} user={session?.user} />}
              fileName={`Pass-${booking.id.slice(0, 8)}.pdf`}
            >
              {({ loading }) => (
                <Button 
                  disabled={loading}
                  className="bg-white text-black hover:bg-neutral-300 font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-11 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-2">Download Pass <Download className="w-3 h-3" /></span>}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="text-neutral-500">{icon}</div>
        <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}