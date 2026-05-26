"use client";

import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, SlidersHorizontal } from "lucide-react";

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState("all");

  const feed = [
    { ticker: "BTC", name: "Bitcoin", price: "$68,410.50", change: "+4.21%", trend: true, cap: "$1.34T" },
    { ticker: "SOL", name: "Solana Token", price: "$142.15", change: "+11.84%", trend: true, cap: "$64.2B" },
    { ticker: "AAPL", name: "Apple Inc.", price: "$178.45", change: "-0.62%", trend: false, cap: "$2.71T" },
    { ticker: "TSLA", name: "Tesla Motors", price: "$169.20", change: "-2.15%", trend: false, cap: "$540.8B" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Market Indices</h1>
          <p className="text-sm text-neutral-400 mt-1">Global tracking systems and digital liquidity networks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Filter nodes..." 
              className="w-full rounded-full border border-white/5 bg-white/2 py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none transition focus:border-white/10 focus:bg-white/4"
            />
          </div>
          <button className="p-2 rounded-full border border-white/5 bg-white/2 text-neutral-400 hover:text-white transition">
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 border-b border-white/5 pb-px">
        {["all", "equities", "digital tokens", "commodities"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-medium uppercase tracking-wider transition-colors relative ${
              activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-[#b5b5f6] to-[#f7bff4]" />
            )}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {feed.map((asset, i) => (
          <div key={i} className="group rounded-2xl border border-white/5 bg-neutral-950/40 p-5 transition-colors hover:bg-neutral-900/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-semibold tracking-tight block text-white group-hover:text-[#f7bff4] transition-colors">
                  {asset.ticker}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5 block">{asset.name}</span>
              </div>
              
              <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-md ${
                asset.trend ? "text-[#f7bff4] bg-[#f7bff4]/5" : "text-neutral-400 bg-white/2"
              }`}>
                {asset.trend ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {asset.change}
              </span>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider block">Price</span>
                <span className="text-xl font-medium tracking-tight">{asset.price}</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">{asset.cap} Cap</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}