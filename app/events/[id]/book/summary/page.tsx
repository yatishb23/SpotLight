"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShieldCheck, CreditCard, AlertCircle, ArrowLeft, ReceiptText, Clock } from "lucide-react";
import { toast } from "sonner";
import { createOrder, verifyPayment } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [timer, setTimer] = useState(600);

  const {
    selectedSeats,
    bookingId,
    eventTitle,
    eventDate,
    eventVenue,
    eventCity,
    baseAmount,
  } = useMemo(() => {
    const seatsData = searchParams.get("seats");
    const parsedSeats = seatsData ? seatsData.split(",") : [];

    return {
      selectedSeats: parsedSeats,
      bookingId: searchParams.get("bookingId") || "",
      eventTitle: searchParams.get("eventTitle") || "Authorized Event",
      eventDate: searchParams.get("eventDate") || "",
      eventVenue: searchParams.get("eventVenue") || "",
      eventCity: searchParams.get("eventCity") || "",
      baseAmount: parseFloat(searchParams.get("amount") || "0"),
    };
  }, [searchParams]);

  const convenienceFee = baseAmount * 0.12;
  const totalAmount = baseAmount + convenienceFee;

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    if (!bookingId || order) return;

    const initOrder = async () => {
      try {
        setIsInitializing(true);
        const response = await createOrder({
          bookingId,
          amount: totalAmount,
          currency: "INR",
        });

        if (!response) throw new Error("Order creation failed");
        const result = await response.json();
        setOrder(result.data);
      } catch (err) {
        toast.error("Financial synchronization failed");
      } finally {
        setIsInitializing(false);
      }
    };

    initOrder();
  }, [bookingId, totalAmount, order]);

  // 10 minute session timer — persisted via sessionStorage
  useEffect(() => {
    const STORAGE_KEY = `booking_session_${bookingId}`;
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      const expiresAt = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimer(remaining);
    } else {
      // Set expiry 10 minutes from now
      sessionStorage.setItem(STORAGE_KEY, String(Date.now() + 600_000));
    }
  }, [bookingId]);

  useEffect(() => {
    if (timer <= 0) {
      sessionStorage.removeItem(`booking_session_${bookingId}`);
      router.push(`/events/${eventId}/book/session-expired?reason=timeout&from=payment`);
      return;
    }

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, bookingId, eventId, router]);

  const handleRazorpayPayment = useCallback(async () => {
    if (!window.Razorpay || !order?.orderId) {
      toast.error("Payment gateway offline");
      return;
    }

    setIsLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amountInPaise,
      currency: order.currency || "INR",
      name: "EventHub.",
      description: `Access Token: ${eventTitle}`,
      order_id: order.orderId,
      handler: async function (response: any) {
        try {
          const verify = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
            eventId,
          });

          if (verify) {
            toast.success("Transaction Secure");
            router.push(`/events/${eventId}/book/confirmation?bookingId=${bookingId}`);
          }
        } catch (err) {
          toast.error("Verification failed");
        } finally {
          setIsLoading(false);
        }
      },
      prefill: { email: "user@example.com", contact: "9999999999" },
      theme: { color: "#000000" },
      modal: { ondismiss: () => setIsLoading(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [order, bookingId, eventId, eventTitle, router]);

  if (!searchParams.get("seats")) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 text-neutral-400">
        <AlertCircle className="w-12 h-12 text-neutral-800" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Session Identity Lost</p>
        <Button variant="outline" className="border-neutral-800 hover:bg-neutral-900" onClick={() => router.push(`/events/${eventId}`)}>
          Return to Terminal
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-20 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
            <ReceiptText className="text-black w-6 h-6" />
          </div>
          <h1 className="text-4xl font-medium tracking-tighter text-white italic">Settlement Summary.</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold">Review Transaction Metadata</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-bold">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">remaining</span>
          </div>
        </div>

        <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            {/* Event Block */}
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Access Designation</p>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{eventTitle}</h3>
              <div className="flex gap-4 pt-2 text-[11px] text-neutral-500 font-mono">
                <span>{eventDate ? new Date(eventDate).toLocaleDateString("en-IN") : "DATE_TBD"}</span>
                <span className="text-neutral-800">|</span>
                <span>{eventVenue}</span>
              </div>
            </div>

            <Separator className="bg-neutral-800/50" />

            {/* Units Block */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Allocated Units</p>
                <Badge variant="outline" className="border-neutral-800 text-neutral-400">{selectedSeats.length} Tickets</Badge>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedSeats.map((seat, i) => (
                  <div key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
                    UNIT_{seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="bg-[#050505]/50 rounded-2xl p-6 border border-neutral-800/50 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 uppercase tracking-widest font-bold">Subtotal</span>
                <span className="font-mono text-neutral-300">{formatINR(baseAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 uppercase tracking-widest font-bold">Convenience Fee</span>
                <span className="font-mono text-neutral-300">{formatINR(convenienceFee)}</span>
              </div>
              <Separator className="bg-neutral-800/50" />
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white font-black">Final Valuation</span>
                <span className="text-3xl font-medium text-white tracking-tighter">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-10 pt-0 flex flex-col gap-4">
            <Button
              onClick={handleRazorpayPayment}
              disabled={isLoading || isInitializing || !order}
              className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isLoading || isInitializing ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <span className="flex items-center gap-2">
                   Authorize Payment <CreditCard className="w-4 h-4" />
                </span>
              )}
            </Button>

            <Button variant="ghost" onClick={() => router.back()} className="text-[10px] text-neutral-600 uppercase tracking-widest hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3 mr-2" /> Adjust Selection
            </Button>
          </CardFooter>
        </Card>

        {/* Security Footer */}
        <div className="flex flex-col items-center gap-4 opacity-30">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500">AES-256 Bit Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}