"use client";

import { usePathname } from "next/navigation";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Boolean checks for cleaner code
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div>
      {/* Hide the category bar if we are on login or signup */}
      {!isAuthPage && <CategoryBar />}
      
      <main>{children}</main>
      
      {/* Only show the footer if we aren't in the dashboard */}
      {!isDashboard && <SiteFooter />}
    </div>
  );
}