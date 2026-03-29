"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Ticket as TicketIcon,
  Home
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
        setBookingData(response?.data);
      } catch (error) {
        console.error("Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    syncBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 text-white animate-spin opacity-20" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold animate-pulse">
            Finalizing Identity Ledger
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-20 px-6 selection:bg-neutral-800">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-medium tracking-tighter text-white italic">Protocol Success.</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold">
            Transaction Confirmed // Access Granted
          </p>
        </div>

        {/* LIVE TICKET PREVIEW (Tailwind mirror of TicketPDF) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-neutral-800 to-transparent rounded-[2rem] opacity-20 blur-2xl" />
          
          <Card className="relative bg-white text-black rounded-none border-none overflow-hidden shadow-2xl">
            {/* Top Security Bar */}
            <div className="h-2 bg-black w-full" />
            
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex justify-between items-start border-b-2 border-black pb-6">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">EventHub.</h2>
                  <p className="text-[8px] font-bold tracking-[0.3em] text-neutral-400 mt-2 uppercase">Identity Passport</p>
                </div>
                <ShieldCheck className="w-8 h-8 opacity-20" />
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Access Designation</label>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mt-1 truncate">
                    {bookingData?.eventName || "Neon Dreams Concert"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-100">
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Holder</label>
                    <p className="text-sm font-bold uppercase truncate">{session?.user?.name || "Verified Guest"}</p>
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Ledger ID</label>
                    <p className="text-[10px] font-mono font-bold uppercase truncate">{bookingId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-100">
                   <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Allocation</label>
                      <p className="text-xl font-black italic">{bookingData?.quantity || 1} Unit(s)</p>
                   </div>
                   <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Valuation</label>
                      <p className="text-xl font-black italic">{formatINR(bookingData?.totalAmount)}</p>
                   </div>
                </div>
              </div>

              {/* QR and Decorative Bottom */}
              <div className="flex justify-between items-end border-t-2 border-black pt-10 mt-10">
                <div className="space-y-1">
                   <p className="text-[8px] font-mono font-bold opacity-30 uppercase tracking-widest">Stamp: {new Date().getTime()}</p>
                   <p className="text-[7px] max-w-[140px] leading-tight text-neutral-400 font-bold uppercase italic">
                     Digital signature verified. Scan for biometric sync at entry point.
                   </p>
                </div>
                <div className="bg-white p-2 border-[4px] border-black">
                   {bookingData?.qr?.[0] ? (
                     <img 
                        src={`data:image/png;base64,${bookingData.qr[0]}`} 
                        alt="Access QR" 
                        className="w-24 h-24 image-render-pixelated"
                     />
                   ) : (
                     <div className="w-24 h-24 bg-neutral-100 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                     </div>
                   )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {bookingData && (
            <PDFDownloadLink
              document={<TicketPDF booking={bookingData} user={session?.user} />}
              fileName={`Pass-${bookingId?.slice(0, 8)}.pdf`}
              className="flex-1"
            >
              {({ loading }) => (
                <Button className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Official Pass
                </Button>
              )}
            </PDFDownloadLink>
          )}

          <Button 
            variant="outline" 
            className="flex-1 h-14 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
            onClick={() => router.push("/")}
          >
            <Home className="w-3 h-3 mr-2" />
            Back to Terminal
          </Button>
        </div>

        {/* Security Footer */}
        <div className="flex flex-col items-center gap-4 opacity-20">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500">
              Biometric Pass Linked to Identity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}