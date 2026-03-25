import { Badge } from "@/components/ui/badge";

export function BookingList({ bookings }: { bookings: any[] }) {
  if (bookings.length === 0) {
    return <div className="p-12 text-center text-neutral-500 italic">No bookings found for the selected criteria.</div>;
  }

  return (
    <div className="divide-y divide-neutral-800">
      {bookings.map((booking) => (
        <div key={booking.id} className="p-4 hover:bg-neutral-800/30 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium text-neutral-200">{booking.userName}</p>
            <p className="text-xs text-neutral-500 font-mono">{booking.id}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                {booking.quantity} Ticket(s)
              </span>
              <Badge className={
                booking.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                booking.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }>
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm font-semibold">₹{booking.totalAmount}</p>
          </div>
        </div>
      ))}
    </div>
  );
}