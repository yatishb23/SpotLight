import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Search } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col border-b border-neutral-900 pb-10 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              SYSTEM_COMMUNICATIONS
            </span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white uppercase italic">
            Transmission Link.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic max-w-xl">
            Require operational assistance? Initialize a direct communication link to the core support matrix nodes, available continuously.
          </p>
        </header>
      
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white uppercase">Active Channels</h2>
              <div className="h-[1px] w-12 bg-neutral-800 mb-8" />
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5 group">
                <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-neutral-900 group-hover:border-neutral-700 transition-colors">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">Encrypted Email</h3>
                  <p className="text-sm text-neutral-300 font-mono">support@eventhub.com</p>
                  <p className="text-sm text-neutral-300 font-mono">partners@eventhub.com</p>
                </div>
              </div>
              
               <div className="flex items-start gap-5 group">
                <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-neutral-900 group-hover:border-neutral-700 transition-colors">
                  <Phone className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">Voice Link</h3>
                  <p className="text-sm text-neutral-300 font-mono">+1 (555) 123-4567</p>
                  <p className="text-xs text-neutral-500 italic">Core Operations: 9am-6pm EST</p>
                </div>
              </div>

               <div className="flex items-start gap-5 group">
                <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-neutral-900 group-hover:border-neutral-700 transition-colors">
                  <MapPin className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">HQ Coordinates</h3>
                  <p className="text-sm text-neutral-300 font-mono leading-relaxed">
                    123 Event Array St, Cluster 400<br />
                    San Francisco_Node, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 md:p-12 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-10 w-32 h-32 bg-neutral-800/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="mb-8">
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-500 mb-2">Direct Terminal</h2>
              <p className="text-2xl font-medium tracking-tighter text-white italic">Transmit Data Array</p>
            </div>
            
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label htmlFor="first-name" className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Identity Alpha</label>
                  <Input id="first-name" placeholder="John" className="bg-[#050505] border-neutral-800 placeholder:text-neutral-700 h-12 text-sm focus:ring-1 focus:ring-neutral-700 transition-all rounded-xl" />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="last-name" className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Identity Beta</label>
                  <Input id="last-name" placeholder="Doe" className="bg-[#050505] border-neutral-800 placeholder:text-neutral-700 h-12 text-sm focus:ring-1 focus:ring-neutral-700 transition-all rounded-xl" />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Comms Endpoint (Email)</label>
                <Input id="email" type="email" placeholder="packet@domain.com" className="bg-[#050505] border-neutral-800 placeholder:text-neutral-700 h-12 text-sm focus:ring-1 focus:ring-neutral-700 transition-all rounded-xl" />
              </div>

               <div className="space-y-2.5">
                <label htmlFor="message" className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Data Payload</label>
                <Textarea id="message" placeholder="Initialize inquiry details here..." className="min-h-[160px] bg-[#050505] border-neutral-800 placeholder:text-neutral-700 text-sm focus:ring-1 focus:ring-neutral-700 transition-all rounded-xl resize-none p-4" />
              </div>

              <div className="pt-4 border-t border-neutral-900/50">
                <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 h-14 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl">Execute Transmission</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
