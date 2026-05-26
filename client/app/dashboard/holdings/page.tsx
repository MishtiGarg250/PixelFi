"use client";

export default function HoldingsPage() {
  const assets = [
    { ticker: "NVDA", corporate: "NVIDIA Corporation", balance: "$42,400.00", share: "28.4%", flavor: "Equity Node" },
    { ticker: "ETH", corporate: "Ethereum Asset Token", balance: "$32,180.45", share: "21.6%", flavor: "Digital Asset" },
    { ticker: "VOO", corporate: "S&P 500 Index ETF Vanguard", balance: "$41,840.00", share: "28.0%", flavor: "Index Equity" },
    { ticker: "USDC", corporate: "Circle Reserves Token", balance: "$32,499.55", share: "22.0%", flavor: "Fiat Stable" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active Asset Allocations</h1>
        <p className="text-sm text-neutral-400 mt-1">Granular components inside tracking systems.</p>
      </div>

      <div className="h-2.5 w-full rounded-full bg-neutral-900 overflow-hidden flex">
        <div className="h-full bg-[#b5b5f6]" style={{ width: "28.4%" }} />
        <div className="h-full bg-[#d8c4ff]" style={{ width: "28.0%" }} />
        <div className="h-full bg-[#f7bff4]" style={{ width: "22.0%" }} />
        <div className="h-full bg-neutral-700" style={{ width: "21.6%" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset, index) => (
          <div key={index} className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white tracking-tight">{asset.ticker}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/4 border border-white/5 text-neutral-400">{asset.flavor}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">{asset.corporate}</p>
            </div>
            
            <div className="text-right">
              <span className="text-base font-medium text-white block">{asset.balance}</span>
              <span className="text-xs text-[#f7bff4] font-medium">{asset.share} Weight</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}