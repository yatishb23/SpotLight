import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Users, Calendar, ShieldAlert } from "lucide-react";

export default function CorporatesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col items-center text-center border-b border-neutral-900 pb-16 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              ENTERPRISE_NODE_ACCESS
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tighter text-white uppercase italic">
            Corporate Array.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic max-w-2xl">
            Exclusive scaling solutions for employee engagement, secure client access, and high-volume data node booking operations.
          </p>
          <div className="pt-6">
             <Button className="bg-white text-black hover:bg-neutral-200 h-10 px-8 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl">Initialize Sales Protocol</Button>
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-[32px] group hover:border-neutral-700 transition-colors">
            <div className="h-12 w-12 bg-neutral-900 flex items-center justify-center rounded-2xl mb-6">
               <Building2 className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-white mb-2">Network Engagement</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-mono">
              Reward your node operators with cinema access tokens, event protocols, and digital experiences.
            </p>
            <ul className="space-y-3 font-mono text-[10px] uppercase text-neutral-400">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Bulk Access Discounts</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Team Excursions</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Digital Vouchers</li>
            </ul>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-[32px] group hover:border-neutral-700 transition-colors">
            <div className="h-12 w-12 bg-neutral-900 flex items-center justify-center rounded-2xl mb-6">
               <Users className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-white mb-2">Priority Client Routing</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-mono">
              Impress VIP targets with premium physical access and secured exclusive digital pathways.
            </p>
             <ul className="space-y-3 font-mono text-[10px] uppercase text-neutral-400">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Tier-1 VIP Access</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Isolated Node Screenings</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Dedicated Secure Concierge</li>
            </ul>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-[32px] group hover:border-neutral-700 transition-colors">
            <div className="h-12 w-12 bg-neutral-900 flex items-center justify-center rounded-2xl mb-6">
               <Calendar className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-white mb-2">Partner Integrations</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-mono">
              Bridge your corporate arrays directly with our event hosts for seamless operation executing.
            </p>
             <ul className="space-y-3 font-mono text-[10px] uppercase text-neutral-400">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Dedicated Venue Allocation</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Operations Management</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" /> Telemetry & Marketing</li>
            </ul>
          </div>
        </div>

        <div className="border border-neutral-900 rounded-[32px] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 lg:p-14 bg-[#0a0a0a]">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldAlert className="w-5 h-5 text-white" />
                 <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Initialize Partnership</h2>
              </div>
              <p className="text-xs text-neutral-500 font-mono leading-relaxed mb-10">
                Establish a direct link with our enterprise engineers to configure a localized solution tailored to your operational parameters.
              </p>
              
              <form className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors" placeholder="Operator Alpha" />
                   <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors" placeholder="Operator Beta" />
                 </div>
                 <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors" placeholder="Secure Corporate Email" />
                 <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors" placeholder="Entity Name (e.g. Cyberdyne)" />
                 <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors" placeholder="Comms Channel (Phone)" />
                 <div className="pt-4">
                   <Button className="w-full bg-white text-black hover:bg-neutral-200 h-12 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl">Submit Network Request</Button>
                 </div>
              </form>
            </div>
            
            <div className="p-10 lg:p-14 bg-[#050505] border-l border-neutral-900 flex flex-col justify-center">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase mb-8">Verified Connected Nodes</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">GOOGLE</div>
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">META</div>
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">AMAZON</div>
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">MICROSOFT</div>
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">NETFLIX</div>
                  <div className="h-16 border border-neutral-800 bg-[#0a0a0a] rounded-xl flex items-center justify-center font-black tracking-widest text-neutral-600 text-sm">SPOTIFY</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
