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
  FileDown,
} from "lucide-react";
import { getUserBookings } from "@/lib/api";
import { cn } from "@/lib/utils";

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
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  const handleOpenReview = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setIsReviewOpen(true);
  };

  return (
    /* Standardized Container Width: max-w-6xl for better focus on content */
    <div className="min-h-screen bg-[#050505] text-neutral-200 px-4 md:px-8 py-8 space-y-10">
      
      {/* Header - Consistent Width */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row justify-between gap-6 border-b border-white/[0.04] pb-10">
        <div>
          <p className="text-[11px] text-white/25 uppercase tracking-widest">Customer Portal</p>
          <h1 className="text-2xl font-light text-white">My Bookings</h1>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-9 border-white/[0.08] text-white/40 bg-transparent hover:bg-white/5 hover:text-white"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Bookings Section - Consistent Width */}
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/20" />
            <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
              Recent Transactions
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/20">{bookings.length} Records found</span>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
            <p className="text-[11px] text-white/20 uppercase tracking-widest">No protocols detected in registry</p>
          </div>
        ) : (
          <div className="grid gap-5">
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
        )}
      </div>

      <ReviewDialog 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        booking={selectedBookingForReview}
        onRefresh={fetchBookings}
      />
    </div>
  );
}

function TicketCard({ booking, session, canReview, onReview }: { booking: Booking; session: any; canReview: boolean; onReview: () => void }) {
  return (
    <div className="group relative bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl transition-all duration-300 overflow-hidden">
      <div className="flex flex-col md:flex-row items-stretch">
        
        {/* Left Side: QR - Standardized width to 220px on desktop */}
        <div className="w-full md:w-[220px] bg-white/[0.03] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/[0.06]">
          <div className="p-2.5 bg-white rounded-xl shadow-lg">
            <img 
              src={`data:image/png;base64,${booking.qr}`} 
              className="w-28 h-28 grayscale" 
              alt="QR"
            />
          </div>
          <p className="mt-4 text-[9px] text-white/20 uppercase tracking-widest font-mono">
            ID: {booking.id.slice(0, 8)}
          </p>
        </div>

        {/* Right Side: Content - Flexible height based on content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    booking.status === "confirmed" || booking.status === "completed" ? "bg-emerald-500" : "bg-white/20"
                )} />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                  {booking.status}
                </span>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">{booking.eventName}</h3>
            </div>
            
            {/* Standardized Button Heights (h-9) */}
            <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
                {canReview && (
                  <Button 
                    onClick={onReview}
                    variant="ghost" 
                    className="h-9 text-[10px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.08]"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 mr-2" /> Review
                  </Button>
                )}

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="h-9 text-[10px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.08]">
                      Metadata <Info className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-[#050505] border-white/[0.08] text-neutral-200">
                    <SheetHeader className="mb-8">
                      <SheetTitle className="text-white font-light text-xl">Pass Metadata</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3">
                      <DetailItem label="Event" value={booking.eventName} icon={<Fingerprint size={12}/>} />
                      <DetailItem label="Quantity" value={`${booking.quantity} Units`} icon={<Ticket size={12}/>} />
                      <DetailItem label="Date" value={new Date(booking.createdAt).toLocaleDateString()} icon={<Calendar size={12}/>} />
                      <DetailItem label="Total" value={`${booking.currency} ${booking.totalAmount}`} icon={<Wallet size={12}/>} />
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
                      className="h-9 bg-white text-black hover:bg-neutral-200 text-[10px] uppercase tracking-widest px-5 font-medium"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="flex items-center gap-2">Download <Download className="w-3.5 h-3.5" /></span>}
                    </Button>
                  )}
                </PDFDownloadLink>
            </div>
          </div>

          {/* Bottom Grid: Standardized spacing */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/[0.04]">
            <div className="space-y-1.5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Temporal</p>
              <p className="text-xs text-white/70">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Units</p>
              <p className="text-xs text-white/70">{booking.quantity} Access Pass</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Settlement</p>
              <p className="text-xs text-white/70">{booking.currency} {booking.totalAmount}</p>
            </div>
            <div className="space-y-1.5 text-right">
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Auth Code</p>
              <p className="text-xs font-mono text-white/40">#{booking.id.slice(0, 6)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="text-white/20">{icon}</div>
        <span className="text-[10px] uppercase text-white/40 font-medium tracking-widest">{label}</span>
      </div>
      <span className="text-xs text-white/80">{value}</span>
    </div>
  );
}