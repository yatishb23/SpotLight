'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SessionExpiredPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const reason = searchParams.get('reason') || 'timeout';
  const from = searchParams.get('from') || 'booking';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isFromPayment = from === 'payment';

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center px-6 py-20">
      <div
        className="max-w-sm w-full text-center space-y-8 transition-all duration-500"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
            <Clock className="w-7 h-7 text-red-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-medium text-white">Session expired</h1>
          <p className="text-[13px] text-white/40 leading-relaxed max-w-xs mx-auto">
            {isFromPayment
              ? 'Your payment session timed out. The order was cancelled and no charges were applied.'
              : 'Your 10-minute booking session expired. Selected seats have been released.'}
          </p>
        </div>

        {/* Status summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-left space-y-3">
          {[
            { label: 'Status', value: 'Expired', valueClass: 'text-red-400' },
            { label: 'Seats', value: 'Released', valueClass: 'text-white/40' },
            { label: 'Charges', value: '₹0', valueClass: 'text-emerald-400' },
          ].map(({ label, value, valueClass }) => (
            <div key={label} className="flex justify-between items-center text-[12px]">
              <span className="text-white/30">{label}</span>
              <span className={valueClass}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <Button
            onClick={() => router.push(`/events/${eventId}/book`)}
            className="w-full h-11 bg-white text-black hover:bg-white/90 text-[12px] font-semibold rounded-xl flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try again
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}
              className="h-10 border-white/[0.07] bg-transparent text-white/35 hover:text-white hover:bg-white/[0.05] text-[11px] rounded-xl">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Event
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}
              className="h-10 border-white/[0.07] bg-transparent text-white/35 hover:text-white hover:bg-white/[0.05] text-[11px] rounded-xl">
              <Home className="w-3 h-3 mr-1.5" /> Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}