"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  Home,
} from "lucide-react";
import { updateOrderStatus } from "@/lib/api";
import { useSession } from "next-auth/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/TicketPDF";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const bookingId = searchParams.get("bookingId");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const hasCalledUpdate = useRef(false);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  useEffect(() => {
    const syncBooking = async () => {
      if (!bookingId || hasCalledUpdate.current) return;
      try {
        hasCalledUpdate.current = true;
        const response = await updateOrderStatus(bookingId);

        setBookingData(response);
      } catch (error: any) {
        console.error("Sync error:", error);
        // If it fails to update, redirect to login (session-expired)
        router.push(
          `/events/session-expired?id=${bookingId}?reason="Session Expired"`,
        );
      } finally {
        setIsLoading(false);
      }
    };
    syncBooking();
  }, [bookingId]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
          <p className="text-[11px] uppercase tracking-widest text-white/20 animate-pulse">
            Confirming your booking…
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-16 px-6">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h1 className="text-xl font-medium text-white">Booking confirmed</h1>
          <p className="text-[12px] text-white/30">
            Your tickets are ready. Check your email for details.
          </p>
        </div>

        {/* Ticket card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-black w-full" />
          <div className="p-8 text-black space-y-6">
            {/* Brand */}
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <span className="text-[16px] font-bold tracking-tight">
                EventHub
              </span>
              <span className="text-[9px] font-medium text-black/30 uppercase tracking-widest">
                Ticket
              </span>
            </div>

            {/* Event name */}
            <div>
              <p className="text-[9px] font-semibold text-black/30 uppercase tracking-widest mb-1">
                Event
              </p>
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {bookingData?.eventName || "Event"}
              </h2>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-5 border-t border-black/[0.08] pt-5">
              <div>
                <p className="text-[9px] font-semibold text-black/30 uppercase tracking-widest mb-0.5">
                  Name
                </p>
                <p className="text-[13px] font-medium truncate">
                  {session?.user?.name || "Guest"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-black/30 uppercase tracking-widest mb-0.5">
                  Booking ID
                </p>
                <p className="text-[11px] font-mono truncate">
                  {bookingId?.slice(0, 12)}…
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-black/30 uppercase tracking-widest mb-0.5">
                  Tickets
                </p>
                <p className="text-[13px] font-medium">
                  {bookingData?.quantity || 0}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-black/30 uppercase tracking-widest mb-0.5">
                  Total paid
                </p>
                <p className="text-[13px] font-medium">
                  {formatINR(bookingData?.totalAmount)}
                </p>
              </div>
            </div>

            {/* QR Section - Updated to handle string directly */}
            <div className="flex justify-between items-end border-t border-black/[0.08] pt-5">
              <p className="text-[9px] text-black/25 max-w-[130px] leading-relaxed">
                Present this QR at the venue entrance.
              </p>
              <div className="border-4 border-black p-1.5">
                {bookingData?.qr ? (
                  <img
                    src={`data:image/png;base64,${bookingData.qr}`}
                    alt="QR code"
                    className="w-20 h-20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-black/5 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-black/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {bookingData && (
            <PDFDownloadLink
              document={
                <TicketPDF booking={bookingData} user={session?.user} />
              }
              fileName={`ticket-${bookingId?.slice(0, 8)}.pdf`}
              className="flex-1"
            >
              {({ loading }) => (
                <Button className="w-full h-11 bg-white text-black hover:bg-white/90 text-[12px] font-semibold rounded-xl flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download ticket
                </Button>
              )}
            </PDFDownloadLink>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1 h-11 border-white/[0.07] bg-transparent text-white/40 hover:text-white hover:bg-white/[0.05] text-[12px] rounded-xl"
          >
            <Home className="w-3.5 h-3.5 mr-2" /> Home
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-25">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">
            Verified booking
          </span>
        </div>
      </div>
    </div>
  );
}
