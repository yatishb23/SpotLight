import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col border-b border-neutral-900 pb-10 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              SYSTEM_KNOWLEDGEBASE
            </span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white uppercase italic">
            Knowledge Access.
          </h1>
          <p className="text-sm text-neutral-500 font-light italic">
            Query index for protocols, system settlements, and general navigation procedures.
          </p>
        </header>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border-neutral-900 bg-[#0a0a0a] px-6 rounded-2xl border">
            <AccordionTrigger className="text-white hover:text-neutral-300 font-medium tracking-tight uppercase hover:no-underline py-6">
              How do I establish an access token (booking)?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 font-light leading-relaxed pb-6 text-sm">
              Navigating the network is fully streamlined. Inject your query into the search terminal or browse the active classifications. Once you identify a viable event node, execute the "Initialize Pass" protocol, select your allocation, and finalize settlement via the secure gateway.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-neutral-900 bg-[#0a0a0a] px-6 rounded-2xl border">
            <AccordionTrigger className="text-white hover:text-neutral-300 font-medium tracking-tight uppercase hover:no-underline py-6">
              Can I reverse a ledger settlement (cancel)?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 font-light leading-relaxed pb-6 text-sm">
              Reversal protocols are strictly dictated by the localized event node (organizer). Audit the reversal policy integrated within the event metadata parameters prior to executing your transaction. Allowed reversals can be initiated via your "My Ledger" array.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="border-neutral-900 bg-[#0a0a0a] px-6 rounded-2xl border">
            <AccordionTrigger className="text-white hover:text-neutral-300 font-medium tracking-tight uppercase hover:no-underline py-6">
              Where are my digital passes stored?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 font-light leading-relaxed pb-6 text-sm">
              All active passes are securely vaulted in the "My Bookings" module attached to your Identity. Additionally, cryptographic receipts and passes are transmitted securely to your registered communication channel (email).
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="border-neutral-900 bg-[#0a0a0a] px-6 rounded-2xl border">
            <AccordionTrigger className="text-white hover:text-neutral-300 font-medium tracking-tight uppercase hover:no-underline py-6">
              Is batch synchronization supported (group discounts)?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 font-light leading-relaxed pb-6 text-sm">
              Affirmative. For bulk data execution (10+ units), intercept our Corporate access protocols or interface directly with the network support technicians for tiered settlement parameters.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5" className="border-neutral-900 bg-[#0a0a0a] px-6 rounded-2xl border">
            <AccordionTrigger className="text-white hover:text-neutral-300 font-medium tracking-tight uppercase hover:no-underline py-6">
              Are transmission layers secure?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 font-light leading-relaxed pb-6 text-sm">
              Absolute security. Our architecture leverages maximum-grade node encryption methodologies masking all interaction with our verified settlement gateways. Your structural data remains uncompromised.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
