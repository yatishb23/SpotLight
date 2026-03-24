"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CreditCard,
  Wallet,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function BookingSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const seatsData = searchParams.get("seats");
  const amountStr = searchParams.get("amount") || "0";
  const eventTitle = searchParams.get("eventTitle") || "Selected Event";
  const eventDate = searchParams.get("eventDate") || "";
  const eventVenue = searchParams.get("eventVenue") || "";
  const eventCity = searchParams.get("eventCity") || "";
  const ticketPrice = Number(searchParams.get("ticketPrice") || "0");
  const remainingSeats = Number(searchParams.get("remainingSeats") || "0");

  const selectedSeats = seatsData ? JSON.parse(seatsData) : [];
  const baseAmount = parseFloat(amountStr);
  const convenienceFee = baseAmount * 0.12; // 12%
  const totalAmount = baseAmount + convenienceFee;
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API call to confirm payment -> '/api/bookings/create'
      // Mocking 2 seconds delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();

      // Navigate to confirmation
      router.push(
        `/events/${eventId}/book/confirmation?bookingId=${bookingId}&total=${totalAmount.toFixed(2)}`,
      );
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!seatsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">No booking session found.</p>
        <Button onClick={() => router.push(`/events/${eventId}`)}>
          Go to Event
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Summary */}
        <div className="flex-1 space-y-6">
          <Card className="h-fit sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Event Details</h3>
                <p className="text-sm font-medium mt-1">{eventTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Event ID: {eventId}
                </p>
                {eventDate && (
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(eventDate).toLocaleString()}
                  </p>
                )}
                {(eventVenue || eventCity) && (
                  <p className="text-sm text-muted-foreground">
                    Venue: {eventVenue}
                    {eventCity ? `, ${eventCity}` : ""}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Ticket Price: {formatINR(ticketPrice)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Remaining Seats: {remainingSeats}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">
                  Selected Seats ({selectedSeats.length})
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedSeats.map((seat: any) => (
                    <div
                      key={seat.id}
                      className="bg-muted/50 p-2 rounded flex justify-between"
                    >
                      <span>
                        {seat.row}
                        {seat.number}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({seat.type})
                        </span>
                      </span>
                      <span>{formatINR(Number(seat.price || 0))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(baseAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Convenience Fees (12%)</span>
                  <span>{formatINR(convenienceFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total Payable</span>
                  <span className="text-primary">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Complete your purchase securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <RadioGroup
                  defaultValue="card"
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 gap-4"
                >
                  <div
                    className={`flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          Credit / Debit Card
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Visa, Mastercard, Amex
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <Label
                      htmlFor="upi"
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-semibold">UPI / Application</span>
                        <span className="text-xs text-muted-foreground">
                          GPay, PhonePe, Paytm
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "wallet" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  >
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label
                      htmlFor="wallet"
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <Wallet className="w-5 h-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Wallets</span>
                        <span className="text-xs text-muted-foreground">
                          PayPal, Apple Pay
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="grid gap-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid gap-2">
                      <Label>Card Number</Label>
                      <Input placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="grid gap-2">
                        <Label>CVV</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Card Holder Name</Label>
                      <Input placeholder="Name on card" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Actual payment processing is handled securely.
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatINR(totalAmount)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
