"use client";

export default function TransactionsPage() {
  const history = [
    { tracking: "TXN-9012", type: "Inbound Asset", origin: "Chase Cash Deposit", amt: "+$5,000.00", date: "May 24, 2026", status: "Completed" },
    { tracking: "TXN-4412", type: "Market Execution", origin: "Purchased ETH Allocation", amt: "-$2,450.00", date: "May 22, 2026", status: "Completed" },
    { tracking: "TXN-2195", type: "Distribution Yield", origin: "Fidelity Dividends payout", amt: "+$142.10", date: "May 18, 2026", status: "Completed" },
    { tracking: "TXN-0984", type: "Rebalancing Fee", origin: "Network Management gas", amt: "-$32.00", date: "May 12, 2026", status: "Completed" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ledger Operations</h1>
        <p className="text-sm text-neutral-400 mt-1">Immutable register of capital flow events.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/20">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-neutral-500 text-xs uppercase tracking-wider bg-white/1">
              <th className="p-4 font-medium">Tracking Reference</th>
              <th className="p-4 font-medium">Action Class</th>
              <th className="p-4 font-medium">Source / Node</th>
              <th className="p-4 font-medium">Timestamp</th>
              <th className="p-4 font-medium text-right">Magnitude</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((t, idx) => (
              <tr key={idx} className="hover:bg-white/1 transition-colors">
                <td className="p-4 font-mono text-xs text-neutral-400">{t.tracking}</td>
                <td className="p-4 font-medium text-white">{t.type}</td>
                <td className="p-4 text-neutral-400">{t.origin}</td>
                <td className="p-4 text-xs text-neutral-500">{t.date}</td>
                <td className={`p-4 text-right font-medium ${t.amt.startsWith("+") ? "text-[#f7bff4]" : "text-neutral-400"}`}>
                  {t.amt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}