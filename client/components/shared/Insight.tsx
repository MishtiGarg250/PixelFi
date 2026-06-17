"use client";

import React from "react";
import { useAIInsights } from "@/hooks/useInsights";
import { Activity, Terminal, Loader2, AlertTriangle, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_THEME_MAP = {
  LOW: {
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    dot: "bg-emerald-400"
  },
  MEDIUM: {
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    dot: "bg-amber-400"
  },
  HIGH: {
    bg: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    dot: "bg-orange-400"
  },
  CRITICAL: {
    bg: "bg-red-500/10 border-red-500/20 text-red-300 animate-pulse",
    dot: "bg-red-400"
  },
};

// Maps dynamic icon accents based on insight type tags
const INSIGHT_TYPE_ICONS = {
  ANOMALY: <AlertTriangle size={14} />,
  LIFESTYLE: <Lightbulb size={14} />,
  CASHFLOW: <TrendingUp size={14} />,
  PREDICTION: <Sparkles size={14} />,
};

export function AnalyticsInsightsFeed({ userId }: { userId: string | undefined }) {
  const { insights, loading, connected } = useAIInsights(userId);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-neutral-950/35 p-6 text-center">
        <Loader2 className="mx-auto animate-spin text-[#b5b5f6] mb-2" size={20} />
        <p className="text-xs text-neutral-500 tracking-wide">Syncing real-time analysis logs...</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-neutral-950/35 p-5 backdrop-blur-md">
      {/* Dynamic Sync Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#b5b5f6]" />
            <h2 className="text-sm font-semibold text-white">Live Analysis Engine</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-neutral-500">Asynchronous anomaly & portfolio alerts feed</p>
        </div>

        {/* Live Status Indicator Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/2 px-2.5 py-0.5">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full transition-all duration-300",
            connected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-red-400"
          )} />
          <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Analytics Stack Output */}
      {insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 px-4 py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-neutral-500">
            <Terminal size={16} />
          </div>
          <h3 className="text-xs font-semibold text-white">Stream is silent</h3>
          <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-neutral-500">
            Awaiting systemic triggers or Kafka event distribution markers.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          {insights.map((insight) => {
            const theme = SEVERITY_THEME_MAP[insight.severity] || SEVERITY_THEME_MAP.LOW;
            return (
              <div 
                key={insight.id}
                className="group border border-white/5 bg-neutral-950/45 hover:border-white/10 p-3.5 rounded-xl transition duration-150 relative overflow-hidden"
              >
                {/* Visual Accent Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 border px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide uppercase",
                    theme.bg
                  )}>
                    {INSIGHT_TYPE_ICONS[insight.type]}
                    {insight.type}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(insight.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Insight Body Layout */}
                <h4 className="text-xs font-semibold text-white group-hover:text-[#b5b5f6] transition duration-150">
                  {insight.title}
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}