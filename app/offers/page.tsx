import { Button } from "@/components/ui/button";
import { Tag, Calendar, Banknote, ShieldCheck } from "lucide-react";

export default function OffersPage() {
  const offers = [
    {
      id: 1,
      bank: "HDFC Node",
      title: "100% Rebate Allocation",
      description: "Receive exact equivalent token generation on successful initialization via HDFC secure gateways.",
      code: "HDFC-100",
      validTill: "Cycle 4, 2024",
      type: "Payment Gateway"
    },
    {
      id: 2,
      bank: "ICICI Protocol",
      title: "25% Cashback Sync",
      description: "Initialize a 25% cryptographic rebate up to 100 credits via ICICI localized routing.",
      code: "ICICI-025",
      validTill: "Cycle 3, 2024",
      type: "Node Offer"
    },
    {
      id: 3,
      bank: "Amazon Core",
      title: "500 Credit Bonus",
      description: "Bypass standard routing via Amazon Core and receive a flat 500 credit allocation on 1000+ settlements.",
      code: "AMZ-500",
      validTill: "Cycle 2, 2024",
      type: "Wallet Array"
    },
     {
      id: 4,
      bank: "Registry Internal",
      title: "Academic Override",
      description: "Flat 50% discount parameter applied for verified academic identities during pre-meridian cycles.",
      code: "ACAD-050",
      validTill: "Persistent",
      type: "Internal Grant"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col items-center text-center border-b border-neutral-900 pb-16 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <Banknote className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              FINANCIAL_INCENTIVES
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tighter text-white uppercase italic">
            Economic Overrides.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic max-w-2xl">
            Active modifiers and rebate structures available for synchronized gateway settlements and verified network identities.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.id} className="relative bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden group hover:border-neutral-700 transition-colors flex flex-col">
              
              <div className="absolute top-6 right-6 z-10">
                 <div className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[9px] font-black tracking-widest uppercase text-neutral-500">
                   {offer.type}
                 </div>
              </div>

              <div className="p-8 pb-6 flex-grow">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-8 w-8 bg-neutral-900 rounded flex items-center justify-center">
                     <ShieldCheck className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{offer.bank}</span>
                </div>
                <h3 className="text-2xl font-medium tracking-tight text-white mb-4 line-clamp-1">{offer.title}</h3>
                <p className="text-xs text-neutral-500 font-mono leading-relaxed mb-6 line-clamp-3">
                  {offer.description}
                </p>
                
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                   <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                   Valid Till: {offer.validTill}
                </div>
              </div>

              <div className="p-6 bg-[#050505] border-t border-neutral-900 flex justify-between items-center group-hover:bg-neutral-900/30 transition-colors">
                <div className="font-mono font-bold text-sm tracking-widest text-neutral-400 select-all">
                  {offer.code}
                </div>
                <Button className="h-8 rounded-lg bg-white text-black hover:bg-neutral-200 text-[9px] font-black tracking-widest uppercase px-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">Inject Token</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
