"use client";

import { Activity, ShieldCheck, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Quantitative Analytics</h1>
        <p className="text-sm text-neutral-400 mt-1">Advanced system computations and predictive risk monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider">
            <Activity size={14} className="text-[#b5b5f6]" /> Volatility Matrix
          </div>
          <div>
            <h4 className="text-2xl font-medium">0.14 Beta Value</h4>
            <p className="text-xs text-neutral-500 mt-1">Significantly lower market volatility profile than global standard index variations.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider">
            <ShieldCheck size={14} className="text-[#f7bff4]" /> Sharpe Asset Ratio
          </div>
          <div>
            <h4 className="text-2xl font-medium">3.41 Efficiency Score</h4>
            <p className="text-xs text-neutral-500 mt-1">Excellent historical optimization metrics showing premium return payouts over risk.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider">
            <BarChart2 size={14} className="text-white" /> Projected Velocity
          </div>
          <div>
            <h4 className="text-2xl font-medium">+$12.4K EOY Proj.</h4>
            <p className="text-xs text-neutral-500 mt-1">Compounded estimates utilizing automated background recurring interest tracking models.</p>
          </div>
        </div>
      </div>
    </div>
  );
}