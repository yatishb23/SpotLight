"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/TicketPDF";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Loader2, 
  Download, 
  QrCode, 
  ArrowUpRight, 
  ShieldCheck,
  Calendar,Ticket,Wallet,Info
} from "lucide-react";
import { getUserBookings } from "@/lib/api";

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await getUserBookings(session.user.id);
        setBookings(response.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
      </div>
    );
  }

  const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-900 transition">
      
      {/* Icon */}
      <div className="text-zinc-400 mt-1">
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm text-zinc-200 font-medium mt-1">
          {value}
        </span>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <header className="space-y-4 border-b border-neutral-900 pb-12">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Verified Identity Ledger</span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white">My Bookings.</h1>
        </header>

        {/* Bookings List */}
        <div className="grid gap-8">
          {bookings.map((booking) => (
            <div key={booking.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-800 to-neutral-950 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
              <Card className="relative bg-[#050505] border-neutral-900 rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Visual Identity (QR Area) */}
                  <div className="bg-neutral-900/50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-neutral-900">
                    <div className="relative p-2 bg-white rounded-lg">
                       <img 
                          src={`data:image/png;base64,${booking.qr}`} 
                          alt="Pass QR" 
                          className="w-24 h-24 grayscale hover:grayscale-0 transition-all duration-500" 
                        />
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{booking.eventName}</h3>
                        <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
                          <span>REF: {booking.id.slice(0, 8)}</span>
                          <span className="flex items-center gap-1 uppercase"><Calendar className="w-3 h-3"/> {new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] tracking-widest px-3 py-1">
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex items-end justify-between pt-8 border-t border-neutral-900">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-1">Pass Value</p>
                        <p className="text-2xl font-medium text-white tracking-tighter">
                          {booking.currency} {booking.totalAmount}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" className="text-neutral-500 hover:text-white hover:bg-neutral-900 text-[10px] uppercase font-bold tracking-widest">
                             Details <Info className="w-3 h-3 ml-2" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-[#050505] border-neutral-900 text-neutral-200 w-[400px]">
                          <SheetHeader className="mb-10">
                            <SheetTitle className="text-white tracking-tighter text-2xl">Pass Details</SheetTitle>
                          </SheetHeader>
                          
                          <div className="space-y-8">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Event Designation</p>
                              <p className="text-lg font-medium text-white">{booking.eventName}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                              <DetailItem label="Quantity" value={`${booking.quantity} Units`} icon={<Ticket size={14}/>} />
                              <DetailItem label="Registry Date" value={new Date(booking.createdAt).toLocaleDateString()} icon={<Calendar size={14}/>} />
                              <DetailItem label="Total Paid" value={`${booking.currency} ${booking.totalAmount}`} icon={<Wallet size={14}/>} />
                              <DetailItem label="Unit Price" value={`${booking.currency} ${booking.unitPrice}`} icon={<ArrowUpRight size={14}/>} />
                            </div>

                            <div className="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800 flex flex-col items-center gap-4">
                               <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Digital Entry Permit</p>
                               <div className="bg-white p-3 rounded-lg">
                                  <img src={`data:image/png;base64,${booking.qr}`} className="w-32 h-32" />
                               </div>
                            </div>
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
                              className="bg-white text-black hover:bg-neutral-200 font-bold uppercase text-[10px] tracking-widest px-8 rounded-full h-11"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <span className="flex items-center gap-2">
                                  Download Pass <Download className="w-3 h-3" />
                                </span>
                              )}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}