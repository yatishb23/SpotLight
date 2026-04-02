import { DashboardNav } from "@/components/dashboard-sidebar";

export const metadata = {
  title: "Dashboard - EventHub",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Switched to flex-col to stack the horizontal nav and content
    <div className="flex flex-col min-h-screen bg-[#050505] text-neutral-200">
      {/* DashboardNav now acts as a secondary sticky header.
          It will sit right below the main SiteHeader.
      */}
      <DashboardNav />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Added a subtle entrance animation or spacing 
              to make the transition from nav to content smoother 
          */}
          <div className="animate-in fade-in duration-500">{children}</div>
        </div>
      </main>

      {/* Optional: Dashboard-specific background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/[0.02] blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
