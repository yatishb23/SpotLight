"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  RotateCcw, 
  XCircle, 
  Home,
  ShieldAlert 
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SessionExpiredPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const reason = searchParams.get("reason") || "timeout";
  const from = searchParams.get("from") || "booking";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTimeout = reason === "timeout";
  const isFromPayment = from === "payment";

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center px-6 py-20 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #ef4444 0%, transparent 70%)",
            animation: "pulse-slow 4s ease-in-out infinite",
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, #f97316 0%, transparent 70%)",
            animation: "pulse-slow 6s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div 
        className="max-w-lg w-full space-y-8 relative z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div 
            className="relative"
            style={{
              animation: mounted ? "float 3s ease-in-out infinite" : "none",
            }}
          >
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
              {isTimeout ? (
                <Clock className="w-10 h-10 text-red-400" />
              ) : (
                <ShieldAlert className="w-10 h-10 text-red-400" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
              <XCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-white italic">
              Session Expired.
            </h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-red-400/80 font-black">
              {isTimeout ? "10:00 Protocol Timeout" : "Transaction Interrupted"}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-8">
            {/* Alert Message */}
            <div className="flex items-start gap-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {isTimeout
                    ? "Your 10-minute booking session has expired. All selected seats have been released back to the inventory."
                    : "Your payment session has timed out. The order has been cancelled and seats have been released."}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                  No charges have been applied to your account
                </p>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Status</span>
                <span className="text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  EXPIRED
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Reason</span>
                <span className="text-xs font-mono text-neutral-400">
                  {isTimeout ? "SESSION_TIMEOUT" : "PAYMENT_TIMEOUT"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Seats</span>
                <span className="text-xs font-mono text-neutral-400">RELEASED</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Charges</span>
                <span className="text-xs font-mono text-emerald-400">₹0.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => router.push(`/events/${eventId}/book`)}
                className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                Retry Booking
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}`)}
                  className="h-14 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Event Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="h-14 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-3 h-3" />
                  Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="flex flex-col items-center gap-3 opacity-30">
          <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-500 font-bold text-center">
            Session protocols ensure fair access for all users
          </p>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.03; }
          50% { transform: scale(1.2); opacity: 0.06; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
