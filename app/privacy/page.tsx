export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-neutral-800 py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col border-b border-neutral-900 pb-10 space-y-4">
          <div className="inline-flex w-fit items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
              DOCUMENT: DATA_GOVERNANCE
            </span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white uppercase italic">
            Privacy Protocol.
          </h1>
          <p className="text-sm text-neutral-500 font-mono italic">Last synchronized: March 17, 2026</p>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-neutral max-w-none text-neutral-400 marker:text-neutral-600 prose-headings:text-neutral-200 prose-headings:font-medium prose-headings:tracking-tight prose-headings:uppercase prose-a:text-white hover:prose-a:text-neutral-300">
          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4">1. Data Ingestion Matrix</h2>
          <p>
            <strong>Personal Data Arrays:</strong> The system collects cryptographic packets you provide directly when initializing an identity, establishing a booking token, or pinging support (e.g., identity handle, secure email, numerical identifiers).
          </p>
          <p>
            <strong>Telemetry Data:</strong> We automatically log interactions within the network interfaces, including access nodes (IP), connection type, and internal packet trace routes.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">2. Analytics & Utilization</h2>
          <p>
            Your packets are utilized to:
          </p>
          <ul>
            <li>Maintain connection stability across the core network.</li>
            <li>Process and verify ledger settlements (bookings).</li>
            <li>Broadcast transmission signals regarding node updates or verified promotions.</li>
            <li>Enhance interface response times and aesthetic algorithms.</li>
            <li>Detect and neutralize rogue access attempts.</li>
          </ul>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">3. Matrix Distribution</h2>
          <p>
            We do not engage in unauthorized selling of your packet arrays. Transmissions are strictly routed to:
          </p>
          <ul>
            <li>Authorized Event Nodes (organizers) specifically for fulfillment validation.</li>
            <li>Encrypted Payment Gateways strictly to clear network transactions.</li>
            <li>System Administrators required to maintain operational parity.</li>
            <li>Governing bodies functioning under absolute verifiable mandates.</li>
          </ul>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">4. Encryption Protocols</h2>
          <p>
            We deploy military-grade hashing protocols and strict node isolation measures to shield your arrays from unauthorized interrogation, tampering, or public spillage.
          </p>
          
          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">5. Identity Rights</h2>
          <p>
            You hold absolute clearance to query, patch, terminate, or export your personal payload data at will. Interface with your registry settings or ping support to initiate commands.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">6. Policy Mutations</h2>
          <p>
            The network may execute patches to this Governance Protocol periodically. Updates will be broadcast locally on this node.
          </p>

          <h2 className="text-xl border-b border-neutral-900 pb-2 mb-4 mt-10">7. Comm-Link</h2>
          <p>
            For transmission decryption regarding this Protocol, initiate a direct link to <strong>privacy@eventhub.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
