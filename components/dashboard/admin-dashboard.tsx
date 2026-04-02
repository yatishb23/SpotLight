'use client';
 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventList } from '@/components/event-list';
import { BarChart3, Users, Wallet, Calendar, Activity, Database, ShieldCheck } from 'lucide-react';
import type { DashboardUserDetails, Event } from '@/lib/types';
import { cn } from '@/lib/utils';
 
interface AdminDashboardProps {
  stats: { totalEvents: number; totalRevenue: number; totalTickets: number } | null;
  users: any[];
  events: Event[];
  userDetails: DashboardUserDetails | null;
}
 
export function AdminDashboard({ stats, users, events, userDetails }: AdminDashboardProps) {
  const displayName = userDetails?.name?.trim() || 'Administrator';
 
  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));
 
  return (
    <div className="space-y-10">
 
      {/* Welcome */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7">
        <p className="text-[11px] text-white/25 mb-1">Administrator</p>
        <h1 className="text-xl font-light text-white">Welcome back, {displayName}</h1>
        {userDetails?.email && <p className="text-[12px] text-white/30 mt-0.5">{userDetails.email}</p>}
      </div>
 
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Users', value: users.length, icon: Users },
            { label: 'Events', value: stats.totalEvents, icon: BarChart3 },
            { label: 'Revenue', value: formatINR(stats.totalRevenue), icon: Wallet },
            { label: 'Tickets', value: stats.totalTickets, icon: Calendar },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-white/25 uppercase tracking-widest">{item.label}</span>
                <item.icon className="w-3.5 h-3.5 text-white/15" />
              </div>
              <p className="text-2xl font-light text-white">{item.value}</p>
            </div>
          ))}
        </div>
      )}
 
      <div className="grid gap-6 lg:grid-cols-3">
 
        {/* Users table */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-[12px] font-medium text-white/60">Recent users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">User</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">Role</th>
                  <th className="text-right px-6 py-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 6).map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-white/70">{u.name}</div>
                      <div className="text-[10px] text-white/25">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'text-[9px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-md border',
                        u.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        u.role === 'organizer' ? 'bg-white/10 text-white/60 border-white/15' :
                        'bg-white/[0.04] text-white/30 border-white/[0.06]'
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-white/30">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* System health */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-[12px] font-medium text-white/60">System status</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Services', status: 'Operational', icon: Activity },
              { label: 'Database', status: 'Connected', icon: Database },
              { label: 'Security', status: 'Active', icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-[12px] text-white/40">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-500">{item.status}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[10px] text-white/20 pt-2 px-1">
              <span>Uptime</span>
              <span>99.8%</span>
            </div>
          </div>
        </div>
      </div>
 
      {/* Events */}
      <div>
        <h2 className="text-[11px] text-white/30 uppercase tracking-widest mb-5">All events</h2>
        <EventList events={events.slice(0, 4)} />
      </div>
    </div>
  );
}