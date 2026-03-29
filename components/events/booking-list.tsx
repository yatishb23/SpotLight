import { Badge } from "@/components/ui/badge";

export const BookingList = ({ bookings, formatCurrency }: any) => {
  if (bookings.length === 0) {
    return <div className="py-12 text-center text-neutral-500 bg-neutral-900/20 rounded-xl border border-dashed border-neutral-800">No bookings found matching filters.</div>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking: any) => (
        <div key={booking.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-100">{booking.userName || "Unknown User"}</span>
            <span className="text-xs text-neutral-500">{booking.userEmail}</span>
            <span className="text-[10px] text-neutral-600 font-mono mt-1">ID: {booking.id}</span>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Tickets</p>
              <p className="font-bold text-neutral-200">{booking.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total Paid</p>
              <p className="font-bold text-emerald-400">{formatCurrency(booking.totalAmount)}</p>
            </div>
            <Badge variant="outline" className="bg-neutral-950 border-neutral-800 text-neutral-400 capitalize">
              {booking.status?.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};