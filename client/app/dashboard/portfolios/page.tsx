"use client";

import { FolderKanban, Plus } from "lucide-react";

export default function PortfoliosPage() {
  const portfolios = [
    { name: "Long-term Multi-Asset Core", assets: 14, capital: "$84,240", risk: "Conservative", distribution: "60% Equity / 40% Fixed" },
    { name: "Speculative High-Alpha Venture", assets: 6, capital: "$32,180", risk: "Aggressive", distribution: "100% Digital Native" },
    { name: "Passive Real-Estate Trust", assets: 2, capital: "$32,500", risk: "Moderate", distribution: "Real Estate Commodities" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Portfolios</h1>
          <p className="text-sm text-neutral-400 mt-1">Discreet wealth allocation structures.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] px-4 py-2 text-xs font-medium text-black transition hover:scale-[1.02]">
          <Plus size={14} /> New Structure
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {portfolios.map((p, idx) => (
          <div key={idx} className="group rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-neutral-900/30">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-[#b5b5f6]">
                <FolderKanban size={16} />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-[#f7bff4] transition-colors">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{p.assets} Items Allocation • {p.distribution}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 justify-between md:justify-end">
              <div className="text-left md:text-right">
                <span className="text-xs text-neutral-500 block">Balance Value</span>
                <span className="text-lg font-medium text-white">{p.capital}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Risk Profile</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md border border-white/10 bg-white/2">{p.risk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}