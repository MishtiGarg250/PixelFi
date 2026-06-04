"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Database,
  FolderKanban,
  LineChart,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccount";
import { useAllocation, useNetWorth, usePerformance } from "@/hooks/useAnalytics";
import { useCustomAssets, useMarketAssets } from "@/hooks/useAssets";
import { useLiabilities } from "@/hooks/useLiabilities";
import { usePortfolio, usePortfolios } from "@/hooks/usePortfolio";
import { useTransactions } from "@/hooks/useTransaction";
import { useUser } from "@/hooks/useUser";
import type { Account } from "@/services/account.service";
import type {
  CreateCustomAssetInput,
  CustomAsset,
  MarketAsset,
  UpdateCustomAssetInput,
} from "@/services/asset.service";
import type { Liability } from "@/services/liability.service";
import type { Portfolio } from "@/services/portfolio.service";
import type { Transaction, TransactionType } from "@/services/transaction.service";

const accent = ["#b5b5f6", "#f7bff4", "#d8c4ff", "#a7f3d0", "#93c5fd", "#fcd34d"];
const transactionTypes = ["BUY", "SELL", "DIVIDEND", "DEPOSIT", "WITHDRAWAL", "INTEREST", "TRANSFER"] as const;
const accountTypes = ["BROKERAGE", "BANK", "CRYPTO"] as const;
const liabilityTypes = ["MORTGAGE", "CAR_LOAN", "PERSONAL_LOAN", "CREDIT_CARD", "OTHER"] as const;
const customCategories = ["REAL_ESTATE", "VEHICLE", "LUXURY_ITEM", "ART", "COLLECTIBLE", "OTHER"] as const;
const marketAssetTypes = ["STOCK", "ETF", "CRYPTO", "BOND", "MUTUAL_FUND"] as const;

function money(value?: number | null, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] px-4 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(181,181,246,0.14)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger"
          ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          : "border-white/8 bg-white/3 text-neutral-300 hover:border-white/15 hover:text-white"
      )}
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-neutral-500">{icon}</div>
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  );
}

function ErrorState({ label = "Unable to load this view." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-200">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} />
        {label}
      </div>
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

function Modal({
  title: heading,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="Close dialog" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{heading}</h2>
            {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-white">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-neutral-400">
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1.5 text-[11px] text-red-300">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-white/8 bg-white/3 px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20";
const selectClass =
  "h-10 w-full rounded-xl border border-white/8 bg-neutral-900 px-3 text-sm text-white outline-none transition focus:border-[#b5b5f6]/50";

const accountSchema = z.object({
  name: z.string().min(2),
  brokerName: z.string().min(2),
  accountType: z.enum(accountTypes),
  currency: z.string().min(3).max(5),
});

function AccountForm({ onSubmit, pending }: { onSubmit: (data: z.infer<typeof accountSchema>) => void; pending: boolean }) {
  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", brokerName: "", accountType: "BROKERAGE", currency: "USD" },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data, currency: data.currency.toUpperCase() }))} className="space-y-4">
      <Field label="Account Name" error={form.formState.errors.name?.message}>
        <input className={inputClass} placeholder="Main Brokerage" {...form.register("name")} />
      </Field>
      <Field label="Broker / Institution" error={form.formState.errors.brokerName?.message}>
        <input className={inputClass} placeholder="Fidelity, Coinbase, Chase" {...form.register("brokerName")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" error={form.formState.errors.accountType?.message}>
          <select className={selectClass} {...form.register("accountType")}>
            {accountTypes.map((value) => <option key={value} value={value}>{title(value)}</option>)}
          </select>
        </Field>
        <Field label="Currency" error={form.formState.errors.currency?.message}>
          <input className={inputClass} {...form.register("currency")} />
        </Field>
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Account
      </PrimaryButton>
    </form>
  );
}

const portfolioSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

function PortfolioForm({
  initial,
  onSubmit,
  pending,
}: {
  initial?: Portfolio;
  onSubmit: (data: z.infer<typeof portfolioSchema>) => void;
  pending: boolean;
}) {
  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Portfolio Name" error={form.formState.errors.name?.message}>
        <input className={inputClass} placeholder="Growth Portfolio" {...form.register("name")} />
      </Field>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea className={cn(inputClass, "h-24 py-3")} placeholder="Strategy or purpose" {...form.register("description")} />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Portfolio
      </PrimaryButton>
    </form>
  );
}

const liabilitySchema = z.object({
  name: z.string().min(2),
  type: z.enum(liabilityTypes),
  originalAmount: z.coerce.number().nonnegative(),
  outstanding: z.coerce.number().nonnegative(),
  interestRate: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(3).max(5),
});

function LiabilityForm({
  initial,
  onSubmit,
  pending,
}: {
  initial?: Liability;
  onSubmit: (data: z.infer<typeof liabilitySchema>) => void;
  pending: boolean;
}) {
  const form = useForm<z.infer<typeof liabilitySchema>>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: {
      name: initial?.name ?? "",
      type: initial?.type ?? "OTHER",
      originalAmount: initial?.originalAmount ?? 0,
      outstanding: initial?.outstanding ?? 0,
      interestRate: initial?.interestRate ?? 0,
      currency: initial?.currency ?? "USD",
    },
  });
  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data, currency: data.currency.toUpperCase() }))} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}><input className={inputClass} {...form.register("name")} /></Field>
        <Field label="Type" error={form.formState.errors.type?.message}>
          <select className={selectClass} {...form.register("type")}>{liabilityTypes.map((value) => <option key={value} value={value}>{title(value)}</option>)}</select>
        </Field>
        <Field label="Original Amount" error={form.formState.errors.originalAmount?.message}><input className={inputClass} type="number" step="0.01" {...form.register("originalAmount")} /></Field>
        <Field label="Outstanding Balance" error={form.formState.errors.outstanding?.message}><input className={inputClass} type="number" step="0.01" {...form.register("outstanding")} /></Field>
        <Field label="Interest Rate" error={form.formState.errors.interestRate?.message}><input className={inputClass} type="number" step="0.01" {...form.register("interestRate")} /></Field>
        <Field label="Currency" error={form.formState.errors.currency?.message}><input className={inputClass} {...form.register("currency")} /></Field>
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Liability
      </PrimaryButton>
    </form>
  );
}

const marketAssetSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(2),
  assetType: z.enum(marketAssetTypes),
  exchange: z.string().optional(),
  sector: z.string().optional(),
  currency: z.string().min(3).max(5),
});

function MarketAssetForm({ onSubmit, pending }: { onSubmit: (data: z.infer<typeof marketAssetSchema>) => void; pending: boolean }) {
  const form = useForm<z.infer<typeof marketAssetSchema>>({
    resolver: zodResolver(marketAssetSchema),
    defaultValues: { symbol: "", name: "", assetType: "STOCK", exchange: "", sector: "", currency: "USD" },
  });
  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data, symbol: data.symbol.toUpperCase(), currency: data.currency.toUpperCase() }))} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Symbol" error={form.formState.errors.symbol?.message}><input className={inputClass} placeholder="AAPL" {...form.register("symbol")} /></Field>
        <Field label="Name" error={form.formState.errors.name?.message}><input className={inputClass} placeholder="Apple Inc." {...form.register("name")} /></Field>
        <Field label="Type" error={form.formState.errors.assetType?.message}>
          <select className={selectClass} {...form.register("assetType")}>{marketAssetTypes.map((value) => <option key={value} value={value}>{title(value)}</option>)}</select>
        </Field>
        <Field label="Currency" error={form.formState.errors.currency?.message}><input className={inputClass} {...form.register("currency")} /></Field>
        <Field label="Exchange" error={form.formState.errors.exchange?.message}><input className={inputClass} placeholder="NASDAQ" {...form.register("exchange")} /></Field>
        <Field label="Sector" error={form.formState.errors.sector?.message}><input className={inputClass} placeholder="Technology" {...form.register("sector")} /></Field>
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Asset
      </PrimaryButton>
    </form>
  );
}

const customAssetSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(customCategories),
  currentValue: z.coerce.number().nonnegative(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  purchaseDate: z.string().optional(),
  currency: z.string().min(3).max(5),
  portfolioId: z.string().optional(),
});

function CustomAssetForm({
  initial,
  portfolios,
  onSubmit,
  pending,
}: {
  initial?: CustomAsset;
  portfolios: Portfolio[];
  onSubmit: (data: CreateCustomAssetInput | UpdateCustomAssetInput) => void;
  pending: boolean;
}) {
  const form = useForm<z.infer<typeof customAssetSchema>>({
    resolver: zodResolver(customAssetSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "OTHER",
      currentValue: initial?.currentValue ?? 0,
      purchasePrice: initial?.purchasePrice ?? 0,
      purchaseDate: initial?.purchaseDate ? initial.purchaseDate.slice(0, 10) : "",
      currency: initial?.currency ?? "USD",
      portfolioId: initial?.portfolioId ?? "",
    },
  });
  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        onSubmit({
          ...data,
          currency: data.currency.toUpperCase(),
          portfolioId: data.portfolioId || undefined,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        })
      )}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}><input className={inputClass} {...form.register("name")} /></Field>
        <Field label="Category" error={form.formState.errors.category?.message}>
          <select className={selectClass} {...form.register("category")}>{customCategories.map((value) => <option key={value} value={value}>{title(value)}</option>)}</select>
        </Field>
        <Field label="Current Value" error={form.formState.errors.currentValue?.message}><input className={inputClass} type="number" step="0.01" {...form.register("currentValue")} /></Field>
        <Field label="Purchase Price" error={form.formState.errors.purchasePrice?.message}><input className={inputClass} type="number" step="0.01" {...form.register("purchasePrice")} /></Field>
        <Field label="Purchase Date" error={form.formState.errors.purchaseDate?.message}><input className={inputClass} type="date" {...form.register("purchaseDate")} /></Field>
        <Field label="Currency" error={form.formState.errors.currency?.message}><input className={inputClass} {...form.register("currency")} /></Field>
      </div>
      <Field label="Portfolio" error={form.formState.errors.portfolioId?.message}>
        <select className={selectClass} {...form.register("portfolioId")}>
          <option value="">Unassigned</option>
          {portfolios.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>)}
        </select>
      </Field>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea className={cn(inputClass, "h-20 py-3")} {...form.register("description")} />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Asset
      </PrimaryButton>
    </form>
  );
}

