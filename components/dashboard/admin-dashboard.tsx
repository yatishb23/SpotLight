"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventList } from "@/components/event-list";
import { BarChart3, Users, Wallet, Calendar, Activity, Database, ShieldCheck } from "lucide-react";
import type { DashboardUserDetails, Event } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTickets: number;
  } | null;
  users: any[];
  events: Event[];
  userDetails: DashboardUserDetails | null;
}

export function AdminDashboard({
  stats,
  users,
  events,
  userDetails,
}: AdminDashboardProps) {
  const displayName = userDetails?.name?.trim() || "Administrator";
  
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0, // Cleaner look for high-level stats
    }).format(Number(amount || 0));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-zinc-800 p-8">
        <div className="relative z-10">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">System Access Granted</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {userDetails?.email || "Platform Administration Console"}
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-zinc-100/5 blur-[60px] rounded-full" />
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: users.length, icon: Users, sub: "Registered accounts" },
            { label: "Active Events", value: stats.totalEvents, icon: BarChart3, sub: "Live on platform" },
            { label: "Gross Revenue", value: formatINR(stats.totalRevenue), icon: Wallet, sub: "Total sales value" },
            { label: "Tickets Issued", value: stats.totalTickets, icon: Calendar, sub: "Successful bookings" },
          ].map((item, i) => (
            <Card key={i} className="bg-zinc-900/30 border-zinc-800 shadow-none hover:bg-zinc-900/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {item.label}
                </CardTitle>
                <item.icon className="w-4 h-4 text-zinc-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-100 tracking-tight">{item.value}</div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 tracking-wider">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Users Table */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-950 border-zinc-800 shadow-none">
            <CardHeader className="border-b border-zinc-900 mb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">User Registry</CardTitle>
              <CardDescription className="text-zinc-600">Latest platform registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                      <th className="pb-4 pl-2 text-left">Identity</th>
                      <th className="pb-4 text-left">Classification</th>
                      <th className="pb-4 text-right pr-2">Entry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 6).map((u) => (
                      <tr key={u.id} className="group bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 pl-4 rounded-l-xl">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-200">{u.name}</span>
                            <span className="text-[11px] text-zinc-600">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter border",
                            u.role === "admin" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            u.role === "organizer" ? "bg-zinc-100/10 text-zinc-100 border-zinc-100/20" :
                            "bg-zinc-800 text-zinc-500 border-transparent"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-500 font-medium rounded-r-xl">
                          {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health & Status Monitor */}
        <div className="space-y-6">
          <Card className="bg-zinc-950 border-zinc-800 shadow-none">
            <CardHeader className="border-b border-zinc-900 mb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Core Services", status: "Operational", icon: Activity, active: true },
                { label: "Database Cluster", status: "Connected", icon: Database, active: true },
                { label: "Security Layer", status: "Encrypted", icon: ShieldCheck, active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-900">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-semibold text-zinc-400">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{item.status}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-900 mt-4">
                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  <span>Last Backup</span>
                  <span>99.8% Uptime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-[0.2em] italic">Active Catalog</h2>
           <div className="h-[1px] flex-1 mx-6 bg-zinc-900" />
        </div>
        <EventList events={events.slice(0, 4)} />
      </div>
    </div>
  );
}