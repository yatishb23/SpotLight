'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Shield, Users, Calendar, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';

const PENDING_EVENTS = [
  { id: 101, title: 'Summer Jazz Festival', organizer: 'City Vibes', date: '2026-06-15', status: 'pending' },
  { id: 102, title: 'Startup Pitch Night', organizer: 'TechHub', date: '2026-05-20', status: 'pending' },
  { id: 103, title: 'Charity Gala', organizer: 'Hope Fdn.', date: '2026-07-01', status: 'flagged' },
];

export default function AdminDashboardPage() {
  const [events, setEvents] = useState(PENDING_EVENTS);

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    setEvents(events.filter(e => e.id !== id));
    toast.success(`Event ${action === 'approve' ? 'Approved' : 'Rejected'}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col border-b border-neutral-900 pb-10 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <Cpu className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500 font-mono">
              RESTRICTED_ACCESS
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-white uppercase italic">
            Global Sync Console.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic">
            Root access established. Manage system integrity, active payloads, and verify unauthorized node attempts.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-3xl flex flex-col justify-between h-40 group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Identity Nodes</span>
              <Users className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <div className="text-4xl font-medium tracking-tighter text-white">12,345</div>
              <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-widest mt-1">Delta: +18% (Cycle 4)</p>
            </div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-3xl flex flex-col justify-between h-40 group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Active Payloads</span>
              <Calendar className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <div className="text-4xl font-medium tracking-tighter text-white">573</div>
              <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-widest mt-1">Delta: +50 (Current)</p>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl flex flex-col justify-between h-40 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Verification Queue</span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <div className="text-4xl font-medium tracking-tighter text-white">{events.length}</div>
              <p className="text-[10px] uppercase font-mono text-neutral-400 tracking-widest mt-1">Require Authorization</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-neutral-900 flex justify-between items-center bg-[#050505]">
            <div>
              <h2 className="text-xl font-medium tracking-tight text-white uppercase italic">Payload Verification Array</h2>
              <p className="text-xs text-neutral-500 font-mono mt-1">Review injected metadata before finalizing sync to global ledger.</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-neutral-700 hidden sm:block" />
          </div>
          
          <div className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-neutral-900 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-600 h-14">Payload Designation</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Origin Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Sync Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Status Array</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-600 text-right">Execute Protocol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center text-neutral-600 h-40 text-xs font-mono uppercase tracking-widest">
                      Zero payloads detected in queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map(event => (
                    <TableRow key={event.id} className="border-b border-neutral-900/50 hover:bg-neutral-900/20 transition-colors">
                      <TableCell className="font-semibold text-white tracking-tight">{event.title}</TableCell>
                      <TableCell className="font-mono text-xs text-neutral-400">{event.organizer}</TableCell>
                      <TableCell className="font-mono text-xs text-neutral-500">{(event as any).startDatetime ? new Date((event as any).startDatetime).toLocaleDateString() : (event as any).date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                          event.status === 'flagged' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}>
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 text-red-500 hover:text-red-400 hover:bg-red-950 hover:border-red-900" onClick={() => handleAction(event.id, 'reject')}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950 hover:border-emerald-900" onClick={() => handleAction(event.id, 'approve')}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
