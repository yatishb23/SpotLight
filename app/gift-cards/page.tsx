import { Button } from "@/components/ui/button";
import { Gift, CreditCard, Mail, Building } from "lucide-react";

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col items-center text-center border-b border-neutral-900 pb-16 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <Gift className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              ASSET_TRANSFER_PROTOCOL
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tighter text-white uppercase italic">
            Digital Access Cards.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic max-w-2xl">
            Distribute encrypted entertainment assets across the network. Optimal for milestone events, secure rewards, and targeted data transfers.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Physical Gift Cards */}
          <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden flex flex-col group hover:border-neutral-700 transition-colors">
            <div className="h-48 border-b border-neutral-900 bg-[#050505] relative flex items-center justify-center overflow-hidden">
               {/* Aesthetic Background */}
               <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent opacity-50" />
               <CreditCard className="h-16 w-16 text-neutral-700 group-hover:text-neutral-500 transition-colors relative z-10" />
               <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-black text-neutral-600">Type: Physical</div>
               <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest font-mono text-neutral-600">ID: N-3942</div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Hardware Tokens</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-mono mb-8 flex-grow">
                Physical, cryptographic access cards routed and dispatched directly to localized coordinates via secure transit channels.
              </p>
              <Button className="w-full bg-neutral-900 text-white hover:bg-white hover:text-black border border-neutral-800 h-10 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all">Procure Hardware</Button>
            </div>
          </div>

          {/* E-Gift Cards */}
          <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden flex flex-col group hover:border-neutral-700 transition-colors">
            <div className="h-48 border-b border-neutral-900 bg-[#050505] relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent opacity-50" />
               <Mail className="h-16 w-16 text-blue-900/40 group-hover:text-blue-500/60 transition-colors relative z-10" />
               <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-black text-blue-900/60">Type: Digital</div>
               <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest font-mono text-blue-900/60">ID: E-9981</div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Digital Packets</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-mono mb-8 flex-grow">
                Instantaneous routing via active comm-links. Ideal for immediate transmission and time-critical rewards.
              </p>
              <Button className="w-full bg-neutral-900 text-white hover:bg-white hover:text-black border border-neutral-800 h-10 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all">Transmit Protocol</Button>
            </div>
          </div>

          {/* Corporate Gift Cards */}
           <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden flex flex-col group hover:border-neutral-700 transition-colors lg:col-span-1 md:col-span-2">
            <div className="h-48 border-b border-neutral-900 bg-[#050505] relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent opacity-50" />
               <Building className="h-16 w-16 text-emerald-900/40 group-hover:text-emerald-500/60 transition-colors relative z-10" />
               <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-black text-emerald-900/60">Type: Enterprise</div>
               <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest font-mono text-emerald-900/60">BATCH: B-001</div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Bulk Asset Initialization</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-mono mb-8 flex-grow">
                Scale your rewards with enterprise bulk routing. Configurable metadata and custom network branding available.
              </p>
              <Button className="w-full bg-neutral-900 text-white hover:bg-white hover:text-black border border-neutral-800 h-10 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all">Establish Link</Button>
            </div>
          </div>
        </div>

        {/* Ledger Balance Check */}
        <section className="mt-16 border-t border-neutral-900 pt-16 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">Query Asset Ledger</h2>
            <p className="text-xs text-neutral-500 font-mono">Input parameters to verify available encrypted funds.</p>
          </div>
          
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden">
             {/* Glow */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-neutral-800/30 blur-[50px] rounded-full pointer-events-none" />
             
             <form className="space-y-4 relative z-10">
                <div className="space-y-2">
                   <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Secure Hash Map (16 Digits)</label>
                   <input className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors font-mono tracking-widest" placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Authentication PIN (6 Digits)</label>
                   <input type="password" className="bg-[#050505] border border-neutral-800 text-sm h-12 w-full rounded-xl px-4 focus:ring-1 focus:ring-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 transition-colors font-mono" placeholder="******" />
                </div>
                <div className="pt-2">
                  <Button type="button" className="w-full bg-white text-black hover:bg-neutral-200 h-12 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl">Execute Query</Button>
                </div>
             </form>
          </div>
        </section>
      </div>
    </div>
  );
}
