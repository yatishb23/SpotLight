export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col border-b border-neutral-900 pb-10 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              DOCUMENT: TERMS_CONDITIONS
            </span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white uppercase italic">
            Terms of Service.
          </h1>
          <p className="text-sm text-neutral-500 font-mono italic">Last synchronized: March 17, 2026</p>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-neutral max-w-none text-neutral-400 marker:text-neutral-600 prose-headings:text-neutral-200 prose-headings:font-medium prose-headings:tracking-tight prose-headings:uppercase prose-a:text-white hover:prose-a:text-neutral-300">
          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4">1. Introduction</h2>
          <p>
            Welcome to the EventHub Network. By accessing or executing operations within our system, you agree to be bound by these System Protocols (Terms of Service) and our Data Governance Policy. If you do not authorize these protocols, please terminate your connection immediately.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">2. Event Booking & Ledger Settlement</h2>
          <p>
            All access tokens (bookings) are subject to network availability. Valuation (prices) may fluctuate prior to final ledger confirmation. Settlement must be executed in full at the time of token initialization unless overridden by an admin protocol.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">3. Identity Responsibilities</h2>
          <p>
            You are mandated to maintain strict confidentiality of your cryptographic access keys (account information) and are liable for all operations executed under your Registry ID. You agree to provide verifiably accurate metadata when initializing your identity.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">4. Connection Termination & Reversals</h2>
          <p>
            Token reversal (refund) policies are strictly determined by the organizing node. Please audit the specific policy embedded in the event metadata before executing a transaction. Network processing fees are immutable and non-refundable unless a systemic failure occurs or the node is unmounted by the organizer.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">5. Protected System Assets</h2>
          <p>
            All structural components within this system interface, including algorithmic logic, visual arrays, node architectures, and embedded software, remain the exclusive property of EVENTHUB GLOBAL INC. and are shielded by global encryption intellectual property laws.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">6. Liability Limitations</h2>
          <p>
            The EventHub Network shall not assume liability for any indirect, incidental, special, or consequential data loss or systemic damages, including without limitation, loss of uptime, revenue, goodwill, or auxiliary intangible assets stemming from usage of this interface.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">7. Communication Protocol</h2>
          <p>
            To transmit queries concerning these Protocols, initialize a connection to <strong>legal@eventhub.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
