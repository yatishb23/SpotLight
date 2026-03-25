import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress

export function EventStats({ bookings, event }: { bookings: any[], event: any }) {
  const stats = bookings.reduce((acc, b) => {
    if (b.status === "CONFIRMED") {
      acc.revenue += Number(b.totalAmount || 0);
      acc.seats += Number(b.quantity || 0);
    }
    return acc;
  }, { revenue: 0, seats: 0 });

  const fillPercentage = (stats.seats / event.totalCapacity) * 100;

  return (
    <Card className="border-neutral-800 bg-neutral-900 shadow-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1 font-mono">GROSS REVENUE (CONFIRMED)</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Capacity Filled</span>
            <span className="font-mono">{stats.seats} / {event.totalCapacity}</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
             <div 
                className="h-full bg-emerald-500 transition-all" 
                style={{ width: `${Math.min(fillPercentage, 100)}%` }} 
             />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
            <div>
                <p className="text-xl font-semibold">{bookings.length}</p>
                <p className="text-[10px] text-neutral-500 uppercase">Total Orders</p>
            </div>
            <div>
                <p className="text-xl font-semibold">₹{event.ticketPrice}</p>
                <p className="text-[10px] text-neutral-500 uppercase">Ticket Price</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}