"use client";

import { useState, use } from "react";
import {
  FolderKanban,
  ArrowLeft,
  Wallet,
  BarChart2,
  ArrowLeftRight,
  Plus,
  Trash2,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAccounts } from "@/hooks/useAccount";
import { useHoldings } from "@/hooks/useHoldings";
import { useTransactions } from "@/hooks/useTransaction";
import { useRouter, useSearchParams } from "next/navigation";
import type { AccountType } from "@/services/account.service";
import type { TransactionType } from "@/services/transaction.service";

// ─── Tab types ──────────────────────────────────────────────────────────────
type Tab = "accounts" | "holdings" | "transactions";

// ─── Create Account Modal ───────────────────────────────────────────────────
function CreateAccountModal({
  open,
  onClose,
  onCreate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; brokerName: string; accountType: AccountType; currency: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("BROKERAGE");
  const [currency, setCurrency] = useState("USD");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ name: name.trim(), brokerName: brokerName.trim(), accountType, currency: currency.trim().toUpperCase() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">New Account</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Add an account to this portfolio</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Account Name <span className="text-[#f7bff4]">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Brokerage"
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Broker / Institution <span className="text-[#f7bff4]">*</span></label>
            <input
              type="text"
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              placeholder="e.g. Fidelity, Coinbase, Chase"
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full rounded-xl border border-white/8 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-[#b5b5f6]/50 transition"
              >
                <option value="BROKERAGE">Brokerage</option>
                <option value="BANK">Bank</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 transition"
                maxLength={5}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || !brokerName.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Plus size={14} /> Add Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Accounts Tab ───────────────────────────────────────────────────────────
function AccountsTab({ portfolioId }: { portfolioId: string }) {
  const { accounts, create, remove } = useAccounts(portfolioId);
  const [createOpen, setCreateOpen] = useState(false);

  const typeColors: Record<AccountType, string> = {
    BROKERAGE: "text-[#b5b5f6] bg-[#b5b5f6]/10 border-[#b5b5f6]/20",
    BANK: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    CRYPTO: "text-[#f7bff4] bg-[#f7bff4]/10 border-[#f7bff4]/20",
  };

  const typeIcon: Record<AccountType, React.ReactNode> = {
    BROKERAGE: <BarChart2 size={12} />,
    BANK: <CreditCard size={12} />,
    CRYPTO: <TrendingUp size={12} />,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {accounts.data?.length ?? 0} connected account{accounts.data?.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-white/15 transition"
        >
          <Plus size={12} /> Add Account
        </button>
      </div>

      {accounts.isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl border border-white/5 bg-white/2 animate-pulse" />)}
        </div>
      )}

      {!accounts.isLoading && accounts.data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/8 text-center">
          <Wallet size={24} className="text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No accounts yet. Add one to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.data?.map((acc) => (
          <div
            key={acc.id}
            className="group rounded-2xl border border-white/5 bg-neutral-950/40 p-5 flex flex-col justify-between gap-4 hover:border-white/10 hover:bg-neutral-900/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white text-sm">{acc.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">{acc.brokerName}</p>
              </div>
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeColors[acc.accountType]}`}>
                {typeIcon[acc.accountType]}
                {acc.accountType}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600 font-mono">{acc.currency}</span>
              <button
                onClick={() => remove.mutate(acc.id)}
                disabled={remove.isPending}
                className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-400/10 transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateAccountModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(data) => create.mutate(data, { onSuccess: () => setCreateOpen(false) })}
        isPending={create.isPending}
      />
    </div>
  );
}

// ─── Holdings Tab ───────────────────────────────────────────────────────────
function HoldingsTab({ portfolioId }: { portfolioId: string }) {
  const { holdings } = useHoldings(portfolioId);

  const totalValue = holdings.data?.reduce((sum, h) => sum + h.quantity * h.averageCost, 0) ?? 0;

  return (
    <div className="space-y-5">
      {holdings.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl border border-white/5 bg-white/2 animate-pulse" />)}
        </div>
      )}

      {!holdings.isLoading && holdings.data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/8 text-center">
          <BarChart2 size={24} className="text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No holdings yet. Add transactions to see holdings.</p>
        </div>
      )}

      {holdings.data && holdings.data.length > 0 && (
        <>
          {/* Allocation bar */}
          <div className="h-2 w-full rounded-full overflow-hidden flex gap-0.5">
            {holdings.data.map((h, i) => {
              const weight = totalValue > 0 ? ((h.quantity * h.averageCost) / totalValue) * 100 : 0;
              const colors = ["bg-[#b5b5f6]", "bg-[#f7bff4]", "bg-[#d8c4ff]", "bg-neutral-500", "bg-emerald-400", "bg-amber-400"];
              return <div key={h.marketAssetId} style={{ width: `${weight}%` }} className={`h-full rounded-full ${colors[i % colors.length]}`} />;
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {holdings.data.map((holding, i) => {
              const value = holding.quantity * holding.averageCost;
              const weight = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0.0";
              const dotColors = ["bg-[#b5b5f6]", "bg-[#f7bff4]", "bg-[#d8c4ff]", "bg-neutral-500", "bg-emerald-400", "bg-amber-400"];

              return (
                <div key={holding.marketAssetId} className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 flex items-center justify-between hover:border-white/10 hover:bg-neutral-900/30 transition">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{holding.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/4 border border-white/5 text-neutral-400">
                          {holding.quantity.toFixed(4)} units
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{holding.assetName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-white block">
                      ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-[#f7bff4] font-medium">{weight}% weight</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Transactions Tab ───────────────────────────────────────────────────────
function TransactionsTab({ portfolioId }: { portfolioId: string }) {
  const { transactions } = useTransactions(portfolioId);

  const typeConfig: Record<TransactionType, { label: string; color: string; icon: React.ReactNode }> = {
    BUY: { label: "Buy", color: "text-[#b5b5f6]", icon: <TrendingUp size={12} /> },
    SELL: { label: "Sell", color: "text-[#f7bff4]", icon: <TrendingDown size={12} /> },
    DIVIDEND: { label: "Dividend", color: "text-emerald-400", icon: <CheckCircle2 size={12} /> },
    DEPOSIT: { label: "Deposit", color: "text-sky-400", icon: <Plus size={12} /> },
    WITHDRAWAL: { label: "Withdrawal", color: "text-amber-400", icon: <AlertCircle size={12} /> },
  };

  return (
    <div className="space-y-5">
      {transactions.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl border border-white/5 bg-white/2 animate-pulse" />)}
        </div>
      )}

      {!transactions.isLoading && transactions.data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/8 text-center">
          <ArrowLeftRight size={24} className="text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No transactions yet. Add a transaction to get started.</p>
        </div>
      )}

      {transactions.data && transactions.data.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/20">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500 text-xs uppercase tracking-wider bg-white/1">
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Account</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.data.map((tx) => {
                const cfg = typeConfig[tx.type];
                const total = Number(tx.quantity) * Number(tx.price);
                const isOutflow = tx.type === "BUY" || tx.type === "WITHDRAWAL";

                return (
                  <tr key={tx.id} className="hover:bg-white/1 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-white">{tx.marketAsset.symbol}</span>
                      <span className="block text-xs text-neutral-500 mt-0.5">{tx.marketAsset.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-neutral-400">{tx.account.name}</td>
                    <td className="p-4 font-mono text-xs text-neutral-300">{Number(tx.quantity).toFixed(4)}</td>
                    <td className="p-4 font-mono text-xs text-neutral-300">
                      ${Number(tx.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-xs text-neutral-500">
                      {new Date(tx.executedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className={`p-4 text-right font-medium font-mono text-sm ${isOutflow ? "text-[#b5b5f6]" : "text-[#f7bff4]"}`}>
                      {isOutflow ? "-" : "+"}${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const { portfolioId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolio = usePortfolio(portfolioId);
  const initialTab = (searchParams.get("tab") as Tab) ?? "accounts";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "accounts", label: "Accounts", icon: <Wallet size={14} /> },
    { id: "holdings", label: "Holdings", icon: <BarChart2 size={14} /> },
    { id: "transactions", label: "Transactions", icon: <ArrowLeftRight size={14} /> },
  ];

  if (portfolio.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="h-4 w-80 rounded-lg bg-white/4" />
        <div className="h-12 w-full rounded-2xl bg-white/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-white/3" />
          <div className="h-40 rounded-2xl bg-white/3" />
        </div>
      </div>
    );
  }

  if (portfolio.isError || !portfolio.data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle size={32} className="text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-1">Portfolio not found</h2>
        <p className="text-sm text-neutral-500 mb-6">This portfolio may have been deleted or does not exist.</p>
        <button
          onClick={() => router.push("/dashboard/portfolios")}
          className="flex items-center gap-2 text-sm text-[#b5b5f6] hover:text-white transition"
        >
          <ArrowLeft size={14} /> Back to Portfolios
        </button>
      </div>
    );
  }

  const p = portfolio.data;

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/dashboard/portfolios")}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition mb-4"
        >
          <ArrowLeft size={13} /> All Portfolios
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[#b5b5f6]/20 to-[#f7bff4]/10 border border-white/8 flex items-center justify-center text-[#b5b5f6]">
            <FolderKanban size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{p.name}</h1>
            <p className="text-sm text-neutral-400 mt-1">{p.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Accounts", value: p._count?.accounts ?? 0, color: "text-[#b5b5f6]" },
          { label: "Holdings", value: p._count?.holdings ?? 0, color: "text-[#f7bff4]" },
          { label: "Created", value: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }), color: "text-white" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-neutral-950/40 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-neutral-950/40 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white/8 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "accounts" && <AccountsTab portfolioId={portfolioId} />}
        {activeTab === "holdings" && <HoldingsTab portfolioId={portfolioId} />}
        {activeTab === "transactions" && <TransactionsTab portfolioId={portfolioId} />}
      </div>
    </div>
  );
}
