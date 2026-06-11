"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { updateUser } from "@/services/user.service";
import { createAccount } from "@/services/account.service";
import { createIncome } from "@/services/income.service";
import { createPortfolio } from "@/services/portfolio.service";
import { toast } from "sonner";
import Image from "next/image";
import {
  User,
  Building2,
  TrendingUp,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Check,
  Wallet,
  Bitcoin,
  Briefcase,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AccountType = "BANK" | "BROKERAGE" | "CRYPTO";
type IncomeSource =
  | "SALARY"
  | "BONUS"
  | "FREELANCE"
  | "DIVIDEND"
  | "INTEREST"
  | "RENTAL"
  | "OTHER";

interface OnboardingData {
  firstName: string;
  lastName: string;
  username: string;
  baseCurrency: string;
  accountName: string;
  accountType: AccountType;
  accountCurrency: string;
  startingBalance: string;
  monthlyIncome: string;
  incomeSource: IncomeSource;
  createPortfolioFlag: boolean;
  portfolioName: string;
  portfolioDescription: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "SGD"];

const STEPS = [
  { id: 1, label: "Profile",   icon: User },
  { id: 2, label: "Account",   icon: Building2 },
  { id: 3, label: "Income",    icon: TrendingUp },
  { id: 4, label: "Portfolio", icon: BarChart2 },
];

const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: "SALARY",    label: "Salary" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "BONUS",     label: "Bonus" },
  { value: "DIVIDEND",  label: "Dividends" },
  { value: "RENTAL",    label: "Rental" },
  { value: "INTEREST",  label: "Interest" },
  { value: "OTHER",     label: "Other" },
];

