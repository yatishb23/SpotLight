import { DashboardSidebar } from '@/components/dashboard-sidebar';

export const metadata = {
  title: 'Dashboard - EventHub',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background h-[calc(100vh-4rem)] overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
