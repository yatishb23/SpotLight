"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Ticket, Printer, Download, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "@/components/qr-code-display"; // Assuming it exists or I create it
import { confetti } from "canvas-confetti"; // Need to check if this package exists, if not use simple animation

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const eventId = params.id as string;

  const bookingId = searchParams.get("bookingId");
  const totalAmount = searchParams.get("total");
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading details
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 md:px-6">
      <Card className="border-green-500/20 bg-green-50/10 dark:bg-green-900/10 overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-100 dark:bg-green-900/40 p-3 rounded-full mb-4 w-fit">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
            Booking Confirmed!
          </CardTitle>
          <CardDescription className="text-lg">
            Your tickets have been sent to your email.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-background border rounded-xl p-6 shadow-sm relative overflow-hidden">
            {/* Ticket Stub Design */}
            <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-slate-50 border border-r-0 border-slate-200 z-10" />
            <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-slate-50 border border-l-0 border-slate-200 z-10" />
            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-slate-200" />
            <div className="relative z-0 space-y-4">
              <div className="flex justify-between items-start pb-4">
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-wider text-muted-foreground text-xs mb-1">
                    Event Details
                  </h3>
                  <p className="font-bold text-lg">Neon Dreams Concert</p>{" "}
                  {/* Mock Title */}
                  <p className="text-sm text-muted-foreground">
                    Madison Square Garden
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-xl uppercase tracking-wider text-muted-foreground text-xs mb-1">
                    Date & Time
                  </h3>
                  <p className="font-bold text-lg">Mar 22, 2026</p>
                  <p className="text-sm text-muted-foreground">08:00 PM</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-end">
                <div className="bg-white p-2 rounded shadow-sm border">
                  {/* QR Code Placeholder */}
                  <QRCodeDisplay value={`booking-${bookingId}`} size={120} />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                    Booking ID
                  </p>
                  <p className="font-mono text-xl font-bold tracking-widest">
                    {bookingId}
                  </p>
                  <p className="text-sm text-primary font-semibold mt-2">
                    Total Paid: {formatINR(Number(totalAmount || 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Share2 className="w-4 h-4" /> Share Ticket
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-2">
          <Button className="w-full sm:w-auto" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
