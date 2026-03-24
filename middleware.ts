import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Role-based access control
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;
    // Normalize role to lowercase for consistent checking
    const rawRole = (token?.role as string)?.toLowerCase();
    const role = rawRole === "super_admin" ? "admin" : rawRole;

    // Admin routes protection
    if (
      (path.startsWith("/dashboard/users") ||
        path.startsWith("/dashboard/events") ||
        path.startsWith("/admin")) &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Organizer routes protection
    if (
      (path.startsWith("/dashboard/create-event") ||
        path.startsWith("/dashboard/my-events")) &&
      role !== "organizer" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
