"use client";
import {
  BarChart3,
  CheckCircle2,
  Loader2,
  LineChart,
  Shield,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useAllocation,
  useLatestMonthlyReport,
  useNetWorth,
  usePerformance,
  useRunMonthlyAnalysis,
  useSnapshotSeries,
} from "@/hooks/useAnalytics";
import { AnalyticsInsightsFeed } from "@/components/shared/Insight"

const accent = ["#b5b5f6", "#f7bff4", "#d8c4ff", "#a7f3d0", "#93c5fd", "#fcd34d"];

import { globalBaseCurrency, useUser } from "@/hooks/useUser";

function money(value?: number | null, currency?: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || globalBaseCurrency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function date(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function title(value?: string | null) {
  return value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not set";
}

function PageHeader({
  eyebrow,
  title: heading,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#b5b5f6]">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white">{heading}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] px-4 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(181,181,246,0.14)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color = "text-white",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-neutral-950/45 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
        {icon ? <span className="text-neutral-500">{icon}</span> : null}
      </div>
      <div className={cn("mt-4 text-2xl font-semibold tracking-tight", color)}>{value}</div>
      {sub ? <p className="mt-1 text-xs text-neutral-500">{sub}</p> : null}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-white/5 bg-neutral-950/35 p-5", className)}>{children}</section>;
}

function EmptyState({ icon, title: heading, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 px-5 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-neutral-500">{icon}</div>
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  );
}

function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const { user } = useUser(); // Pull current authentication context to gather user database context
  const netWorth = useNetWorth();
  const allocation = useAllocation();
  const performance = usePerformance();
  const snapshots = useSnapshotSeries("DAILY", 90);
  const monthlyReport = useLatestMonthlyReport();
  const runAnalysis = useRunMonthlyAnalysis();

  const areaData = (performance.data ?? []).map((item) => ({ symbol: item.symbol, invested: item.investedAmount, value: item.currentValue, pnl: item.pnl }));
  const trendData = (snapshots.data ?? []).map((item) => ({
    date: new Date(item.snapshotDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    netWorth: item.netWorth,
    assets: item.totalAssets,
    liabilities: item.totalLiabilities,
    healthScore: item.healthScore,
  }));
  const latestSnapshot = snapshots.data?.[snapshots.data.length - 1];
  const latestReport = monthlyReport.data;
  const totalPnl = (performance.data ?? []).reduce((sum, item) => sum + item.pnl, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Daily wealth metrics, portfolio charts, and monthly AI recommendations."
        action={
          <PrimaryButton
            disabled={runAnalysis.isPending}
            onClick={() =>
              runAnalysis.mutate(undefined, {
                onSuccess: () => toast.success("Monthly analysis refreshed"),
                onError: () => toast.error("Unable to refresh monthly analysis"),
              })
            }
          >
            {runAnalysis.isPending ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            Run Analysis
          </PrimaryButton>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Net Worth" value={money(netWorth.data?.totalNetWorth)} color="text-[#b5b5f6]" />
        <StatCard label="Health Score" value={latestSnapshot?.healthScore ?? "--"} sub="Latest daily snapshot" />
        <StatCard label="Positions" value={netWorth.data?.holdings.length ?? 0} />
        <StatCard label="Total PnL" value={money(totalPnl)} color={totalPnl >= 0 ? "text-emerald-300" : "text-red-300"} />
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Daily Net Worth Trend</h2>
          <span className="text-xs text-neutral-500">Last 90 days</span>
        </div>
        <div className="h-80">
          {snapshots.isLoading ? (
            <div className="h-full animate-pulse rounded-xl bg-white/3" />
          ) : trendData.length ? (
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="netWorth" stroke="#b5b5f6" fill="#b5b5f6" fillOpacity={0.16} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<LineChart size={18} />} title="No snapshot trend yet" description="Daily snapshots will build this trend automatically." />
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Monthly AI Report</h2>
            {latestReport?.snapshot?.snapshotDate ? <span className="text-xs text-neutral-500">{date(latestReport.snapshot.snapshotDate)}</span> : null}
          </div>
          {monthlyReport.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-white/3" />
          ) : latestReport ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/5 bg-white/2 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-[#b5b5f6]/20 bg-[#b5b5f6]/10 text-[#b5b5f6]">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Wealth summary</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-400">{latestReport.snapshot.summary ?? "Monthly analysis is ready, but no narrative summary was saved yet."}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {latestReport.insights.map((insight) => (
                  <div key={insight.id} className="rounded-xl border border-white/5 bg-neutral-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 text-[10px] font-medium uppercase text-neutral-400">{title(insight.type)}</span>
                      <span className={cn("text-[10px] font-semibold uppercase", insight.severity === "HIGH" ? "text-red-300" : insight.severity === "MEDIUM" ? "text-amber-300" : "text-emerald-300")}>{insight.severity}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-white">{insight.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-xs leading-5 text-neutral-400">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={<Shield size={18} />} title="No monthly AI report" description="Run the analysis once, then monthly cron will refresh it automatically." />
          )}
        </Panel>
        
        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Snapshot Scores</h2>
          <div className="space-y-4">
            {[
              { label: "Risk", value: latestSnapshot?.riskScore ?? 0, color: "#f7bff4" },
              { label: "Diversification", value: latestSnapshot?.diversificationScore ?? 0, color: "#b5b5f6" },
              { label: "Health", value: latestSnapshot?.healthScore ?? 0, color: "#a7f3d0" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">{item.label}</span>
                  <span className="font-mono text-white">{item.value}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, item.value))}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Allocation Breakdowns (Left Column Block) */}
        <div className="xl:col-span-2 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Panel>
            <h2 className="mb-4 text-sm font-semibold text-white">Allocation Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={allocation.data ?? []} dataKey="currentValue" nameKey="symbol" innerRadius={65} outerRadius={105}>
                    {(allocation.data ?? []).map((_, index) => (
                      <Cell key={index} fill={accent[index % accent.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-4 text-sm font-semibold text-white">Performance Analysis</h2>
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={areaData}>
                  <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                  <XAxis dataKey="symbol" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#b5b5f6" fill="#b5b5f6" fillOpacity={0.16} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-1">
          <AnalyticsInsightsFeed userId="cmpyy6jhv0000k8mc6e6zh4rc" />
        </div>
      </div>

      <Panel>
        <h2 className="mb-4 text-sm font-semibold text-white">PnL Analysis</h2>
        {performance.isLoading ? (
          <SkeletonGrid count={2} />
        ) : performance.data?.length ? (
          <div className="text-xs font-mono text-neutral-400">Priced holdings processing array available...</div>
        ) : (
          <EmptyState icon={<BarChart3 size={18} />} title="No PnL data" description="Performance analytics will appear after priced holdings are available." />
        )}
      </Panel>
    </div>
  );
}