const transactionSchema = z.object({
  accountId: z.string().min(1),
  marketAssetId: z.string().optional(),
  type: z.enum(transactionTypes),
  quantity: z.coerce.number().nonnegative().optional(),
  price: z.coerce.number().nonnegative().optional(),
  amount: z.coerce.number().nonnegative().optional(),
  fees: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(3).max(5),
  executedAt: z.string().min(1),
});

function TransactionForm({
  accounts,
  marketAssets,
  onSearch,
  onSubmit,
  pending,
}: {
  accounts: Account[];
  marketAssets: MarketAsset[];
  onSearch: (value: string) => void;
  onSubmit: (data: z.infer<typeof transactionSchema>) => void;
  pending: boolean;
}) {
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: accounts[0]?.id ?? "",
      type: "BUY",
      quantity: 0,
      price: 0,
      amount: 0,
      fees: 0,
      currency: "USD",
      executedAt: new Date().toISOString().slice(0, 10),
    },
  });
  const selectedMarketAssetId = useWatch({ control: form.control, name: "marketAssetId" });
  return (
    <form
      onSubmit={form.handleSubmit((data) => onSubmit({ ...data, currency: data.currency.toUpperCase(), executedAt: new Date(data.executedAt).toISOString() }))}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Account" error={form.formState.errors.accountId?.message}>
          <select className={selectClass} {...form.register("accountId")}>
            <option value="">Select account</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </Field>
        <Field label="Type" error={form.formState.errors.type?.message}>
          <select className={selectClass} {...form.register("type")}>{transactionTypes.map((value) => <option key={value} value={value}>{title(value)}</option>)}</select>
        </Field>
        <Field label="Quantity" error={form.formState.errors.quantity?.message}><input className={inputClass} type="number" step="0.0001" {...form.register("quantity")} /></Field>
        <Field label="Price" error={form.formState.errors.price?.message}><input className={inputClass} type="number" step="0.01" {...form.register("price")} /></Field>
        <Field label="Amount" error={form.formState.errors.amount?.message}><input className={inputClass} type="number" step="0.01" {...form.register("amount")} /></Field>
        <Field label="Fees" error={form.formState.errors.fees?.message}><input className={inputClass} type="number" step="0.01" {...form.register("fees")} /></Field>
        <Field label="Currency" error={form.formState.errors.currency?.message}><input className={inputClass} {...form.register("currency")} /></Field>
        <Field label="Executed Date" error={form.formState.errors.executedAt?.message}><input className={inputClass} type="date" {...form.register("executedAt")} /></Field>
      </div>
      <Field label="Search Market Asset">
        <input className={inputClass} placeholder="AAPL, BTC, MSFT" onChange={(event) => onSearch(event.target.value)} />
      </Field>
      {marketAssets.length ? (
        <div className="grid max-h-48 gap-2 overflow-y-auto rounded-2xl border border-white/8 bg-white/3 p-2">
          {marketAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => form.setValue("marketAssetId", asset.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm transition hover:border-white/20",
                selectedMarketAssetId === asset.id ? "border-[#b5b5f6]/50 bg-[#b5b5f6]/10" : "border-white/5"
              )}
            >
              <span className="font-medium text-white">{asset.symbol}</span>
              <span className="ml-2 text-xs text-neutral-500">{asset.name}</span>
            </button>
          ))}
        </div>
      ) : null}
      <PrimaryButton type="submit" disabled={pending || !accounts.length}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Transaction
      </PrimaryButton>
    </form>
  );
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/20">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.01] text-xs uppercase tracking-wider text-neutral-500">
            {["Date", "Type", "Asset", "Account", "Quantity", "Price", "Amount", "Fees"].map((head) => (
              <th key={head} className="p-4 font-medium">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.map((tx) => (
            <tr key={tx.id} className="transition hover:bg-white/[0.015]">
              <td className="p-4 text-xs text-neutral-500">{date(tx.executedAt)}</td>
              <td className="p-4"><span className="rounded-full border border-white/8 bg-white/3 px-2 py-1 text-[11px] text-neutral-300">{title(tx.type)}</span></td>
              <td className="p-4"><p className="font-medium text-white">{tx.marketAsset?.symbol ?? "Cash"}</p><p className="text-xs text-neutral-500">{tx.marketAsset?.name ?? "No linked asset"}</p></td>
              <td className="p-4 text-xs text-neutral-400">{tx.account?.name ?? "Unknown"}</td>
              <td className="p-4 font-mono text-xs text-neutral-300">{Number(tx.quantity ?? 0).toLocaleString()}</td>
              <td className="p-4 font-mono text-xs text-neutral-300">{money(tx.price, tx.currency)}</td>
              <td className="p-4 font-mono text-xs text-neutral-300">{money(tx.amount ?? Number(tx.quantity ?? 0) * Number(tx.price ?? 0), tx.currency)}</td>
              <td className="p-4 font-mono text-xs text-neutral-500">{money(tx.fees, tx.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useUser();
  const netWorth = useNetWorth();
  const allocation = useAllocation();
  const performance = usePerformance();
  const { transactions } = useTransactions();
  const liabilities = useLiabilities();

  const totalLiabilities = useMemo(() => (liabilities.liabilities.data ?? []).reduce((sum, item) => sum + item.outstanding, 0), [liabilities.liabilities.data]);
  const totalAssets = Number(netWorth.data?.totalNetWorth ?? 0) + totalLiabilities;
  const pnlPercent = (performance.data ?? []).reduce((sum, item) => sum + item.pnlPercent, 0) / Math.max(performance.data?.length ?? 1, 1);
  const firstName = user.data?.firstName || user.data?.username || "Investor";

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Dashboard" title={`Welcome back, ${firstName}`} description="Monitor net worth, exposure, performance, recent transactions, and high-signal portfolio insights." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net Worth" value={money(netWorth.data?.totalNetWorth)} icon={<Wallet size={16} />} color="text-[#b5b5f6]" />
        <StatCard label="Total Assets" value={money(totalAssets)} icon={<BriefcaseBusiness size={16} />} />
        <StatCard label="Total Liabilities" value={money(totalLiabilities)} icon={<CircleDollarSign size={16} />} color="text-[#f7bff4]" />
        <StatCard label="Performance" value={`${Number.isFinite(pnlPercent) ? pnlPercent.toFixed(2) : "0.00"}%`} icon={<LineChart size={16} />} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Panel className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Asset Allocation</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocation.data ?? []} dataKey="currentValue" nameKey="symbol" innerRadius={58} outerRadius={95}>
                  {(allocation.data ?? []).map((_, index) => <Cell key={index} fill={accent[index % accent.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <h2 className="mb-4 text-sm font-semibold text-white">Portfolio Performance</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={performance.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="symbol" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]} fill="#b5b5f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Top Holdings</h2>
          {(netWorth.data?.holdings ?? []).length ? (
            <div className="space-y-3">
              {(netWorth.data?.holdings ?? []).slice(0, 5).map((holding) => (
                <div key={holding.marketAssetId} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div><p className="text-sm font-medium text-white">{holding.symbol}</p><p className="text-xs text-neutral-500">{holding.assetName}</p></div>
                  <p className="text-sm font-semibold text-[#b5b5f6]">{money(holding.currentValue)}</p>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={<Database size={18} />} title="No holdings yet" description="Holdings will appear after transactions create positions." />}
        </Panel>
        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Recent Transactions</h2>
          {(transactions.data ?? []).length ? <TransactionsTable transactions={(transactions.data ?? []).slice(0, 5)} /> : <EmptyState icon={<ArrowLeftRight size={18} />} title="No transactions" description="Recent activity will appear after your first transaction." />}
        </Panel>
      </div>
      <Panel>
        <h2 className="text-sm font-semibold text-white">Insights</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-6 text-neutral-400">Investment summary: {performance.data?.length ? `You are tracking ${performance.data.length} priced positions with aggregate net worth of ${money(netWorth.data?.totalNetWorth)}.` : "Add transactions and holdings to unlock portfolio-level insights."}</div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-6 text-neutral-400">Asset distribution: {allocation.data?.length ? `${allocation.data[0]?.symbol ?? "Top asset"} currently leads allocation exposure.` : "Allocation data will appear once holdings are available."}</div>
        </div>
      </Panel>
    </div>
  );
}

export function AccountsPage() {
  const { accounts, create, remove } = useAccounts();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader title="Accounts" description="Manage brokerages, banks, and crypto venues used across your wealth stack." action={<PrimaryButton onClick={() => setCreateOpen(true)}><Plus size={14} /> Add Account</PrimaryButton>} />
      {accounts.isError ? <ErrorState /> : accounts.isLoading ? <SkeletonGrid /> : accounts.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.data.map((account) => (
            <Panel key={account.id}>
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-sm font-semibold text-white">{account.name}</h2><p className="mt-1 text-xs text-neutral-500">{account.brokerName || "No broker"}</p></div>
                <span className="rounded-full border border-white/8 bg-white/3 px-2 py-1 text-[11px] text-neutral-300">{title(account.accountType)}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-neutral-500">
                <span>Currency <b className="block pt-1 font-mono text-neutral-300">{account.currency}</b></span>
                <span>Created <b className="block pt-1 font-normal text-neutral-300">{date(account.createdAt)}</b></span>
              </div>
              <div className="mt-5 flex justify-between">
                <Link href={`/accounts/${account.id}`} className="inline-flex items-center gap-1 text-xs text-[#b5b5f6] hover:text-white">View <ArrowRight size={12} /></Link>
                <GhostButton tone="danger" onClick={() => setDeleteTarget(account)}><Trash2 size={13} /> Delete</GhostButton>
              </div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={<Wallet size={18} />} title="No accounts" description="Add your first account to start organizing transactions and balances." />}
      {createOpen ? <Modal title="Add Account" description="Create a new financial account." onClose={() => setCreateOpen(false)}><AccountForm pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Account created"); setCreateOpen(false); } })} /></Modal> : null}
      {deleteTarget ? <Modal title="Delete Account" description={`Delete ${deleteTarget.name}? This cannot be undone.`} onClose={() => setDeleteTarget(null)}><GhostButton tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(deleteTarget.id, { onSuccess: () => { toast.success("Account deleted"); setDeleteTarget(null); } })}>{remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Account</GhostButton></Modal> : null}
    </div>
  );
}

export function AccountDetailPage({ accountId }: { accountId: string }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions(accountId);
  const account = accounts.data?.find((item) => item.id === accountId);
  const counts = useMemo(() => {
    const list = transactions.data ?? [];
    return {
      buy: list.filter((item) => item.type === "BUY").length,
      sell: list.filter((item) => item.type === "SELL").length,
      deposits: list.filter((item) => item.type === "DEPOSIT").length,
      withdrawals: list.filter((item) => item.type === "WITHDRAWAL").length,
    };
  }, [transactions.data]);
  return (
    <div className="space-y-8">
      <Link href="/accounts" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white"><ArrowLeft size={13} /> Accounts</Link>
      <PageHeader title={account?.name ?? "Account Details"} description={account ? `${account.brokerName ?? "No broker"} · ${title(account.accountType)} · ${account.currency}` : "Review account transaction history and statistics."} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Buy Transactions" value={counts.buy} />
        <StatCard label="Sell Transactions" value={counts.sell} />
        <StatCard label="Deposits" value={counts.deposits} />
        <StatCard label="Withdrawals" value={counts.withdrawals} />
      </div>
      {transactions.isLoading ? <SkeletonGrid count={2} /> : transactions.data?.length ? <TransactionsTable transactions={transactions.data} /> : <EmptyState icon={<ArrowLeftRight size={18} />} title="No transaction history" description="Activity for this account will appear here." />}
    </div>
  );
}

export function TransactionsPage() {
  const { transactions, create } = useTransactions();
  const { accounts } = useAccounts();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const { marketAssets } = useMarketAssets(assetSearch);
  const filtered = useMemo(() => (transactions.data ?? []).filter((tx) => {
    const matchesType = filter === "ALL" || tx.type === filter;
    const haystack = `${tx.marketAsset?.symbol ?? ""} ${tx.marketAsset?.name ?? ""} ${tx.account?.name ?? ""}`.toLowerCase();
    return matchesType && haystack.includes(search.toLowerCase());
  }), [transactions.data, filter, search]);
  return (
    <div className="space-y-8">
      <PageHeader title="Transactions" description="Search, filter, paginate mentally for now, and record capital flow across accounts." action={<PrimaryButton onClick={() => setOpen(true)}><Plus size={14} /> Create Transaction</PrimaryButton>} />
      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" /><input className={cn(inputClass, "pl-9")} placeholder="Search transactions" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <select className={cn(selectClass, "lg:w-56")} value={filter} onChange={(event) => setFilter(event.target.value as TransactionType | "ALL")}>
            <option value="ALL">All Types</option>
            {transactionTypes.map((value) => <option key={value} value={value}>{title(value)}</option>)}
          </select>
        </div>
      </Panel>
      {transactions.isLoading ? <SkeletonGrid count={2} /> : filtered.length ? <TransactionsTable transactions={filtered} /> : <EmptyState icon={<ArrowLeftRight size={18} />} title="No matching transactions" description="Adjust search or create a new transaction." />}
      {open ? <Modal title="Create Transaction" description="Record buy, sell, income, transfer, or cash activity." onClose={() => setOpen(false)}><TransactionForm accounts={accounts.data ?? []} marketAssets={marketAssets.data ?? []} onSearch={setAssetSearch} pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Transaction created"); setOpen(false); } })} /></Modal> : null}
    </div>
  );
}

export function MarketAssetsPage() {
  const [query, setQuery] = useState("A");
  const [open, setOpen] = useState(false);
  const { marketAssets, create } = useMarketAssets(query);
  return (
    <div className="space-y-8">
      <PageHeader title="Market Assets" description="Search listed securities and register assets used by transactions." action={<PrimaryButton onClick={() => setOpen(true)}><Plus size={14} /> Create Market Asset</PrimaryButton>} />
      <Panel><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" /><input className={cn(inputClass, "pl-9")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by symbol or name" /></div></Panel>
      {marketAssets.isLoading ? <SkeletonGrid /> : marketAssets.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketAssets.data.map((asset) => (
            <Panel key={asset.id}>
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold text-white">{asset.symbol}</h2><p className="text-xs text-neutral-500">{asset.name}</p></div><span className="rounded-full border border-white/8 bg-white/3 px-2 py-1 text-[11px]">{title(asset.assetType)}</span></div>
              <div className="mt-5 space-y-2 text-xs text-neutral-500"><p>Exchange <span className="float-right text-neutral-300">{asset.exchange ?? "N/A"}</span></p><p>Sector <span className="float-right text-neutral-300">{asset.sector ?? "N/A"}</span></p><p>Currency <span className="float-right font-mono text-neutral-300">{asset.currency}</span></p></div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={<LineChart size={18} />} title="No market assets found" description="Search a symbol or create a market asset manually." />}
      {open ? <Modal title="Create Market Asset" onClose={() => setOpen(false)}><MarketAssetForm pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Market asset created"); setOpen(false); } })} /></Modal> : null}
    </div>
  );
}

export function CustomAssetsPage() {
  const { customAssets, create, update, remove } = useCustomAssets();
  const { portfolios } = usePortfolios();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<CustomAsset | null>(null);
  return (
    <div className="space-y-8">
      <PageHeader title="Custom Assets" description="Track real estate, collectibles, vehicles, art, and private assets." action={<PrimaryButton onClick={() => setOpen(true)}><Plus size={14} /> Create Asset</PrimaryButton>} />
      {customAssets.isLoading ? <SkeletonGrid /> : customAssets.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customAssets.data.map((asset) => (
            <Panel key={asset.id}>
              <div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-white">{asset.name}</h2><p className="mt-1 text-xs text-neutral-500">{title(asset.category)}</p></div><p className="text-sm font-semibold text-[#b5b5f6]">{money(asset.currentValue, asset.currency)}</p></div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-neutral-500"><span>Purchase <b className="block pt-1 font-normal text-neutral-300">{asset.purchasePrice ? money(asset.purchasePrice, asset.currency) : "N/A"}</b></span><span>Portfolio <b className="block truncate pt-1 font-normal text-neutral-300">{portfolios.data?.find((p) => p.id === asset.portfolioId)?.name ?? "Unassigned"}</b></span></div>
              <div className="mt-5 flex gap-2"><GhostButton onClick={() => setEdit(asset)}><Pencil size={13} /> Edit</GhostButton><GhostButton tone="danger" onClick={() => remove.mutate(asset.id, { onSuccess: () => toast.success("Asset deleted") })}><Trash2 size={13} /> Delete</GhostButton></div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={<Database size={18} />} title="No custom assets" description="Create a custom asset and optionally assign it to a portfolio." />}
      {open ? <Modal title="Create Custom Asset" onClose={() => setOpen(false)}><CustomAssetForm portfolios={portfolios.data ?? []} pending={create.isPending} onSubmit={(data) => create.mutate(data as CreateCustomAssetInput, { onSuccess: () => { toast.success("Asset created"); setOpen(false); } })} /></Modal> : null}
      {edit ? <Modal title="Edit Custom Asset" onClose={() => setEdit(null)}><CustomAssetForm initial={edit} portfolios={portfolios.data ?? []} pending={update.isPending} onSubmit={(data) => update.mutate({ assetId: edit.id, data: data as UpdateCustomAssetInput }, { onSuccess: () => { toast.success("Asset updated"); setEdit(null); } })} /></Modal> : null}
    </div>
  );
}

export function PortfoliosPage() {
  const router = useRouter();
  const { portfolios, create, update, remove } = usePortfolios();
  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<Portfolio | null>(null);
  return (
    <div className="space-y-8">
      <PageHeader title="Portfolios" description="Create and manage discrete allocation structures for your assets and accounts." action={<PrimaryButton onClick={() => setCreateOpen(true)}><Plus size={14} /> New Portfolio</PrimaryButton>} />
      {portfolios.isLoading ? <SkeletonGrid /> : portfolios.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.data.map((portfolio) => (
            <Panel key={portfolio.id}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-white">{portfolio.name}</h2><p className="mt-1 line-clamp-2 text-xs text-neutral-500">{portfolio.description || "No description"}</p></div><span className="rounded-full border border-white/8 bg-white/3 px-2 py-1 text-[11px] text-neutral-300">{title(portfolio.visibility)}</span></div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-neutral-500"><span>Accounts <b className="block pt-1 text-neutral-300">{portfolio._count?.accounts ?? 0}</b></span><span>Assets <b className="block pt-1 text-neutral-300">{portfolio._count?.holdings ?? 0}</b></span><span>Created <b className="block pt-1 font-normal text-neutral-300">{date(portfolio.createdAt)}</b></span></div>
              <div className="mt-5 flex flex-wrap gap-2"><GhostButton onClick={() => router.push(`/portfolios/${portfolio.id}`)}>View <ArrowRight size={13} /></GhostButton><GhostButton onClick={() => setEdit(portfolio)}><Pencil size={13} /> Edit</GhostButton><GhostButton tone="danger" onClick={() => remove.mutate(portfolio.id, { onSuccess: () => toast.success("Portfolio deleted") })}><Trash2 size={13} /> Delete</GhostButton></div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={<FolderKanban size={18} />} title="No portfolios" description="Create your first portfolio to organize accounts and assets." />}
      {createOpen ? <Modal title="Create Portfolio" onClose={() => setCreateOpen(false)}><PortfolioForm pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Portfolio created"); setCreateOpen(false); } })} /></Modal> : null}
      {edit ? <Modal title="Edit Portfolio" onClose={() => setEdit(null)}><PortfolioForm initial={edit} pending={update.isPending} onSubmit={(data) => update.mutate({ portfolioId: edit.id, data: { name: data.name, description: data.description || null } }, { onSuccess: () => { toast.success("Portfolio updated"); setEdit(null); } })} /></Modal> : null}
    </div>
  );
}

export function PortfolioDetailPage({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const portfolio = usePortfolio(portfolioId);
  const { customAssets } = useCustomAssets(portfolioId);
  const allocation = useAllocation();
  const assetCount = customAssets.data?.length ?? portfolio.data?._count?.holdings ?? 0;
  const portfolioValue = (customAssets.data ?? []).reduce((sum, item) => sum + item.currentValue, 0);
  if (portfolio.isLoading) return <SkeletonGrid count={4} />;
  if (portfolio.isError || !portfolio.data) return <ErrorState label="Portfolio not found." />;
  return (
    <div className="space-y-8">
      <button onClick={() => router.push("/portfolios")} className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white"><ArrowLeft size={13} /> Portfolios</button>
      <PageHeader title={portfolio.data.name} description={portfolio.data.description || "No description provided."} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><StatCard label="Asset Count" value={assetCount} /><StatCard label="Portfolio Value" value={money(portfolioValue)} color="text-[#b5b5f6]" /><StatCard label="Created" value={date(portfolio.data.createdAt)} /></div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel><h2 className="mb-4 text-sm font-semibold text-white">Custom Assets</h2>{customAssets.data?.length ? <div className="space-y-3">{customAssets.data.map((asset) => <div key={asset.id} className="flex justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3"><span className="text-sm text-white">{asset.name}</span><span className="text-sm text-[#b5b5f6]">{money(asset.currentValue, asset.currency)}</span></div>)}</div> : <EmptyState icon={<Database size={18} />} title="No custom assets" description="Assigned custom assets will appear here." />}</Panel>
        <Panel><h2 className="mb-4 text-sm font-semibold text-white">Allocation Chart</h2><div className="h-72">{allocation.data?.length ? <ResponsiveContainer><PieChart><Pie data={allocation.data} dataKey="currentValue" nameKey="symbol" innerRadius={58} outerRadius={95}>{allocation.data.map((_, index) => <Cell key={index} fill={accent[index % accent.length]} />)}</Pie><Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} /></PieChart></ResponsiveContainer> : <EmptyState icon={<BarChart3 size={18} />} title="Allocation unavailable" description="Allocation appears when analytics data is available." />}</div></Panel>
      </div>
      <Panel><h2 className="mb-4 text-sm font-semibold text-white">Market Assets</h2><EmptyState icon={<LineChart size={18} />} title="No market asset details" description="Market holdings will appear when the backend exposes portfolio-level holdings." /></Panel>
    </div>
  );
}

export function LiabilitiesPage() {
  const { liabilities, create, update, remove } = useLiabilities();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Liability | null>(null);
  const total = (liabilities.data ?? []).reduce((sum, item) => sum + item.outstanding, 0);
  const highest = Math.max(0, ...(liabilities.data ?? []).map((item) => item.outstanding));
  const avgRate = (liabilities.data ?? []).reduce((sum, item) => sum + Number(item.interestRate ?? 0), 0) / Math.max(liabilities.data?.length ?? 1, 1);
  return (
    <div className="space-y-8">
      <PageHeader title="Liabilities" description="Track outstanding debt, interest rates, and repayment exposure." action={<PrimaryButton onClick={() => setOpen(true)}><Plus size={14} /> Add Liability</PrimaryButton>} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><StatCard label="Total Debt" value={money(total)} color="text-[#f7bff4]" /><StatCard label="Highest Debt" value={money(highest)} /><StatCard label="Average Interest" value={`${Number.isFinite(avgRate) ? avgRate.toFixed(2) : "0.00"}%`} /></div>
      {liabilities.isLoading ? <SkeletonGrid /> : liabilities.data?.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{liabilities.data.map((item) => <Panel key={item.id}><div className="flex justify-between gap-3"><div><h2 className="text-sm font-semibold text-white">{item.name}</h2><p className="mt-1 text-xs text-neutral-500">{title(item.type)}</p></div><p className="text-sm font-semibold text-[#f7bff4]">{money(item.outstanding, item.currency)}</p></div><div className="mt-5 text-xs text-neutral-500">Interest <span className="float-right text-neutral-300">{item.interestRate ?? 0}%</span></div><div className="mt-5 flex gap-2"><GhostButton onClick={() => setEdit(item)}><Pencil size={13} /> Edit</GhostButton><GhostButton tone="danger" onClick={() => remove.mutate(item.id, { onSuccess: () => toast.success("Liability deleted") })}><Trash2 size={13} /> Delete</GhostButton></div></Panel>)}</div> : <EmptyState icon={<CircleDollarSign size={18} />} title="No liabilities" description="Add loans, cards, mortgages, or other debt to track net worth accurately." />}
      {open ? <Modal title="Create Liability" onClose={() => setOpen(false)}><LiabilityForm pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Liability created"); setOpen(false); } })} /></Modal> : null}
      {edit ? <Modal title="Edit Liability" onClose={() => setEdit(null)}><LiabilityForm initial={edit} pending={update.isPending} onSubmit={(data) => update.mutate({ liabilityId: edit.id, data }, { onSuccess: () => { toast.success("Liability updated"); setEdit(null); } })} /></Modal> : null}
    </div>
  );
}

export function AnalyticsPage() {
  const netWorth = useNetWorth();
  const allocation = useAllocation();
  const performance = usePerformance();
  const areaData = (performance.data ?? []).map((item) => ({ symbol: item.symbol, invested: item.investedAmount, value: item.currentValue, pnl: item.pnl }));
  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Professional net worth, allocation, performance, and PnL analysis." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><StatCard label="Net Worth" value={money(netWorth.data?.totalNetWorth)} color="text-[#b5b5f6]" /><StatCard label="Positions" value={netWorth.data?.holdings.length ?? 0} /><StatCard label="Total PnL" value={money((performance.data ?? []).reduce((sum, item) => sum + item.pnl, 0))} color="text-[#f7bff4]" /></div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel><h2 className="mb-4 text-sm font-semibold text-white">Allocation Breakdown</h2><div className="h-80"><ResponsiveContainer><PieChart><Pie data={allocation.data ?? []} dataKey="currentValue" nameKey="symbol" innerRadius={65} outerRadius={105}>{(allocation.data ?? []).map((_, index) => <Cell key={index} fill={accent[index % accent.length]} />)}</Pie><Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} /></PieChart></ResponsiveContainer></div></Panel>
        <Panel><h2 className="mb-4 text-sm font-semibold text-white">Performance Analysis</h2><div className="h-80"><ResponsiveContainer><AreaChart data={areaData}><CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} /><XAxis dataKey="symbol" stroke="#737373" fontSize={11} /><YAxis stroke="#737373" fontSize={11} /><Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} /><Area type="monotone" dataKey="value" stroke="#b5b5f6" fill="#b5b5f6" fillOpacity={0.16} /></AreaChart></ResponsiveContainer></div></Panel>
      </div>
      <Panel><h2 className="mb-4 text-sm font-semibold text-white">PnL Analysis</h2>{performance.isLoading ? <SkeletonGrid count={2} /> : performance.data?.length ? <TransactionsTable transactions={[]} /> : <EmptyState icon={<BarChart3 size={18} />} title="No PnL data" description="Performance analytics will appear after priced holdings are available." />}</Panel>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useUser();
  const profile = user.data;
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Review profile information synced from your authenticated PixelFi account." />
      <Panel className="max-w-3xl">
        <div className="flex items-center gap-4 border-b border-white/5 pb-5">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {profile?.imageUrl ? <Image src={profile.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : null}
          </div>
          <div><h2 className="text-lg font-semibold text-white">{profile?.firstName || profile?.username || "Investor"} {profile?.lastName ?? ""}</h2><p className="text-sm text-neutral-500">{profile?.email ?? "No email"}</p></div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StatCard label="Email" value={<span className="break-all text-base">{profile?.email ?? "N/A"}</span>} />
          <StatCard label="Username" value={<span className="text-base">{profile?.username ?? "N/A"}</span>} />
          <StatCard label="Avatar" value={<span className="text-base">{profile?.imageUrl ? "Configured" : "Not set"}</span>} />
          <StatCard label="Base Currency" value={<span className="text-base">USD</span>} sub="Profile preference placeholder" />
        </div>
      </Panel>
    </div>
  );
}
