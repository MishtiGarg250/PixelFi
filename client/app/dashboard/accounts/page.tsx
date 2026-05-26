"use client";

import { CreditCard, ExternalLink } from "lucide-react";

export default function AccountsPage() {
  const accounts = [
    { provider: "Fidelity Custody Services", type: "Brokerage Broker Account", balance: "$64,210.00", connected: true },
    { provider: "Coinbase Prime Institutional", type: "Web3 Web Vault Vault", balance: "$32,180.45", connected: true },
    { provider: "Chase High Yield Checking", type: "Cash Liquid Base", balance: "$52,529.55", connected: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Connected Accounts</h1>
        <p className="text-sm text-neutral-400 mt-1">Monitored integrations and external nodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accounts.map((acc, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-linear-to-b from-neutral-950 to-black p-6 flex flex-col justify-between h-47.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-neutral-200">{acc.provider}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">{acc.type}</p>
              </div>
              <CreditCard size={16} className="text-[#b5b5f6]" />
            </div>

            <div className="flex items-end justify-between mt-6">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Valuation</span>
                <span className="text-2xl font-semibold tracking-tight">{acc.balance}</span>
              </div>
              <button className="p-2 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition text-neutral-400 hover:text-white">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}