"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Copy,
  Database,
  FolderKanban,
  Globe,
  Key,
  LineChart,
  Lock,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Target,
  Trash2,
  User,
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
import { useCustomAssets, useMarketAssets, useUserMarketAssets } from "@/hooks/useAssets";
import { useLiabilities } from "@/hooks/useLiabilities";
import { usePortfolio, usePortfolios } from "@/hooks/usePortfolio";
import { useTransactions } from "@/hooks/useTransaction";
import { useExpenses } from "@/hooks/useExpense";
import { useGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import type { Account } from "@/services/account.service";
import type {
  CreateCustomAssetInput,
  CustomAsset,
  MarketAsset,
  UpdateCustomAssetInput,
  UserMarketAsset,
} from "@/services/asset.service";
import type { Liability } from "@/services/liability.service";
import type { Portfolio } from "@/services/portfolio.service";
import type { Transaction, TransactionType } from "@/services/transaction.service";
import type { Expense, CreateExpenseInput, ExpenseCategory } from "@/services/expense.service";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/services/goal.service";
import SearchCommand from "./SearchCommand";

const accent = ["#b5b5f6", "#f7bff4", "#d8c4ff", "#a7f3d0", "#93c5fd", "#fcd34d"];
const transactionTypes = ["BUY", "SELL", "DIVIDEND", "DEPOSIT", "WITHDRAWAL", "INTEREST", "TRANSFER"] as const;
const accountTypes = ["BROKERAGE", "BANK", "CRYPTO"] as const;
const liabilityTypes = ["MORTGAGE", "CAR_LOAN", "PERSONAL_LOAN", "CREDIT_CARD", "OTHER"] as const;
const customCategories = ["REAL_ESTATE", "VEHICLE", "LUXURY_ITEM", "ART", "COLLECTIBLE", "OTHER"] as const;
const marketAssetTypes = ["STOCK", "ETF", "CRYPTO", "BOND", "MUTUAL_FUND"] as const;
const expenseCategories = ["FOOD", "RENT", "TRAVEL", "SHOPPING", "UTILITIES", "HEALTHCARE", "OTHER"] as const;

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

function GhostButton({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: "default" | "danger";
  className?: string;
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
          : "border-white/8 bg-white/3 text-neutral-300 hover:border-white/15 hover:text-white",
        className
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 px-5 py-16 text-center">
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
  type AccountFormValues = z.infer<typeof accountSchema>;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      brokerName: "",
      accountType: "BROKERAGE",
      currency: "USD",
    },
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
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
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
    defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "", visibility: initial?.visibility ?? "PRIVATE" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Portfolio Name" error={form.formState.errors.name?.message}>
        <input className={inputClass} placeholder="Growth Portfolio" {...form.register("name")} />
      </Field>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea className={cn(inputClass, "h-24 py-3")} placeholder="Strategy or purpose" {...form.register("description")} />
      </Field>
      <Field label="Visibility">
        <select className={selectClass} {...form.register("visibility")}>
          <option value="PRIVATE">Private</option>
          <option value="PUBLIC">Public</option>
        </select>
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
  type LiabilityFormValues = z.infer<typeof liabilitySchema>;

  const form = useForm<LiabilityFormValues>({
    resolver: zodResolver(liabilitySchema) as any,
    defaultValues: {
      name: initial?.name ?? "",
      type: initial?.type ?? "OTHER",
      originalAmount: initial?.originalAmount ?? 0,
      outstanding: initial?.outstanding ?? 0,
      interestRate: initial?.interestRate ?? undefined,
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

const trackAssetSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  averageCost: z.coerce.number().nonnegative(),
  portfolioId: z.string().optional(),
});

function TrackAssetForm({
  symbol,
  name,
  initialValues,
  portfolios,
  onSubmit,
  pending,
}: {
  symbol: string;
  name: string;
  initialValues?: { quantity: number; averageCost: number; portfolioId?: string };
  portfolios: Portfolio[];
  onSubmit: (data: z.infer<typeof trackAssetSchema>) => void;
  pending: boolean;
}) {
  const form = useForm<z.infer<typeof trackAssetSchema>>({
    resolver: zodResolver(trackAssetSchema) as any,
    defaultValues: {
      symbol,
      name,
      quantity: initialValues?.quantity ?? 0,
      averageCost: initialValues?.averageCost ?? 0,
      portfolioId: initialValues?.portfolioId ?? "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-sm">
        <p className="font-semibold text-white">{symbol}</p>
        <p className="text-xs text-neutral-400">{name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity Owned" error={form.formState.errors.quantity?.message}>
          <input className={inputClass} type="number" step="0.0001" {...form.register("quantity")} />
        </Field>
        <Field label="Average Buy Price" error={form.formState.errors.averageCost?.message}>
          <input className={inputClass} type="number" step="0.01" {...form.register("averageCost")} />
        </Field>
      </div>

      <Field label="Portfolio (Optional)" error={form.formState.errors.portfolioId?.message}>
        <select className={selectClass} {...form.register("portfolioId")}>
          <option value="">Unassigned</option>
          {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Track Stock Holding
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
  type CustomAssetFormValues = z.infer<typeof customAssetSchema>;

  const form = useForm<CustomAssetFormValues>({
    resolver: zodResolver(customAssetSchema) as any,
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "OTHER",
      currentValue: initial?.currentValue ?? 0,
      currency: initial?.currency ?? "USD",

      ...(initial?.purchasePrice != null && {
        purchasePrice: initial.purchasePrice,
      }),

      ...(initial?.purchaseDate && {
        purchaseDate: initial.purchaseDate.slice(0, 10),
      }),

      ...(initial?.portfolioId && {
        portfolioId: initial.portfolioId,
      }),
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

// ─────────────────────────────────────────────────────────────
// TRANSACTION FORM — Smart multi-mode, field-adaptive
// ─────────────────────────────────────────────────────────────

// Modes as seen by the user
type TxMode = "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND" | "INTEREST" | "TRANSFER" | "EXPENSE";

const TX_MODE_META: Record<TxMode, { label: string; description: string; color: string; needsAsset: boolean; needsQtyPrice: boolean; needsAmount: boolean; needsFees: boolean; needsDestAccount: boolean; isExpense: boolean }> = {
  BUY:        { label: "Buy",        description: "Purchase a market asset (stock, ETF, crypto…)",   color: "text-emerald-400",  needsAsset: true,  needsQtyPrice: true,  needsAmount: false, needsFees: true,  needsDestAccount: false, isExpense: false },
  SELL:       { label: "Sell",       description: "Sell shares / units of a held asset",              color: "text-red-400",      needsAsset: true,  needsQtyPrice: true,  needsAmount: false, needsFees: true,  needsDestAccount: false, isExpense: false },
  DEPOSIT:    { label: "Deposit",    description: "Cash deposit into an account",                    color: "text-[#b5b5f6]",   needsAsset: false, needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: false, isExpense: false },
  WITHDRAWAL: { label: "Withdrawal", description: "Cash withdrawal from an account",                 color: "text-orange-400",   needsAsset: false, needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: false, isExpense: false },
  TRANSFER:   { label: "Transfer",   description: "Move funds between two of your accounts",         color: "text-sky-400",      needsAsset: false, needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: true,  isExpense: false },
  DIVIDEND:   { label: "Dividend",   description: "Dividend income from an asset",                   color: "text-yellow-400",   needsAsset: true,  needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: false, isExpense: false },
  INTEREST:   { label: "Interest",   description: "Interest credited to your account",               color: "text-cyan-400",     needsAsset: false, needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: false, isExpense: false },
  EXPENSE:    { label: "Expense",    description: "Record an expense (food, rent, travel…)",         color: "text-[#f7bff4]",   needsAsset: false, needsQtyPrice: false, needsAmount: true,  needsFees: false, needsDestAccount: false, isExpense: true  },
};

const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  marketAssetId: z.string().optional(),
  type: z.enum(transactionTypes),
  quantity: z.coerce.number().nonnegative().optional(),
  price: z.coerce.number().nonnegative().optional(),
  amount: z.coerce.number().nonnegative().optional(),
  fees: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(3).max(5),
  executedAt: z.string().min(1),
});

const expenseSchema = z.object({
  accountId: z.string().optional(),
  category: z.enum(expenseCategories),
  title: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be > 0"),
  currency: z.string().min(3).max(5),
  occurredAt: z.string().min(1),
});

function ModeButton({ mode, active, onClick }: { mode: TxMode; active: boolean; onClick: () => void }) {
  const meta = TX_MODE_META[mode];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
        active
          ? "border-[#b5b5f6]/50 bg-[#b5b5f6]/10 ring-1 ring-[#b5b5f6]/20"
          : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
      )}
    >
      <span className={cn("text-xs font-semibold", active ? meta.color : "text-neutral-300")}>{meta.label}</span>
    </button>
  );
}

function SmartTransactionForm({
  accounts,
  marketAssets,
  onSearch,
  onSubmitTransaction,
  onSubmitExpense,
  pendingTx,
  pendingExp,
}: {
  accounts: Account[];
  marketAssets: MarketAsset[];
  onSearch: (value: string) => void;
  onSubmitTransaction: (data: z.infer<typeof transactionSchema>) => void;
  onSubmitExpense: (data: CreateExpenseInput) => void;
  pendingTx: boolean;
  pendingExp: boolean;
}) {
  const [mode, setMode] = useState<TxMode>("BUY");
  const meta = TX_MODE_META[mode];

  // ── Transaction form ──────────────────────────────
  const txForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      accountId: accounts[0]?.id ?? "",
      type: "BUY",
      currency: accounts[0]?.currency ?? "USD",
      executedAt: new Date().toISOString().slice(0, 10),
    },
  });
  const selectedAccountId = useWatch({ control: txForm.control, name: "accountId" });
  const selectedMarketAssetId = useWatch({ control: txForm.control, name: "marketAssetId" });
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // ── Expense form ──────────────────────────────────
  const expForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      category: "OTHER",
      currency: accounts[0]?.currency ?? "USD",
      occurredAt: new Date().toISOString().slice(0, 10),
    },
  });

  // Sync mode → transaction type field
  const handleModeChange = (m: TxMode) => {
    setMode(m);
    if (m !== "EXPENSE") {
      txForm.setValue("type", m as TransactionType);
      txForm.clearErrors();
    }
  };

  const handleTxSubmit = txForm.handleSubmit((data) => {
    onSubmitTransaction({
      ...data,
      currency: data.currency.toUpperCase(),
      executedAt: new Date(data.executedAt).toISOString(),
      marketAssetId: data.marketAssetId || undefined,
    });
  });

  const handleExpSubmit = expForm.handleSubmit((data) => {
    onSubmitExpense({
      category: data.category,
      title: data.title || undefined,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      occurredAt: new Date(data.occurredAt).toISOString(),
      accountId: data.accountId || undefined,
    });
  });

  // Account type determines which asset types are most relevant
  const accountType = selectedAccount?.accountType;
  const assetPlaceholder =
    accountType === "CRYPTO" ? "BTC, ETH, SOL…" :
    accountType === "BROKERAGE" ? "AAPL, MSFT, SPY…" :
    "AAPL, BTC, SPY…";

  return (
    <div className="space-y-5">
      {/* Mode Picker */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Activity Type</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(TX_MODE_META) as TxMode[]).map((m) => (
            <ModeButton key={m} mode={m} active={mode === m} onClick={() => handleModeChange(m)} />
          ))}
        </div>
        {/* Mode description */}
        <p className={cn("mt-2.5 text-xs", meta.color)}>{meta.description}</p>
      </div>

      <div className="border-t border-white/5" />

      {/* ── EXPENSE FORM ─────────────────────────────────── */}
      {meta.isExpense ? (
        <form onSubmit={handleExpSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={expForm.formState.errors.category?.message}>
              <select className={selectClass} {...expForm.register("category")}>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>{title(cat)}</option>
                ))}
              </select>
            </Field>
            <Field label="Title (optional)" error={expForm.formState.errors.title?.message}>
              <input className={inputClass} placeholder="e.g. Grocery run" {...expForm.register("title")} />
            </Field>
            <Field label="Amount" error={expForm.formState.errors.amount?.message}>
              <input className={inputClass} type="number" step="0.01" min="0.01" placeholder="0.00" {...expForm.register("amount")} />
            </Field>
            <Field label="Currency" error={expForm.formState.errors.currency?.message}>
              <input className={inputClass} placeholder="USD" {...expForm.register("currency")} />
            </Field>
            <Field label="Date" error={expForm.formState.errors.occurredAt?.message}>
              <input className={inputClass} type="date" {...expForm.register("occurredAt")} />
            </Field>
            <Field label="Debit Account (optional)" error={expForm.formState.errors.accountId?.message}>
              <select className={selectClass} {...expForm.register("accountId")}>
                <option value="">No account deduction</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                ))}
              </select>
            </Field>
          </div>
          <PrimaryButton type="submit" disabled={pendingExp}>
            {pendingExp ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Record Expense
          </PrimaryButton>
        </form>
      ) : (
        /* ── TRANSACTION FORM ──────────────────────────────── */
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Account selector — always shown */}
            <Field label="Source Account" error={txForm.formState.errors.accountId?.message}>
              <select
                className={selectClass}
                {...txForm.register("accountId")}
                onChange={(e) => {
                  txForm.setValue("accountId", e.target.value);
                  const acc = accounts.find((a) => a.id === e.target.value);
                  if (acc) txForm.setValue("currency", acc.currency);
                }}
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {acc.accountType} ({acc.currency})
                  </option>
                ))}
              </select>
            </Field>

            {/* Destination account — only TRANSFER */}
            {meta.needsDestAccount ? (
              <Field label="Destination Account">
                <select className={selectClass}>
                  <option value="">Select destination</option>
                  {accounts.filter((a) => a.id !== selectedAccountId).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — {acc.accountType}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            {/* Qty + Price — only BUY / SELL */}
            {meta.needsQtyPrice ? (
              <>
                <Field label="Quantity" error={txForm.formState.errors.quantity?.message}>
                  <input className={inputClass} type="number" step="0.0001" min="0" placeholder="0.0000" {...txForm.register("quantity")} />
                </Field>
                <Field label="Price per unit" error={txForm.formState.errors.price?.message}>
                  <input className={inputClass} type="number" step="0.01" min="0" placeholder="0.00" {...txForm.register("price")} />
                </Field>
              </>
            ) : null}

            {/* Amount — DEPOSIT/WITHDRAWAL/TRANSFER/DIVIDEND/INTEREST */}
            {meta.needsAmount ? (
              <Field label="Amount" error={txForm.formState.errors.amount?.message}>
                <input className={inputClass} type="number" step="0.01" min="0" placeholder="0.00" {...txForm.register("amount")} />
              </Field>
            ) : null}

            {/* Fees — BUY / SELL only */}
            {meta.needsFees ? (
              <Field label="Fees / Commission" error={txForm.formState.errors.fees?.message}>
                <input className={inputClass} type="number" step="0.01" min="0" placeholder="0.00" {...txForm.register("fees")} />
              </Field>
            ) : null}

            <Field label="Currency" error={txForm.formState.errors.currency?.message}>
              <input className={inputClass} placeholder="USD" {...txForm.register("currency")} />
            </Field>
            <Field label="Date" error={txForm.formState.errors.executedAt?.message}>
              <input className={inputClass} type="date" {...txForm.register("executedAt")} />
            </Field>
          </div>

          {/* Asset selector — BUY / SELL / DIVIDEND */}
          {meta.needsAsset ? (
            <div className="space-y-2">
              <Field label={`Search ${accountType === "CRYPTO" ? "Crypto" : accountType === "BROKERAGE" ? "Stock / ETF" : "Market Asset"}`}>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                  <input
                    className={cn(inputClass, "pl-9")}
                    placeholder={assetPlaceholder}
                    onChange={(e) => onSearch(e.target.value)}
                  />
                </div>
              </Field>
              {marketAssets.length ? (
                <div className="grid max-h-44 gap-1.5 overflow-y-auto rounded-xl border border-white/8 bg-white/2 p-2">
                  {marketAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => txForm.setValue("marketAssetId", asset.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition hover:border-white/20",
                        selectedMarketAssetId === asset.id
                          ? "border-[#b5b5f6]/50 bg-[#b5b5f6]/8"
                          : "border-white/5"
                      )}
                    >
                      <span className="font-semibold text-white w-16 shrink-0">{asset.symbol}</span>
                      <span className="text-xs text-neutral-400 truncate flex-1">{asset.name}</span>
                      <span className="text-[10px] text-neutral-600 uppercase shrink-0">{asset.assetType}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {selectedMarketAssetId ? (
                <div className="flex items-center justify-between rounded-xl border border-[#b5b5f6]/30 bg-[#b5b5f6]/8 px-3 py-2">
                  <span className="text-xs text-[#b5b5f6]">
                    ✓ Asset selected
                  </span>
                  <button
                    type="button"
                    onClick={() => txForm.setValue("marketAssetId", undefined)}
                    className="text-[11px] text-neutral-500 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <PrimaryButton type="submit" disabled={pendingTx || !accounts.length}>
            {pendingTx ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {mode === "BUY" ? "Execute Buy" :
             mode === "SELL" ? "Execute Sell" :
             mode === "TRANSFER" ? "Execute Transfer" :
             `Record ${TX_MODE_META[mode].label}`}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TRANSACTIONS TABLE
// ─────────────────────────────────────────────────────────────

const TX_TYPE_COLORS: Record<string, string> = {
  BUY:        "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  SELL:       "border-red-500/25 bg-red-500/10 text-red-300",
  DEPOSIT:    "border-[#b5b5f6]/25 bg-[#b5b5f6]/10 text-[#b5b5f6]",
  WITHDRAWAL: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  DIVIDEND:   "border-yellow-500/25 bg-yellow-500/10 text-yellow-300",
  INTEREST:   "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  TRANSFER:   "border-sky-500/25 bg-sky-500/10 text-sky-300",
  EXPENSE:    "border-[#f7bff4]/25 bg-[#f7bff4]/10 text-[#f7bff4]",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", TX_TYPE_COLORS[type] ?? "border-white/8 bg-white/3 text-neutral-300")}>
      {title(type)}
    </span>
  );
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/20">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/1 text-[10px] uppercase tracking-wider text-neutral-500">
            {["Date", "Type", "Asset / Description", "Account", "Qty", "Price", "Amount", "Fees"].map((head) => (
              <th key={head} className="px-4 py-3 font-medium">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.map((tx) => (
            <tr key={tx.id} className="group transition hover:bg-white/1">
              <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{date(tx.executedAt)}</td>
              <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
              <td className="px-4 py-3">
                <p className="font-medium text-white text-sm">{tx.marketAsset?.symbol ?? "Cash"}</p>
                <p className="text-xs text-neutral-500 truncate max-w-36" title={tx.marketAsset?.name ?? ""}>{tx.marketAsset?.name ?? ""}</p>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">{tx.account?.name ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-300">{tx.quantity ? Number(tx.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-300">{tx.price ? money(tx.price, tx.currency) : "—"}</td>
              <td className="px-4 py-3 font-mono text-xs font-medium text-white">{money(tx.amount ?? (Number(tx.quantity ?? 0) * Number(tx.price ?? 0)), tx.currency)}</td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-500">{tx.fees ? money(tx.fees, tx.currency) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/20">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/1 text-[10px] uppercase tracking-wider text-neutral-500">
            {["Date", "Category", "Title", "Account", "Amount"].map((head) => (
              <th key={head} className="px-4 py-3 font-medium">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {expenses.map((exp) => (
            <tr key={exp.id} className="group transition hover:bg-white/1">
              <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{date(exp.occurredAt)}</td>
              <td className="px-4 py-3"><TypeBadge type={"EXPENSE"} /><span className="ml-2 text-[10px] text-neutral-400 uppercase tracking-wide">{title(exp.category)}</span></td>
              <td className="px-4 py-3 text-sm text-neutral-300">{exp.title ?? <span className="text-neutral-600">—</span>}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{exp.account?.name ?? <span className="text-neutral-600">—</span>}</td>
              <td className="px-4 py-3 font-mono text-xs font-semibold text-[#f7bff4]">-{money(exp.amount, exp.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TRANSACTIONS PAGE
// ─────────────────────────────────────────────────────────────

type TxPageTab = "transactions" | "expenses" | "all";

export function TransactionsPage() {
  const { transactions, create } = useTransactions();
  const { accounts } = useAccounts();
  const { expenses, create: createExp } = useExpenses();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TxPageTab>("transactions");
  const [txFilter, setTxFilter] = useState<TransactionType | "ALL">("ALL");
  const [expFilter, setExpFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const { marketAssets } = useMarketAssets(assetSearch);

  const filteredTx = useMemo(() =>
    (transactions.data ?? []).filter((tx) => {
      const matchesType = txFilter === "ALL" || tx.type === txFilter;
      const hay = `${tx.marketAsset?.symbol ?? ""} ${tx.marketAsset?.name ?? ""} ${tx.account?.name ?? ""}`.toLowerCase();
      return matchesType && hay.includes(search.toLowerCase());
    }),
    [transactions.data, txFilter, search]
  );

  const filteredExp = useMemo(() =>
    (expenses.data ?? []).filter((exp) => {
      const matchesCat = expFilter === "ALL" || exp.category === expFilter;
      const hay = `${exp.title ?? ""} ${exp.account?.name ?? ""} ${exp.category}`.toLowerCase();
      return matchesCat && hay.includes(search.toLowerCase());
    }),
    [expenses.data, expFilter, search]
  );

  const txTotal = useMemo(() => {
    const buys = (transactions.data ?? []).filter((t) => t.type === "BUY").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const sells = (transactions.data ?? []).filter((t) => t.type === "SELL").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const expTotal = (expenses.data ?? []).reduce((s, e) => s + Number(e.amount), 0);
    return { buys, sells, expTotal };
  }, [transactions.data, expenses.data]);

  const tabClass = (t: TxPageTab) => cn(
    "px-4 py-2 text-xs font-semibold rounded-full transition-all",
    tab === t
      ? "bg-[#b5b5f6]/15 text-[#b5b5f6] border border-[#b5b5f6]/30"
      : "text-neutral-500 hover:text-neutral-300 border border-transparent"
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Record and review all your trading activity, cash movements, and expenses in one place."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus size={14} /> New Entry
          </PrimaryButton>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Trades Executed"
          value={(transactions.data ?? []).filter((t) => t.type === "BUY" || t.type === "SELL").length}
          icon={<ArrowLeftRight size={15} />}
        />
        <StatCard
          label="Capital Deployed (Buys)"
          value={money(txTotal.buys)}
          color="text-emerald-400"
          icon={<CircleDollarSign size={15} />}
        />
        <StatCard
          label="Capital Returned (Sells)"
          value={money(txTotal.sells)}
          color="text-[#b5b5f6]"
          icon={<CircleDollarSign size={15} />}
        />
        <StatCard
          label="Total Expenses"
          value={money(txTotal.expTotal)}
          color="text-[#f7bff4]"
          icon={<Wallet size={15} />}
        />
      </div>

      {/* Tab + search + filter bar */}
      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button className={tabClass("transactions")} onClick={() => setTab("transactions")}>Transactions</button>
            <button className={tabClass("expenses")} onClick={() => setTab("expenses")}>Expenses</button>
            <button className={tabClass("all")} onClick={() => setTab("all")}>All Activity</button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input className={cn(inputClass, "pl-9")} placeholder={`Search ${tab}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {tab !== "expenses" && (
              <select className={cn(selectClass, "lg:w-48")} value={txFilter} onChange={(e) => setTxFilter(e.target.value as TransactionType | "ALL")}>
                <option value="ALL">All Types</option>
                {transactionTypes.map((t) => <option key={t} value={t}>{title(t)}</option>)}
              </select>
            )}
            {tab !== "transactions" && (
              <select className={cn(selectClass, "lg:w-48")} value={expFilter} onChange={(e) => setExpFilter(e.target.value as ExpenseCategory | "ALL")}>
                <option value="ALL">All Categories</option>
                {expenseCategories.map((c) => <option key={c} value={c}>{title(c)}</option>)}
              </select>
            )}
          </div>
        </div>
      </Panel>

      {/* Tables */}
      {tab === "transactions" && (
        transactions.isLoading
          ? <SkeletonGrid count={2} />
          : filteredTx.length
            ? <TransactionsTable transactions={filteredTx} />
            : <EmptyState icon={<ArrowLeftRight size={18} />} title="No transactions" description="Create your first trade, deposit, or transfer above." />
      )}

      {tab === "expenses" && (
        expenses.isLoading
          ? <SkeletonGrid count={2} />
          : filteredExp.length
            ? <ExpensesTable expenses={filteredExp} />
            : <EmptyState icon={<Wallet size={18} />} title="No expenses recorded" description="Log an expense using the New Entry button above." />
      )}

      {tab === "all" && (
        (transactions.isLoading || expenses.isLoading)
          ? <SkeletonGrid count={3} />
          : (
            <div className="space-y-6">
              {filteredTx.length ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Transactions ({filteredTx.length})</p>
                  <TransactionsTable transactions={filteredTx} />
                </div>
              ) : null}
              {filteredExp.length ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Expenses ({filteredExp.length})</p>
                  <ExpensesTable expenses={filteredExp} />
                </div>
              ) : null}
              {!filteredTx.length && !filteredExp.length && (
                <EmptyState icon={<ArrowLeftRight size={18} />} title="No activity found" description="Adjust search filters or record your first entry." />
              )}
            </div>
          )
      )}

      {/* Smart create modal */}
      {open ? (
        <Modal
          title="New Activity Entry"
          description="Select the activity type — fields adapt automatically based on your choice."
          onClose={() => setOpen(false)}
        >
          <SmartTransactionForm
            accounts={accounts.data ?? []}
            marketAssets={marketAssets.data ?? []}
            onSearch={setAssetSearch}
            pendingTx={create.isPending}
            pendingExp={createExp.isPending}
            onSubmitTransaction={(data) =>
              create.mutate(data, {
                onSuccess: () => { toast.success("Transaction recorded"); setOpen(false); },
                onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to record transaction"),
              })
            }
            onSubmitExpense={(data) =>
              createExp.mutate(data, {
                onSuccess: () => { toast.success("Expense recorded"); setOpen(false); },
                onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to record expense"),
              })
            }
          />
        </Modal>
      ) : null}
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
                <div key={holding.marketAssetId} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 p-3">
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
          <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-sm leading-6 text-neutral-400">Investment summary: {performance.data?.length ? `You are tracking ${performance.data.length} priced positions with aggregate net worth of ${money(netWorth.data?.totalNetWorth)}.` : "Add transactions and holdings to unlock portfolio-level insights."}</div>
          <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-sm leading-6 text-neutral-400">Asset distribution: {allocation.data?.length ? `${allocation.data[0]?.symbol ?? "Top asset"} currently leads allocation exposure.` : "Allocation data will appear once holdings are available."}</div>
        </div>
      </Panel>
    </div>
  );
}

export function AccountsPage() {
  const { accounts, create, remove, update } = useAccounts();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [editMode, setEditMode] = useState<"balance" | "emergency">("balance");
  const [balanceInput, setBalanceInput] = useState("");
  const [emergencyInput, setEmergencyInput] = useState("");

  // Emergency fund spend prompt state
  const [spendPrompt, setSpendPrompt] = useState<{
    account: Account;
    shortfall: number;
    amount: number;
    onProceed: () => void;
  } | null>(null);

  const totalBalance = useMemo(() => {
    if (!accounts.data) return null;
    const byType: Record<string, number> = {};
    for (const acc of accounts.data) {
      const bal = Number(acc.currentBalance ?? 0);
      byType[acc.accountType] = (byType[acc.accountType] ?? 0) + bal;
    }
    return {
      grand: accounts.data.reduce((s, a) => s + Number(a.currentBalance ?? 0), 0),
      totalEmergency: accounts.data.reduce((s, a) => s + Number(a.emergencyFund ?? 0), 0),
      byType,
    };
  }, [accounts.data]);

  function accountTypeIcon(type: string) {
    if (type === "BANK") return <CircleDollarSign size={14} />;
    if (type === "CRYPTO") return <Database size={14} />;
    return <BriefcaseBusiness size={14} />;
  }

  function accountTypeColor(type: string) {
    if (type === "BANK") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (type === "CRYPTO") return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    return "text-[#b5b5f6] bg-[#b5b5f6]/10 border-[#b5b5f6]/20";
  }

  function openEditBalance(account: Account) {
    setEditTarget(account);
    setEditMode("balance");
    setBalanceInput(String(Number(account.currentBalance ?? 0)));
  }

  function openEditEmergency(account: Account) {
    setEditTarget(account);
    setEditMode("emergency");
    setEmergencyInput(String(Number(account.emergencyFund ?? 0)));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        description="Manage brokerages, banks, and crypto venues used across your wealth stack."
        action={<PrimaryButton onClick={() => setCreateOpen(true)}><Plus size={14} /> Add Account</PrimaryButton>}
      />

      {/* Summary Stats Row */}
      {!accounts.isLoading && !accounts.isError && accounts.data && accounts.data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Total Balance"
            value={money(totalBalance?.grand ?? 0)}
            icon={<Wallet size={14} />}
            color="text-[#b5b5f6]"
          />
          <StatCard
            label="Brokerage"
            value={money(totalBalance?.byType["BROKERAGE"] ?? 0)}
            icon={<BriefcaseBusiness size={14} />}
          />
          <StatCard
            label="Bank"
            value={money(totalBalance?.byType["BANK"] ?? 0)}
            icon={<CircleDollarSign size={14} />}
            color="text-emerald-400"
          />
          <StatCard
            label="Emergency Funds"
            value={money(totalBalance?.totalEmergency ?? 0)}
            icon={<ShieldCheck size={14} />}
            color="text-amber-400"
          />
        </div>
      )}

      {accounts.isError ? <ErrorState /> : accounts.isLoading ? <SkeletonGrid /> : accounts.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.data.map((account) => {
            const balance = Number(account.currentBalance ?? 0);
            const emergency = Number(account.emergencyFund ?? 0);
            return (
              <Panel key={account.id} className="flex flex-col justify-between gap-5 hover:border-white/10 transition duration-300">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accountTypeColor(account.accountType)}`}>
                      {accountTypeIcon(account.accountType)}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white leading-tight">{account.name}</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">{account.brokerName || "No broker"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${accountTypeColor(account.accountType)}`}>
                    {title(account.accountType)}
                  </span>
                </div>

                {/* Balance */}
                <div className="space-y-2">
                  <div className="rounded-xl bg-white/3 border border-white/5 px-4 py-3">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Current Balance</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-white font-mono">
                      {money(balance, account.currency)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-600">{account.currency}</p>
                  </div>
                  {/* Emergency Fund */}
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={13} className="text-amber-400" />
                      <span className="text-[11px] text-amber-400/80 font-medium">Emergency Fund</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-amber-300 font-mono">{money(emergency, account.currency)}</span>
                      <button
                        onClick={() => openEditEmergency(account)}
                        className="rounded-lg p-1 text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition"
                        title="Edit emergency fund"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 text-xs text-neutral-500">
                  <span>Created <b className="block pt-1 font-normal text-neutral-300">{date(account.createdAt)}</b></span>
                  <span>Updated <b className="block pt-1 font-normal text-neutral-300">{date(account.updatedAt)}</b></span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <Link href={`/accounts/${account.id}`} className="inline-flex items-center gap-1 text-xs text-[#b5b5f6] hover:text-white transition">
                    View Details <ArrowRight size={12} />
                  </Link>
                  <div className="flex gap-2">
                    <GhostButton onClick={() => openEditBalance(account)}>
                      <Pencil size={13} /> Edit
                    </GhostButton>
                    <GhostButton tone="danger" onClick={() => setDeleteTarget(account)}>
                      <Trash2 size={13} /> Delete
                    </GhostButton>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : <EmptyState icon={<Wallet size={18} />} title="No accounts" description="Add your first account to start organizing transactions and balances." />}

      {/* Create Modal */}
      {createOpen ? (
        <Modal title="Add Account" description="Create a new financial account." onClose={() => setCreateOpen(false)}>
          <AccountForm pending={create.isPending} onSubmit={(data) => create.mutate(data, { onSuccess: () => { toast.success("Account created"); setCreateOpen(false); } })} />
        </Modal>
      ) : null}

      {/* Delete Modal */}
      {deleteTarget ? (
        <Modal title="Delete Account" description={`Delete ${deleteTarget.name}? This cannot be undone.`} onClose={() => setDeleteTarget(null)}>
          <GhostButton tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(deleteTarget.id, { onSuccess: () => { toast.success("Account deleted"); setDeleteTarget(null); } })}>
            {remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Account
          </GhostButton>
        </Modal>
      ) : null}

      {/* Edit Balance / Emergency Fund Modal */}
      {editTarget ? (
        <Modal
          title={editMode === "balance" ? `Edit Balance — ${editTarget.name}` : `Edit Emergency Fund — ${editTarget.name}`}
          description={
            editMode === "balance"
              ? `Update the current balance for this ${title(editTarget.accountType)} account (${editTarget.currency}).`
              : `Set aside an emergency reserve for this account. This amount is kept separate from your active balance and is only suggested as a fallback when you're short on funds.`
          }
          onClose={() => setEditTarget(null)}
        >
          <div className="space-y-4">
            {editMode === "emergency" && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300/80">
                  Your emergency fund is <strong>not</strong> counted in your active balance. It will only be suggested when you attempt to record an expense that exceeds your current balance.
                </p>
              </div>
            )}
            <Field label={editMode === "balance" ? `Balance (${editTarget.currency})` : `Emergency Fund Amount (${editTarget.currency})`}>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                value={editMode === "balance" ? balanceInput : emergencyInput}
                onChange={(e) => editMode === "balance" ? setBalanceInput(e.target.value) : setEmergencyInput(e.target.value)}
                placeholder="0.00"
              />
            </Field>
            <PrimaryButton
              type="button"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  {
                    accountId: editTarget.id,
                    data: editMode === "balance"
                      ? { currentBalance: Number(balanceInput) }
                      : { emergencyFund: Number(emergencyInput) },
                  },
                  {
                    onSuccess: () => {
                      toast.success(editMode === "balance" ? "Balance updated" : "Emergency fund updated");
                      setEditTarget(null);
                    },
                  }
                )
              }
            >
              {update.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {editMode === "balance" ? "Save Balance" : "Save Emergency Fund"}
            </PrimaryButton>
          </div>
        </Modal>
      ) : null}

      {/* Emergency Fund Spend Prompt */}
      {spendPrompt ? (
        <Modal
          title="Insufficient Balance"
          description={`Your current balance is short by ${money(spendPrompt.shortfall, spendPrompt.account.currency)}. Would you like to use part of your emergency fund instead?`}
          onClose={() => setSpendPrompt(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-300">Emergency Fund Available</p>
                <p className="mt-0.5 text-xs text-amber-400/70">
                  {money(Number(spendPrompt.account.emergencyFund ?? 0), spendPrompt.account.currency)} available in reserve
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <GhostButton onClick={() => setSpendPrompt(null)} className="flex-1">
                Cancel
              </GhostButton>
              <PrimaryButton
                className="flex-1"
                onClick={() => {
                  spendPrompt.onProceed();
                  setSpendPrompt(null);
                }}
              >
                Use Emergency Fund
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export function AccountDetailPage({ accountId }: { accountId: string }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions(accountId);
  const account = accounts.data?.find((item) => item.id === accountId);

  const stats = useMemo(() => {
    const list = transactions.data ?? [];
    const totalVolume = list.reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const totalFees = list.reduce((s, t) => s + Number(t.fees ?? 0), 0);
    const deposits = list.filter((t) => t.type === "DEPOSIT");
    const withdrawals = list.filter((t) => t.type === "WITHDRAWAL");
    const buys = list.filter((t) => t.type === "BUY");
    const sells = list.filter((t) => t.type === "SELL");
    return {
      txCount: list.length,
      totalVolume,
      totalFees,
      depositsTotal: deposits.reduce((s, t) => s + Number(t.amount ?? 0), 0),
      withdrawalsTotal: withdrawals.reduce((s, t) => s + Number(t.amount ?? 0), 0),
      buys: buys.length,
      sells: sells.length,
    };
  }, [transactions.data]);

  function accountTypeIcon(type: string) {
    if (type === "BANK") return <CircleDollarSign size={16} />;
    if (type === "CRYPTO") return <Database size={16} />;
    return <BriefcaseBusiness size={16} />;
  }

  function accountTypeColor(type: string) {
    if (type === "BANK") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (type === "CRYPTO") return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    return "text-[#b5b5f6] bg-[#b5b5f6]/10 border-[#b5b5f6]/20";
  }

  return (
    <div className="space-y-8">
      <Link href="/accounts" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white"><ArrowLeft size={13} /> Accounts</Link>

      {/* Hero Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {account && (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accountTypeColor(account.accountType)}`}>
              {accountTypeIcon(account.accountType)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{account?.name ?? "Account Details"}</h1>
            {account && (
              <p className="mt-1 text-sm text-neutral-400">
                {account.brokerName ?? "No broker"} · <span className={`font-medium ${accountTypeColor(account.accountType).split(" ")[0]}`}>{title(account.accountType)}</span> · {account.currency}
              </p>
            )}
          </div>
        </div>

        {/* Balance hero badge */}
        {account && (
          <div className="rounded-2xl border border-white/8 bg-white/3 px-6 py-4 text-right">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Current Balance</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white font-mono">
              {money(Number(account.currentBalance ?? 0), account.currency)}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600">{account.currency} · as of {date(account.updatedAt)}</p>
          </div>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Transactions" value={stats.txCount} icon={<ArrowLeftRight size={14} />} />
        <StatCard label="Total Deposits" value={money(stats.depositsTotal, account?.currency)} color="text-emerald-400" />
        <StatCard label="Total Withdrawals" value={money(stats.withdrawalsTotal, account?.currency)} color="text-red-400" />
        <StatCard label="Fees Paid" value={money(stats.totalFees, account?.currency)} color="text-neutral-400" />
      </div>

      {/* Transaction history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Transaction History</h2>
        {transactions.isLoading ? <SkeletonGrid count={2} /> : transactions.data?.length ? <TransactionsTable transactions={transactions.data} /> : <EmptyState icon={<ArrowLeftRight size={18} />} title="No transaction history" description="Activity for this account will appear here." />}
      </div>
    </div>
  );
}


export function MarketAssetsPage() {
  const [query, setQuery] = useState("A");
  const [open, setOpen] = useState(false);
  const [trackTarget, setTrackTarget] = useState<{ symbol: string; name: string } | null>(null);
  const [editHolding, setEditHolding] = useState<UserMarketAsset | null>(null);

  const { marketAssets, create } = useMarketAssets(query);
  const { userMarketAssets, addAsset, removeAsset } = useUserMarketAssets();
  const { portfolios } = usePortfolios();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Market Assets"
        description="Search listed securities and track holdings in your wealth portfolio."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus size={14} /> Create Market Asset
          </PrimaryButton>
        }
      />

      {/* SECTION 1: USER TRACKED ASSETS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Your Tracked Assets</h2>
          <p className="text-xs text-neutral-400 mt-1">Manage quantity, costs, and portfolios for your registered market assets.</p>
        </div>

        {userMarketAssets.isLoading ? (
          <SkeletonGrid count={3} />
        ) : userMarketAssets.data?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {userMarketAssets.data.map((userAsset) => {
              const asset = userAsset.marketAsset;
              const quantity = Number(userAsset.quantity);
              const averageCost = Number(userAsset.averageCost);
              const totalCost = quantity * averageCost;

              return (
                <Panel key={userAsset.id} className="bg-neutral-900/60 border-white/10 hover:border-[#b5b5f6]/40 transition duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{asset.symbol}</h3>
                      <p className="text-xs text-neutral-400 font-medium truncate max-w-45" title={asset.name}>{asset.name}</p>
                    </div>
                    <span className="rounded-full border border-[#b5b5f6]/20 bg-[#b5b5f6]/5 px-2 py-0.5 text-[10px] font-semibold text-[#b5b5f6] tracking-wide uppercase">
                      {title(asset.assetType)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-white/5 pt-4">
                    <div>
                      <span className="text-neutral-500 block">Shares</span>
                      <span className="text-white font-mono font-medium">{quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Avg Cost</span>
                      <span className="text-white font-mono font-medium">{money(averageCost, asset.currency)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Total Invested</span>
                      <span className="text-[#b5b5f6] font-mono font-semibold">{money(totalCost, asset.currency)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Exchange</span>
                      <span className="text-neutral-300 truncate block max-w-30" title={asset.exchange ?? "N/A"}>{asset.exchange ?? "N/A"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-white/5 pt-4">
                    <GhostButton onClick={() => setEditHolding(userAsset)} className="flex-1 justify-center py-1">
                      <Pencil size={13} /> Edit
                    </GhostButton>
                    <GhostButton
                      tone="danger"
                      disabled={removeAsset.isPending}
                      onClick={() => {
                        removeAsset.mutate(userAsset.id, {
                          onSuccess: () => {
                            toast.success(`Stopped tracking ${asset.symbol}`);
                          },
                        });
                      }}
                      className="flex-1 justify-center py-1"
                    >
                      {removeAsset.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Untrack
                    </GhostButton>
                  </div>
                </Panel>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<LineChart size={18} />}
            title="No tracked assets"
            description="Search for a symbol below or use the Search Symbols button to add stock holdings to your portfolio."
          />
        )}
      </section>

      <div className="border-t border-white/5 pt-8" />

      {/* SECTION 2: SEARCH & ADD ASSETS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Search Securities</h2>
            <p className="text-xs text-neutral-400 mt-1">Search symbols from Finnhub or database to start tracking them.</p>
          </div>
          <div className="opacity-90 hover:opacity-100 transition-opacity">
            <SearchCommand renderAs="button" label="Search Symbols Menu" initialStocks={[]} onAddStock={(stock) => setTrackTarget(stock)} />
          </div>
        </div>

        <Panel>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              className={cn(inputClass, "pl-9")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by symbol or name..."
            />
          </div>
        </Panel>

        {marketAssets.isLoading ? (
          <SkeletonGrid />
        ) : marketAssets.data?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {marketAssets.data.map((asset) => {
              const isAlreadyTracked = userMarketAssets.data?.some(
                (ua) => ua.marketAsset.symbol === asset.symbol
              );

              return (
                <Panel key={asset.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-semibold text-white">{asset.symbol}</h2>
                        <p className="text-xs text-neutral-500 font-medium truncate max-w-35" title={asset.name}>{asset.name}</p>
                      </div>
                      <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 text-[10px] uppercase">{title(asset.assetType)}</span>
                    </div>
                    <div className="mt-5 space-y-2 text-xs text-neutral-500">
                      <p>Exchange <span className="float-right text-neutral-300 truncate max-w-25" title={asset.exchange ?? "N/A"}>{asset.exchange ?? "N/A"}</span></p>
                      <p>Sector <span className="float-right text-neutral-300 truncate max-w-25" title={asset.sector ?? "N/A"}>{asset.sector ?? "N/A"}</span></p>
                      <p>Currency <span className="float-right font-mono text-neutral-300">{asset.currency}</span></p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-4">
                    {isAlreadyTracked ? (
                      <div className="w-full text-center py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-semibold text-emerald-400">
                        ✓ Tracked
                      </div>
                    ) : (
                      <PrimaryButton
                        onClick={() => setTrackTarget({ symbol: asset.symbol, name: asset.name })}
                        className="w-full justify-center text-xs py-1.5"
                      >
                        <Plus size={12} /> Track Asset
                      </PrimaryButton>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={18} />}
            title="No securities found"
            description="Try searching a different symbol or keyword."
          />
        )}
      </section>

      {/* MODALS */}
      {open ? (
        <Modal title="Create Market Asset" onClose={() => setOpen(false)}>
          <MarketAssetForm
            pending={create.isPending}
            onSubmit={(data) =>
              create.mutate(data, {
                onSuccess: () => {
                  toast.success("Market asset created");
                  setOpen(false);
                },
              })
            }
          />
        </Modal>
      ) : null}

      {trackTarget ? (
        <Modal title={`Track Asset: ${trackTarget.symbol}`} onClose={() => setTrackTarget(null)}>
          <TrackAssetForm
            symbol={trackTarget.symbol}
            name={trackTarget.name}
            portfolios={portfolios.data ?? []}
            pending={addAsset.isPending}
            onSubmit={(data) => {
              addAsset.mutate(
                {
                  symbol: data.symbol,
                  quantity: data.quantity,
                  averageCost: data.averageCost,
                  portfolioId: data.portfolioId || undefined,
                },
                {
                  onSuccess: () => {
                    toast.success(`Started tracking ${trackTarget.symbol}`);
                    setTrackTarget(null);
                  },
                }
              );
            }}
          />
        </Modal>
      ) : null}

      {editHolding ? (
        <Modal title={`Edit Tracked Asset: ${editHolding.marketAsset.symbol}`} onClose={() => setEditHolding(null)}>
          <TrackAssetForm
            symbol={editHolding.marketAsset.symbol}
            name={editHolding.marketAsset.name}
            initialValues={{
              quantity: Number(editHolding.quantity),
              averageCost: Number(editHolding.averageCost),
              portfolioId: editHolding.portfolios?.[0]?.portfolioId || undefined,
            }}
            portfolios={portfolios.data ?? []}
            pending={addAsset.isPending}
            onSubmit={(data) => {
              addAsset.mutate(
                {
                  symbol: data.symbol,
                  quantity: data.quantity,
                  averageCost: data.averageCost,
                  portfolioId: data.portfolioId || undefined,
                },
                {
                  onSuccess: () => {
                    toast.success(`Updated holding details for ${editHolding.marketAsset.symbol}`);
                    setEditHolding(null);
                  },
                }
              );
            }}
          />
        </Modal>
      ) : null}
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
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  const summary = useMemo(() => {
    const list = portfolios.data ?? [];
    const totalCustom = list.reduce((s, p) => s + (p._count?.customAssets ?? 0), 0);
    const totalMarket = list.reduce((s, p) => s + (p._count?.marketAssets ?? 0), 0);
    return { count: list.length, totalCustom, totalMarket };
  }, [portfolios.data]);

  function visibilityStyle(v: string) {
    return v === "PUBLIC"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : "text-neutral-400 bg-white/4 border-white/10";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolios"
        description="Create and manage discrete allocation structures for your assets and accounts."
        action={<PrimaryButton onClick={() => setCreateOpen(true)}><Plus size={14} /> New Portfolio</PrimaryButton>}
      />

      {/* Summary stats */}
      {!portfolios.isLoading && !portfolios.isError && summary.count > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Portfolios" value={summary.count} icon={<FolderKanban size={14} />} color="text-[#b5b5f6]" />
          <StatCard label="Market Holdings" value={summary.totalMarket} icon={<LineChart size={14} />} />
          <StatCard label="Custom Assets" value={summary.totalCustom} icon={<Database size={14} />} />
        </div>
      )}

      {portfolios.isLoading ? <SkeletonGrid /> : portfolios.isError ? <ErrorState /> : portfolios.data?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.data.map((portfolio) => {
            const totalAssets = (portfolio._count?.customAssets ?? 0) + (portfolio._count?.marketAssets ?? 0);
            return (
              <Panel key={portfolio.id} className="flex flex-col justify-between gap-5 hover:border-white/10 transition duration-300">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#b5b5f6]/20 bg-[#b5b5f6]/8 text-[#b5b5f6]">
                      <FolderKanban size={14} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white leading-tight">{portfolio.name}</h2>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{portfolio.description || "No description"}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${visibilityStyle(portfolio.visibility)}`}>
                    {title(portfolio.visibility)}
                  </span>
                </div>

                {/* Asset counts inset */}
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-white/2 px-4 py-3 text-xs">
                  <div>
                    <p className="text-neutral-500">Total</p>
                    <p className="mt-1 font-semibold text-white">{totalAssets}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Market</p>
                    <p className="mt-1 font-semibold text-[#b5b5f6]">{portfolio._count?.marketAssets ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Custom</p>
                    <p className="mt-1 font-semibold text-[#f7bff4]">{portfolio._count?.customAssets ?? 0}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-xs text-neutral-500">
                  <span>Created <b className="block pt-1 font-normal text-neutral-300">{date(portfolio.createdAt)}</b></span>
                  <span>Updated <b className="block pt-1 font-normal text-neutral-300">{date(portfolio.updatedAt)}</b></span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <GhostButton onClick={() => router.push(`/portfolios/${portfolio.id}`)}>
                    View Details <ArrowRight size={13} />
                  </GhostButton>
                  <div className="flex gap-2">
                    <GhostButton onClick={() => setEdit(portfolio)}><Pencil size={13} /> Edit</GhostButton>
                    <GhostButton tone="danger" onClick={() => setDeleteTarget(portfolio)}><Trash2 size={13} /> Delete</GhostButton>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : <EmptyState icon={<FolderKanban size={18} />} title="No portfolios" description="Create your first portfolio to organize accounts and assets." />}

      {/* Create Modal */}
      {createOpen ? (
        <Modal title="Create Portfolio" onClose={() => setCreateOpen(false)}>
          <PortfolioForm
            pending={create.isPending}
            onSubmit={(data) => create.mutate({ name: data.name, description: data.description }, {
              onSuccess: () => { toast.success("Portfolio created"); setCreateOpen(false); }
            })}
          />
        </Modal>
      ) : null}

      {/* Edit Modal */}
      {edit ? (
        <Modal title="Edit Portfolio" onClose={() => setEdit(null)}>
          <PortfolioForm
            initial={edit}
            pending={update.isPending}
            onSubmit={(data) => update.mutate({
              portfolioId: edit.id,
              data: { name: data.name, description: data.description || null, visibility: data.visibility }
            }, { onSuccess: () => { toast.success("Portfolio updated"); setEdit(null); } })}
          />
        </Modal>
      ) : null}

      {/* Delete Confirm Modal */}
      {deleteTarget ? (
        <Modal
          title="Delete Portfolio"
          description={`Delete "${deleteTarget.name}"? All asset associations will be removed. This cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
        >
          <GhostButton
            tone="danger"
            disabled={remove.isPending}
            onClick={() => remove.mutate(deleteTarget.id, {
              onSuccess: () => { toast.success("Portfolio deleted"); setDeleteTarget(null); }
            })}
          >
            {remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Portfolio
          </GhostButton>
        </Modal>
      ) : null}
    </div>
  );
}

export function PortfolioDetailPage({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const portfolio = usePortfolio(portfolioId);
  const { portfolios, update } = usePortfolios();
  const allocation = useAllocation();
  const [editOpen, setEditOpen] = useState(false);

  const data = portfolio.data;
  const marketAssetEntries = data?.marketAssets ?? [];
  const customAssetList = data?.customAssets ?? [];

  const marketAssetsValue = marketAssetEntries.reduce(
    (sum, entry) => sum + Number(entry.userMarketAsset.quantity) * Number(entry.userMarketAsset.averageCost), 0
  );
  const customAssetsValue = customAssetList.reduce((sum, a) => sum + Number(a.currentValue), 0);
  const totalValue = data?.totalValue ?? (marketAssetsValue + customAssetsValue);

  const assetTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const values: Record<string, number> = {};
    for (const entry of marketAssetEntries) {
      const type = entry.userMarketAsset.marketAsset.assetType;
      counts[type] = (counts[type] ?? 0) + 1;
      values[type] = (values[type] ?? 0) + Number(entry.userMarketAsset.quantity) * Number(entry.userMarketAsset.averageCost);
    }
    return { counts, values };
  }, [marketAssetEntries]);

  function visibilityStyle(v: string) {
    return v === "PUBLIC"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : "text-neutral-400 bg-white/4 border-white/10";
  }

  if (portfolio.isLoading) return <SkeletonGrid count={4} />;
  if (portfolio.isError || !data) return <ErrorState label="Portfolio not found." />;

  const portfolioListEntry = portfolios.data?.find((p) => p.id === portfolioId);

  return (
    <div className="space-y-8">
      <button onClick={() => router.push("/portfolios")} className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white">
        <ArrowLeft size={13} /> Portfolios
      </button>

      {/* Hero Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b5b5f6]/20 bg-[#b5b5f6]/8 text-[#b5b5f6]">
            <FolderKanban size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-semibold tracking-tight text-white">{data.name}</h1>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${visibilityStyle(data.visibility)}`}>
                {title(data.visibility)}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-400 max-w-xl">{data.description || "No description provided."}</p>
            <p className="mt-1 text-xs text-neutral-600">Created {date(data.createdAt)} · Updated {date(data.updatedAt)}</p>
          </div>
        </div>

        {/* Value hero badge + edit */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="rounded-2xl border border-white/8 bg-white/3 px-6 py-4 text-right">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Portfolio Value</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-[#b5b5f6] font-mono">{money(totalValue)}</p>
            <p className="mt-0.5 text-xs text-neutral-600">
              {marketAssetEntries.length} market · {customAssetList.length} custom assets
            </p>
          </div>
          <GhostButton onClick={() => setEditOpen(true)}><Pencil size={13} /> Edit Portfolio</GhostButton>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Market Assets" value={marketAssetEntries.length} icon={<LineChart size={14} />} color="text-[#b5b5f6]" />
        <StatCard label="Custom Assets" value={customAssetList.length} icon={<Database size={14} />} color="text-[#f7bff4]" />
        <StatCard label="Market Value" value={money(marketAssetsValue)} color="text-[#b5b5f6]" />
        <StatCard label="Custom Value" value={money(customAssetsValue)} color="text-[#f7bff4]" />
      </div>

      {/* Asset type breakdown — only if market assets exist */}
      {marketAssetEntries.length > 0 && Object.keys(assetTypeBreakdown.counts).length > 0 && (
        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Holdings by Asset Type</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {Object.entries(assetTypeBreakdown.counts).map(([type, count]) => (
              <div key={type} className="rounded-xl border border-white/5 bg-white/2 px-3 py-3 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{title(type)}</p>
                <p className="mt-1 text-lg font-bold text-white">{count}</p>
                <p className="text-[11px] text-[#b5b5f6] font-mono">{money(assetTypeBreakdown.values[type] ?? 0)}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Two-column: Custom Assets + Allocation */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Custom Assets</h2>
          {customAssetList.length ? (
            <div className="space-y-3">
              {customAssetList.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 p-4 transition hover:border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white">{asset.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 text-[10px] uppercase text-neutral-400">{title(asset.category)}</span>
                      {asset.description && <p className="text-xs text-neutral-500 truncate max-w-36" title={asset.description}>{asset.description}</p>}
                    </div>
                    {asset.purchasePrice && (
                      <p className="mt-1 text-xs text-neutral-600">Cost basis: {money(asset.purchasePrice, asset.currency)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#f7bff4]">{money(asset.currentValue, asset.currency)}</p>
                    {asset.purchasePrice && (
                      <p className={`text-[11px] ${Number(asset.currentValue) >= Number(asset.purchasePrice) ? "text-emerald-400" : "text-red-400"}`}>
                        {Number(asset.currentValue) >= Number(asset.purchasePrice) ? "+" : ""}
                        {money(Number(asset.currentValue) - Number(asset.purchasePrice), asset.currency)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Database size={18} />} title="No custom assets" description="Assign custom assets to this portfolio from the Custom Assets page." />
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 text-sm font-semibold text-white">Allocation Chart</h2>
          <div className="h-72">
            {allocation.data?.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={allocation.data} dataKey="currentValue" nameKey="symbol" innerRadius={58} outerRadius={95}>
                    {allocation.data.map((_, index) => <Cell key={index} fill={accent[index % accent.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={<BarChart3 size={18} />} title="Allocation unavailable" description="Allocation appears when analytics data is available." />
            )}
          </div>
        </Panel>
      </div>

      {/* Market Assets full list */}
      <Panel>
        <h2 className="mb-4 text-sm font-semibold text-white">Market Assets</h2>
        {marketAssetEntries.length ? (
          <div className="space-y-3">
            {marketAssetEntries.map((entry) => {
              const ua = entry.userMarketAsset;
              const asset = ua.marketAsset;
              const qty = Number(ua.quantity);
              const avgCost = Number(ua.averageCost);
              const totalInvested = qty * avgCost;
              return (
                <div key={entry.userMarketAssetId} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 p-4 transition hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#b5b5f6]/20 bg-[#b5b5f6]/8 text-[10px] font-bold text-[#b5b5f6]">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                        <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 text-[10px] uppercase text-neutral-400">{title(asset.assetType)}</span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate max-w-48" title={asset.name}>{asset.name}</p>
                      {(asset.exchange || asset.sector) && (
                        <p className="text-[11px] text-neutral-600">
                          {asset.exchange ?? ""}{asset.exchange && asset.sector ? " · " : ""}{asset.sector ?? ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#b5b5f6]">{money(totalInvested, asset.currency)}</p>
                    <p className="text-[11px] text-neutral-500">
                      {qty.toLocaleString(undefined, { maximumFractionDigits: 4 })} × {money(avgCost, asset.currency)}
                    </p>
                    <p className="text-[11px] text-neutral-600">{asset.currency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<LineChart size={18} />} title="No market assets" description="Assign market assets to this portfolio from the Market Assets page." />
        )}
      </Panel>

      {/* Edit Modal */}
      {editOpen && portfolioListEntry ? (
        <Modal title="Edit Portfolio" onClose={() => setEditOpen(false)}>
          <PortfolioForm
            initial={portfolioListEntry}
            pending={update.isPending}
            onSubmit={(formData) => update.mutate({
              portfolioId: portfolioId,
              data: { name: formData.name, description: formData.description || null, visibility: formData.visibility }
            }, { onSuccess: () => { toast.success("Portfolio updated"); setEditOpen(false); } })}
          />
        </Modal>
      ) : null}
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
  const { user, update } = useUser();
  const profile = user.data;
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    { id: "Profile", icon: <User size={16} /> },
    { id: "Danger Zone", icon: <AlertCircle size={16} /> },
  ];

  type ProfileFormValues = z.infer<typeof profileSchema>;
  const profileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    baseCurrency: z.string().min(3).max(5).optional(),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      username: profile?.username || "",
      baseCurrency: profile?.baseCurrency || "USD",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        baseCurrency: profile.baseCurrency || "USD",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    update.mutate(data, {
      onSuccess: () => toast.success("Profile updated successfully"),
      onError: (err: any) => toast.error(err.response?.data?.message || err.message || "Failed to update profile"),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your profile, preferences, and security settings." />
      
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Tabs */}
        <aside className="flex w-full shrink-0 flex-col gap-1 md:w-56">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                activeTab === tab.id ? "bg-[#b5b5f6]/20 text-[#b5b5f6]" : "bg-white/5"
              )}>
                {tab.icon}
              </div>
              {tab.id}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "Profile" && (
            <Panel className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {profile?.imageUrl ? (
                    <Image src={profile.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <User size={32} className="text-neutral-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {profile?.firstName || profile?.username || "Investor"} {profile?.lastName ?? ""}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">{profile?.email ?? "No email associated"}</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="First Name" error={form.formState.errors.firstName?.message}>
                    <input className={inputClass} placeholder="John" {...form.register("firstName")} />
                  </Field>
                  <Field label="Last Name" error={form.formState.errors.lastName?.message}>
                    <input className={inputClass} placeholder="Doe" {...form.register("lastName")} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Username" error={form.formState.errors.username?.message}>
                    <input className={inputClass} placeholder="johndoe" {...form.register("username")} />
                  </Field>
                  <Field label="Base Currency" error={form.formState.errors.baseCurrency?.message}>
                    <select className={selectClass} {...form.register("baseCurrency")}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </Field>
                </div>

                <div className="flex items-center justify-end border-t border-white/5 pt-6">
                  <button
                    type="submit"
                    disabled={update.isPending}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#b5b5f6] px-6 text-sm font-semibold text-black transition hover:bg-[#c6c6f7] disabled:opacity-50"
                  >
                    {update.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </Panel>
          )}

          {activeTab === "Danger Zone" && (
            <Panel className="max-w-2xl border border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h2>
              <p className="mb-6 text-sm text-red-400/80">Irreversible actions regarding your account and data.</p>
              
              <div className="rounded-xl border border-red-500/10 bg-red-500/10 p-5">
                <h3 className="font-medium text-white">Delete Account</h3>
                <p className="mb-4 mt-1 text-sm text-neutral-400">Permanently delete your account, including all financial records and synced data. This action cannot be undone.</p>
                <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 text-sm font-medium text-red-400 transition hover:bg-red-500/30">
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Goals Page ────────────────────────────────────────────────────────────────

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  targetDate: z.string().optional(),
});

function GoalProgressRing({ percent, size = 64, stroke = 5 }: { percent: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const color = percent >= 100 ? "#a7f3d0" : percent >= 60 ? "#b5b5f6" : "#f7bff4";

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export function GoalsPage() {
  const { goals, create, update, remove, contribute } = useGoals();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [contributeTarget, setContributeTarget] = useState<Goal | null>(null);
  const [contributionInput, setContributionInput] = useState("");

  const createForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: { title: "", targetAmount: 0, targetDate: "" },
  });

  const editForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema) as any,
  });

  function handleOpenEdit(goal: Goal) {
    setEditTarget(goal);
    editForm.reset({
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      targetDate: goal.targetDate ? goal.targetDate.split("T")[0] : "",
    });
  }

  const stats = useMemo(() => {
    const list = goals.data ?? [];
    const active = list.filter((g) => g.status === "ACTIVE").length;
    const completed = list.filter((g) => g.status === "COMPLETED").length;
    const totalTarget = list.reduce((s, g) => s + Number(g.targetAmount), 0);
    const totalCurrent = list.reduce((s, g) => s + Number(g.currentAmount), 0);
    return { active, completed, totalTarget, totalCurrent };
  }, [goals.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Goals"
        description="Track your financial milestones and log contributions toward each target."
        action={
          <PrimaryButton onClick={() => { createForm.reset(); setCreateOpen(true); }}>
            <Plus size={14} /> New Goal
          </PrimaryButton>
        }
      />

      {/* Summary Stats */}
      {!goals.isLoading && !goals.isError && (goals.data?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Active Goals" value={stats.active} icon={<Target size={14} />} color="text-[#b5b5f6]" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={14} />} color="text-emerald-400" />
          <StatCard label="Total Target" value={money(stats.totalTarget)} icon={<CircleDollarSign size={14} />} />
          <StatCard label="Total Saved" value={money(stats.totalCurrent)} icon={<Wallet size={14} />} color="text-[#f7bff4]" />
        </div>
      )}

      {/* Goals Grid */}
      {goals.isError ? (
        <ErrorState />
      ) : goals.isLoading ? (
        <SkeletonGrid />
      ) : goals.data?.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {goals.data.map((goal) => {
            const target = Number(goal.targetAmount);
            const current = Number(goal.currentAmount);
            const pct = goal.progressPercent;
            const isCompleted = goal.status === "COMPLETED";
            const remaining = Math.max(target - current, 0);

            return (
              <Panel
                key={goal.id}
                className={cn(
                  "flex flex-col gap-4 hover:border-white/10 transition duration-300",
                  isCompleted && "border-emerald-500/20 bg-emerald-500/3"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-white truncate">{goal.title}</h2>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                          isCompleted
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-[#b5b5f6] bg-[#b5b5f6]/10 border-[#b5b5f6]/20"
                        )}
                      >
                        {isCompleted ? "Completed" : "Active"}
                      </span>
                    </div>
                    {goal.targetDate && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                        <Clock size={10} />
                        Target: {date(goal.targetDate)}
                      </p>
                    )}
                  </div>
                  {/* Progress Ring */}
                  <div className="relative shrink-0">
                    <GoalProgressRing percent={pct} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn("text-[11px] font-bold tabular-nums", isCompleted ? "text-emerald-400" : "text-white")}>
                        {pct >= 100 ? "✓" : `${Math.round(pct)}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1.5">
                    <span className="font-medium text-white font-mono">{money(current)}</span>
                    <span>of {money(target)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                          : pct >= 60
                          ? "bg-gradient-to-r from-[#b5b5f6] to-[#d8c4ff]"
                          : "bg-gradient-to-r from-[#f7bff4] to-[#b5b5f6]"
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  {!isCompleted && (
                    <p className="mt-1 text-[11px] text-neutral-600">
                      {money(remaining)} remaining
                    </p>
                  )}
                </div>

                {/* Recent Contributions */}
                {goal.contributions.length > 0 && (
                  <div className="space-y-1 rounded-xl border border-white/5 bg-white/2 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 mb-2">Recent</p>
                    {goal.contributions.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500">{date(c.contributedAt)}</span>
                        <span className="text-[11px] font-semibold text-emerald-400 font-mono">+{money(Number(c.amount))}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  {!isCompleted ? (
                    <PrimaryButton
                      onClick={() => { setContributeTarget(goal); setContributionInput(""); }}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      <Plus size={12} /> Contribute
                    </PrimaryButton>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 size={13} /> Goal reached!
                    </span>
                  )}
                  <div className="flex gap-2">
                    <GhostButton onClick={() => handleOpenEdit(goal)}>
                      <Pencil size={13} />
                    </GhostButton>
                    <GhostButton tone="danger" onClick={() => setDeleteTarget(goal)}>
                      <Trash2 size={13} />
                    </GhostButton>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target size={18} />}
          title="No goals yet"
          description="Create your first financial goal and track your progress toward it."
        />
      )}

      {/* Create Goal Modal */}
      {createOpen && (
        <Modal title="New Goal" description="Set a new financial milestone to work toward." onClose={() => setCreateOpen(false)}>
          <form
            onSubmit={createForm.handleSubmit((data) =>
              create.mutate(
                { title: data.title, targetAmount: data.targetAmount, ...(data.targetDate ? { targetDate: data.targetDate } : {}) },
                {
                  onSuccess: () => {
                    toast.success("Goal created!");
                    setCreateOpen(false);
                    createForm.reset();
                  },
                  onError: () => toast.error("Failed to create goal"),
                }
              )
            )}
            className="space-y-4"
          >
            <Field label="Goal Title" error={createForm.formState.errors.title?.message}>
              <input className={inputClass} placeholder="e.g. Emergency Fund, New Laptop, Vacation…" {...createForm.register("title")} />
            </Field>
            <Field label="Target Amount (USD)" error={createForm.formState.errors.targetAmount?.message}>
              <input type="number" step="0.01" min="1" className={inputClass} placeholder="10000" {...createForm.register("targetAmount")} />
            </Field>
            <Field label="Target Date (optional)" error={createForm.formState.errors.targetDate?.message}>
              <input type="date" className={inputClass} {...createForm.register("targetDate")} />
            </Field>
            <PrimaryButton type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Goal
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {/* Edit Goal Modal */}
      {editTarget && (
        <Modal
          title={`Edit Goal — ${editTarget.title}`}
          description="Update your goal details."
          onClose={() => setEditTarget(null)}
        >
          <form
            onSubmit={editForm.handleSubmit((data) =>
              update.mutate(
                {
                  id: editTarget.id,
                  data: { title: data.title, targetAmount: data.targetAmount, ...(data.targetDate ? { targetDate: data.targetDate } : {}) },
                },
                {
                  onSuccess: () => {
                    toast.success("Goal updated!");
                    setEditTarget(null);
                  },
                  onError: () => toast.error("Failed to update goal"),
                }
              )
            )}
            className="space-y-4"
          >
            <Field label="Goal Title" error={editForm.formState.errors.title?.message}>
              <input className={inputClass} placeholder="Goal title" {...editForm.register("title")} />
            </Field>
            <Field label="Target Amount (USD)" error={editForm.formState.errors.targetAmount?.message}>
              <input type="number" step="0.01" min="1" className={inputClass} {...editForm.register("targetAmount")} />
            </Field>
            <Field label="Target Date (optional)" error={editForm.formState.errors.targetDate?.message}>
              <input type="date" className={inputClass} {...editForm.register("targetDate")} />
            </Field>
            <PrimaryButton type="submit" disabled={update.isPending}>
              {update.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Changes
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {/* Contribute Modal */}
      {contributeTarget && (
        <Modal
          title={`Add Contribution — ${contributeTarget.title}`}
          description={`Current progress: ${money(Number(contributeTarget.currentAmount))} / ${money(Number(contributeTarget.targetAmount))} (${contributeTarget.progressPercent}%)`}
          onClose={() => setContributeTarget(null)}
        >
          <div className="space-y-4">
            {/* Visual progress preview */}
            <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/3 p-4">
              <GoalProgressRing percent={contributeTarget.progressPercent} size={56} stroke={4} />
              <div>
                <p className="text-sm font-semibold text-white">{contributeTarget.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {money(Math.max(Number(contributeTarget.targetAmount) - Number(contributeTarget.currentAmount), 0))} remaining
                </p>
              </div>
            </div>
            <Field label="Contribution Amount (USD)">
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={inputClass}
                placeholder="e.g. 500"
                value={contributionInput}
                onChange={(e) => setContributionInput(e.target.value)}
              />
            </Field>
            <PrimaryButton
              type="button"
              disabled={contribute.isPending || !contributionInput || Number(contributionInput) <= 0}
              onClick={() =>
                contribute.mutate(
                  { goalId: contributeTarget.id, amount: Number(contributionInput) },
                  {
                    onSuccess: () => {
                      toast.success("Contribution added!");
                      setContributeTarget(null);
                    },
                    onError: () => toast.error("Failed to add contribution"),
                  }
                )
              }
            >
              {contribute.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Contribution
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Delete Goal Modal */}
      {deleteTarget && (
        <Modal
          title="Delete Goal"
          description={`Delete "${deleteTarget.title}"? All contributions will also be removed. This cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
        >
          <GhostButton
            tone="danger"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(deleteTarget.id, {
                onSuccess: () => {
                  toast.success("Goal deleted");
                  setDeleteTarget(null);
                },
                onError: () => toast.error("Failed to delete goal"),
              })
            }
          >
            {remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Goal
          </GhostButton>
        </Modal>
      )}
    </div>
  );
}