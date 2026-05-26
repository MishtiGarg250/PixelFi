"use client";

import {ShieldCheck, Zap } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">System Core</h1>
        <p className="text-sm text-neutral-400 mt-1">Real-time valuation metrics and machine insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Net Asset Value", val: "$148,920.00", change: "+12.3%", color: "text-[#b5b5f6]" },
          { label: "Liquid Capital", val: "$34,200.45", change: "+2.1%", color: "text-[#f7bff4]" },
          { label: "Allocated Yield", val: "$114,719.55", change: "+18.4%", color: "text-white" }
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{item.label}</p>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-medium tracking-tight">{item.val}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md bg-white/3 border border-white/5 ${item.color}`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-neutral-950/20 p-6 flex flex-col justify-between h-80">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-400">Yield Architecture Flow</span>
            <span className="text-xs text-neutral-500">7D Interval</span>
          </div>
  
          <div className="h-40 w-full flex items-end gap-2 border-b border-white/5 pb-2">
            {[20, 38, 30, 65, 50, 70, 60, 90, 85, 100].map((h, i) => (
              <div key={i} style={{ height: `${h}%` }} className="w-full rounded-t-md bg-linear-to-t from-neutral-900 via-[#b5b5f6]/40 to-[#f7bff4]" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-linear-to-b from-neutral-950 to-black p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-[#f7bff4]">
            <Zap size={14} />
            Autonomous Advice Engine
          </div>
          <div className="my-auto space-y-3 pt-4">
            <div className="flex gap-3 text-sm">
              <ShieldCheck className="text-[#b5b5f6] shrink-0 mt-0.5" size={16} />
              <p className="text-neutral-300 leading-normal">Your cash allocations have been optimized against current market inflation indexes automatically.</p>
            </div>
          </div>
          <button className="w-full mt-4 text-center py-2.5 rounded-xl border border-white/5 bg-white/2 text-xs font-medium text-neutral-400 hover:text-white transition">
            Review 4 Actions Pending
          </button>
        </div>
      </div>
    </div>
  );
}