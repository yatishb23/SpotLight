'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, CreditCard, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createOrder, deleteBooking, verifyPayment } from '@/lib/api';

declare global { interface Window { Razorpay: any; } }

export default function BookingSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [timer, setTimer] = useState(600);

  const handleChangeSeats = async () => {
    try{
      const response = await deleteBooking(bookingId);
      console.log(response);
      
      if(response.success){
        toast.success('Seats released. Please select new seats.');
        router.push(`/events/${eventId}/book`);
      }
      else{
        toast.error('Failed to change seats. Please try again.');
      }
    }
    catch{
      toast.error('Failed to change seats. Please try again.');
    }
  }

  const { selectedSeats, bookingId, eventTitle, eventDate, eventVenue, baseAmount } = useMemo(() => {
    const seatsData = searchParams.get('seats');
    return {
      selectedSeats: seatsData ? seatsData.split(',') : [],
      bookingId: searchParams.get('bookingId') || '',
      eventTitle: searchParams.get('eventTitle') || 'Event',
      eventDate: searchParams.get('eventDate') || '',
      eventVenue: searchParams.get('eventVenue') || '',
      baseAmount: parseFloat(searchParams.get('amount') || '0'),
    };
  }, [searchParams]);

  const convenienceFee = baseAmount * 0.12;
  const totalAmount = baseAmount + convenienceFee;

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  useEffect(() => {
    if (!bookingId || order) return;
    const initOrder = async () => {
      try {
        setIsInitializing(true);
        const response = await createOrder({ bookingId, amount: totalAmount, currency: 'INR' });
        if (!response) throw new Error('Order creation failed');
        const result = await response.json();
        setOrder(result.data);
      } catch {
        toast.error('Failed to create order. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };
    initOrder();
  }, [bookingId, totalAmount, order]);

  useEffect(() => {
    const STORAGE_KEY = `booking_session_${bookingId}`;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const remaining = Math.max(0, Math.floor((parseInt(stored, 10) - Date.now()) / 1000));
      setTimer(remaining);
    } else {
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
    if (!window.Razorpay || !order?.orderId) { toast.error('Payment gateway unavailable'); return; }
    setIsLoading(true);
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amountInPaise, currency: order.currency || 'INR',
      name: 'EventHub', description: eventTitle, order_id: order.orderId,
      handler: async (response: any) => {
        try {
          const verify = await verifyPayment({ ...response, bookingId, eventId });
          if (verify) {
            toast.success('Payment successful!');
            router.push(`/events/${eventId}/book/confirmation?bookingId=${bookingId}`);
          }
        } catch { toast.error('Payment verification failed'); }
        finally { setIsLoading(false); }
      },
      prefill: { email: 'user@example.com', contact: '9999999999' },
      theme: { color: '#000000' },
      modal: { ondismiss: () => setIsLoading(false) },
    };
    new window.Razorpay(options).open();
  }, [order, bookingId, eventId, eventTitle, router]);

  if (!searchParams.get('seats')) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white/30">
      <AlertCircle className="w-10 h-10" />
      <p className="text-[12px]">Session data missing.</p>
      <Button variant="outline" className="border-white/10 text-white/40 hover:bg-white/[0.05]" onClick={() => router.push(`/events/${eventId}`)}>
        Back to event
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-16 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl font-light text-white tracking-tight">Order summary</h1>
          <p className="text-[12px] text-white/30">Review your booking before payment</p>
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full mt-3">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-mono">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')} remaining
            </span>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="p-7 space-y-6">

            {/* Event info */}
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Event</p>
              <h3 className="text-[16px] font-medium text-white">{eventTitle}</h3>
              {eventDate && (
                <p className="text-[12px] text-white/35 mt-1">
                  {new Date(eventDate).toLocaleDateString('en-IN')}
                  {eventVenue ? ` · ${eventVenue}` : ''}
                </p>
              )}
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Seats */}
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Seats selected</p>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat, i) => (
                  <span key={i} className="px-3 py-1 bg-white/[0.05] border border-white/[0.06] rounded-lg text-[11px] font-mono text-white/50">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Price breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-[12px] text-white/40">
                <span>Subtotal ({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span>
                <span>{formatINR(baseAmount)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-white/40">
                <span>Convenience fee</span>
                <span>{formatINR(convenienceFee)}</span>
              </div>
              <Separator className="bg-white/[0.05]" />
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-white/60 font-medium">Total</span>
                <span className="text-2xl font-light text-white">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-7 pb-7 space-y-3">
            <Button
              onClick={handleRazorpayPayment}
              disabled={isLoading || isInitializing || !order}
              className="w-full h-11 bg-white text-black hover:bg-white/90 text-[12px] font-semibold rounded-xl flex items-center gap-2"
            >
              {isLoading || isInitializing ? <Loader2 className="animate-spin w-4 h-4" /> : (
                <><CreditCard className="w-4 h-4" /> Pay {formatINR(totalAmount)}</>
              )}
            </Button>
            <Button variant="ghost" onClick={() => {handleChangeSeats()}}
              className="w-full h-9 text-[11px] text-white/25 hover:text-white/60 transition-colors">
              <ArrowLeft className="w-3 h-3 mr-1" /> Change seats
            </Button>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
}