const STEP_META = [
  { title: "Set up your profile",       subtitle: "Tell us a bit about yourself" },
  { title: "Add your first account",    subtitle: "Bank, brokerage, or crypto wallet" },
  { title: "Monthly income",            subtitle: "Powers savings rate and AI forecasts" },
  { title: "Investment portfolio",      subtitle: "Optional — track stocks, ETFs, and more" },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
      {children}
    </span>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${prefix ? "pl-9" : "px-3.5"} pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-150`}
      />
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white text-sm focus:outline-none focus:border-white/20 transition-all duration-150 appearance-none cursor-pointer"
      style={{ backgroundImage: "none" }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-black text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function PillToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            value === opt.value
              ? "bg-gradient-to-r from-[#b5b5f6]/20 to-[#f7bff4]/20 border-[#b5b5f6]/40 text-white"
              : "bg-white/[0.02] border-white/[0.07] text-neutral-500 hover:border-white/15 hover:text-neutral-300"
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepProfile({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <FieldLabel>First Name</FieldLabel>
          <TextInput value={data.firstName} onChange={(v) => onChange("firstName", v)} placeholder="Aryan" />
        </div>
        <div className="flex-1">
          <FieldLabel>Last Name</FieldLabel>
          <TextInput value={data.lastName} onChange={(v) => onChange("lastName", v)} placeholder="Sharma" />
        </div>
      </div>
      <div>
        <FieldLabel>Username</FieldLabel>
        <TextInput value={data.username} onChange={(v) => onChange("username", v)} placeholder="aryansharma" />
        <p className="mt-1 text-xs text-neutral-600">Your unique handle on PixelFi</p>
      </div>
      <div>
        <FieldLabel>Base Currency</FieldLabel>
        <SelectInput
          value={data.baseCurrency}
          onChange={(v) => onChange("baseCurrency", v)}
          options={CURRENCIES.map((c) => ({ value: c, label: c }))}
        />
        <p className="mt-1 text-xs text-neutral-600">All values display in this currency</p>
      </div>
    </div>
  );
}

function StepAccount({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Account Name</FieldLabel>
        <TextInput
          value={data.accountName}
          onChange={(v) => onChange("accountName", v)}
          placeholder="e.g. HDFC Savings, Zerodha"
        />
      </div>
      <div>
        <FieldLabel>Account Type</FieldLabel>
        <PillToggle
          value={data.accountType}
          onChange={(v) => onChange("accountType", v)}
          options={[
            { value: "BANK",      label: "Bank",      icon: <Wallet size={13} /> },
            { value: "BROKERAGE", label: "Brokerage", icon: <Briefcase size={13} /> },
            { value: "CRYPTO",    label: "Crypto",    icon: <Bitcoin size={13} /> },
          ]}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <FieldLabel>Currency</FieldLabel>
          <SelectInput
            value={data.accountCurrency}
            onChange={(v) => onChange("accountCurrency", v)}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="flex-1">
          <FieldLabel>Starting Balance</FieldLabel>
          <TextInput
            value={data.startingBalance}
            onChange={(v) => onChange("startingBalance", v)}
            placeholder="0"
            type="number"
          />
        </div>
      </div>
      <p className="text-xs text-neutral-600">You can add more accounts later from the Accounts section.</p>
    </div>
  );
}

function StepIncome({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Primary Income Source</FieldLabel>
        <PillToggle
          value={data.incomeSource}
          onChange={(v) => onChange("incomeSource", v)}
          options={INCOME_SOURCES}
        />
      </div>
      <div>
        <FieldLabel>Monthly Income ({data.baseCurrency})</FieldLabel>
        <TextInput
          value={data.monthlyIncome}
          onChange={(v) => onChange("monthlyIncome", v)}
          placeholder="50,000"
          type="number"
          prefix={<span className="text-xs">$</span>}
        />
        <p className="mt-1 text-xs text-neutral-600">
          Skip if you prefer — you can add income records anytime.
        </p>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <p className="text-xs text-neutral-500 leading-relaxed">
          💡 Income data enables PixelFi&apos;s AI to calculate your savings rate,
          detect lifestyle creep, and forecast net worth trajectories.
        </p>
      </div>
    </div>
  );
}

function StepPortfolio({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Toggle row */}
      <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <button
          type="button"
          onClick={() => onChange("createPortfolioFlag", !data.createPortfolioFlag)}
          className={`mt-0.5 w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 relative ${
            data.createPortfolioFlag
              ? "bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4]"
              : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
              data.createPortfolioFlag ? "left-5.5" : "left-0.5"
            }`}
          />
        </button>
        <div>
          <p className="text-sm font-medium text-white">Create an investment portfolio</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track stocks, ETFs, crypto and custom assets in one view
          </p>
        </div>
      </div>

      <AnimatePresence>
        {data.createPortfolioFlag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-3"
          >
            <div>
              <FieldLabel>Portfolio Name</FieldLabel>
              <TextInput
                value={data.portfolioName}
                onChange={(v) => onChange("portfolioName", v)}
                placeholder="e.g. Long-term Growth"
              />
            </div>
            <div>
              <FieldLabel>Description (optional)</FieldLabel>
              <TextInput
                value={data.portfolioDescription}
                onChange={(v) => onChange("portfolioDescription", v)}
                placeholder="My primary investment portfolio"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What you can track */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 space-y-2">
        <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
          What you can track
        </p>
        {["Stocks & ETFs", "Crypto Assets", "Mutual Funds & Bonds", "Real Estate & Custom Assets"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] flex items-center justify-center flex-shrink-0">
              <Check size={8} className="text-black" strokeWidth={3} />
            </div>
            <span className="text-xs text-neutral-500">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { getApi } = useApi();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    username: "",
    baseCurrency: "USD",
    accountName: "",
    accountType: "BANK",
    accountCurrency: "USD",
    startingBalance: "",
    monthlyIncome: "",
    incomeSource: "SALARY",
    createPortfolioFlag: false,
    portfolioName: "My Portfolio",
    portfolioDescription: "",
  });

  const onChange = useCallback(
    (key: keyof OnboardingData, value: string | boolean) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const totalSteps = STEPS.length;

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const canProceed = () => {
    if (step === 1) return data.firstName.trim().length > 0 && data.baseCurrency;
    if (step === 2) return data.accountName.trim().length >= 2;
    return true;
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const api = await getApi();

      await updateUser(api, {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        username: data.username || undefined,
        baseCurrency: data.baseCurrency,
      });

      let createdAccountId: string | undefined;
      if (data.accountName.trim()) {
        const account = await createAccount(api, {
          name: data.accountName,
          brokerName: undefined,
          accountType: data.accountType,
          currency: data.accountCurrency,
          ...(data.startingBalance
            ? { currentBalance: parseFloat(data.startingBalance) }
            : {}),
        });
        createdAccountId = account.id;
      }

      if (data.monthlyIncome && parseFloat(data.monthlyIncome) > 0) {
        await createIncome(api, {
          source: data.incomeSource,
          amount: parseFloat(data.monthlyIncome),
          currency: data.accountCurrency || data.baseCurrency,
          receivedAt: new Date().toISOString(),
          ...(createdAccountId ? { accountId: createdAccountId } : {}),
        });
      }

      if (data.createPortfolioFlag && data.portfolioName.trim()) {
        await createPortfolio(api, {
          name: data.portfolioName,
          description: data.portfolioDescription || undefined,
        });
      }

      toast.success("Welcome to PixelFi! Your workspace is ready.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
  };

  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 antialiased relative overflow-hidden">

      {/* Background glow — matches landing page exactly */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-[250px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-linear-to-r from-[#b5b5f6]/10 to-[#f7bff4]/10 blur-[160px]" />
        <div className="absolute -right-[100px] top-[300px] h-[400px] w-[400px] rounded-full bg-[#f7bff4]/5 blur-[120px]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full max-w-[480px] relative">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex h-8 w-8 items-center justify-center">
            <Image src="/logo.webp" alt="PixelFi logo" width={80} height={80} className="h-6 w-6" />
          </div>
          <span className="text-xl font-medium tracking-tight">PixelFi</span>
        </div>

        {/* Step dots + progress bar */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isCompleted
                          ? "bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] border-transparent"
                          : isCurrent
                          ? "border-white/20 bg-white/[0.04]"
                          : "border-white/5 bg-transparent"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={13} className="text-black" strokeWidth={2.5} />
                      ) : (
                        <Icon
                          size={13}
                          className={isCurrent ? "text-white" : "text-neutral-700"}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        isCurrent ? "text-neutral-300" : isCompleted ? "text-neutral-600" : "text-neutral-700"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mt-[-18px] bg-white/5 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] transition-all duration-500"
                        style={{ width: step > s.id ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Thin progress bar */}
          <div className="h-px w-full bg-white/5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">

          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
              Step {step} of {totalSteps}
            </p>
            <h2 className="text-lg font-semibold text-white">{STEP_META[step - 1].title}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{STEP_META[step - 1].subtitle}</p>
          </div>

          {/* Card body */}
          <div className="px-6 py-5 min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                {step === 1 && <StepProfile data={data} onChange={onChange} />}
                {step === 2 && <StepAccount data={data} onChange={onChange} />}
                {step === 3 && <StepIncome data={data} onChange={onChange} />}
                {step === 4 && <StepPortfolio data={data} onChange={onChange} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div className="px-6 pb-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-300 disabled:opacity-0 disabled:pointer-events-none transition-all duration-150"
            >
              <ChevronLeft size={15} />
              Back
            </button>

            <button
              type="button"
              onClick={step === totalSteps ? handleFinish : next}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-[0_0_25px_rgba(247,191,244,0.15)] hover:shadow-[0_0_30px_rgba(247,191,244,0.25)]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Setting up…
                </>
              ) : step === totalSteps ? (
                "Launch PixelFi →"
              ) : (
                <>
                  Continue
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors duration-150"
          >
            Skip setup — I&apos;ll configure this later
          </button>
        </div>
      </div>
    </div>
  );
}
