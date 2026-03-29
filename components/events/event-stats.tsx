export const EventStats = ({ summary, formatCurrency }: any) => {
  const stats = [
    { label: "Total Bookings", value: summary.totalBookings, color: "text-neutral-100" },
    { label: "Seats Filled", value: summary.totalSeats, color: "text-blue-400" },
    { label: "Gross Revenue", value: formatCurrency(summary.totalRevenue), color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-xl backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{stat.label}</p>
          <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};