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
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createOrder, verifyPayment } from "@/lib/api";

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

  // ✅ FIXED seat parsing
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

    // seats like "A1,A2,A3"
    const parsedSeats = seatsData ? seatsData.split(",") : [];

    return {
      selectedSeats: parsedSeats,
      bookingId: searchParams.get("bookingId") || "",
      eventTitle: searchParams.get("eventTitle") || "Selected Event",
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
    }).format(amount);

  // ✅ Create order
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
        console.error(err);
        toast.error("Failed to initialize payment");
      } finally {
        setIsInitializing(false);
      }
    };

    initOrder();
  }, [bookingId, totalAmount, order]);

  // ✅ Razorpay handler
  const handleRazorpayPayment = useCallback(async () => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    if (!order?.orderId) {
      toast.error("Order not ready");
      return;
    }

    setIsLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amountInPaise,
      currency: order.currency || "INR",
      name: "Event Platform",
      description: `Booking for ${eventTitle}`,
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
            toast.success("Payment Verified!");
            router.push(
              `/events/${eventId}/book/confirmation?bookingId=${bookingId}`
            );
          }
        } catch (err) {
          console.error(err);
          toast.error("Verification failed");
        } finally {
          setIsLoading(false);
        }
      },

      prefill: {
        email: "user@example.com",
        contact: "9999999999",
      },

      theme: { color: "#3b82f6" },

      modal: {
        ondismiss: () => setIsLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [order, bookingId, eventId, eventTitle, router]);

  if (!searchParams.get("seats")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">
          No active booking session found.
        </p>
        <Button onClick={() => router.push(`/events/${eventId}`)}>
          Return to Event
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Confirm Your Booking
          </CardTitle>
          <CardDescription>
            Review your details before payment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Info */}
          <div className="bg-primary/5 p-4 rounded-xl border">
            <h3 className="font-bold text-lg">{eventTitle}</h3>
            <p className="text-sm text-muted-foreground">
              📅{" "}
              {eventDate
                ? new Date(eventDate).toLocaleDateString("en-IN")
                : "Date TBD"}
            </p>
            <p className="text-sm text-muted-foreground">
              📍 {eventVenue}
              {eventCity ? `, ${eventCity}` : ""}
            </p>
          </div>

          {/* Seats */}
          <div>
            <h3 className="font-semibold mb-3 flex justify-between">
              <span>Seats</span>
              <span className="text-sm text-muted-foreground">
                {selectedSeats.length} Tickets
              </span>
            </h3>

            <div className="space-y-2">
              {selectedSeats.map((seat: string, index: number) => (
                <div
                  key={`${seat}-${index}`} // ✅ FIXED
                  className="flex justify-between text-sm border-b py-2"
                >
                  <span>Seat {seat}</span>
                  <span>
                    {formatINR(baseAmount / selectedSeats.length)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatINR(baseAmount)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Convenience Fee</span>
              <span>{formatINR(convenienceFee)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatINR(totalAmount)}</span>
            </div>

            <p className="text-xs flex items-center gap-1 text-green-600">
              <ShieldCheck className="w-3 h-3" /> Secure Payment
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleRazorpayPayment}
            disabled={isLoading || isInitializing || !order}
            className="w-full h-14 text-lg"
          >
            {isLoading || isInitializing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2" /> Pay Now
              </>
            )}
          </Button>

          <Button variant="ghost" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}