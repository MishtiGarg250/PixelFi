"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMemo } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Market Assets", href: "/assets/market", icon: LineChart, eyebrow: "Assets" },
  { label: "Custom Assets", href: "/assets/custom", icon: Database, eyebrow: "Assets" },
  { label: "Portfolios", href: "/portfolios", icon: BriefcaseBusiness },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Liabilities", href: "/liabilities", icon: CircleDollarSign },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { isOnboardingIncomplete } = useOnboardingStatus();

  const displayName = useMemo(() => {
    if (!user) return "Investor";
    return user.firstName + " " + user.lastName || "Investor";
  }, [user]);

  const displayEmail = useMemo(() => {
    if (!user) return "";
    return user.emailAddresses?.[0]?.emailAddress || "";
  }, [user]);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-white/5 bg-black text-white transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src="/logo.webp"
                          alt="PixelFi logo"
                          width={80}
                          height={80}
                          className="h-6 w-6"
                        />
                      </div>
          {!collapsed ? (
            <span className="text-lg font-medium tracking-tight text-white">PixelFi</span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border border-white/5 bg-white/2 p-1.5 text-neutral-500 transition hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map((link, index) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          const showEyebrow = !collapsed && link.eyebrow && links[index - 1]?.eyebrow !== link.eyebrow;

          return (
            <div key={link.href}>
              {showEyebrow ? (
                <p className="px-3 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                  {link.eyebrow}
                </p>
              ) : null}
              <Link
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "border border-white/5 bg-white/[0.04] text-white"
                    : "text-neutral-500 hover:bg-white/[0.025] hover:text-white",
                  collapsed && "justify-center"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 h-4 w-[3px] rounded-r-full bg-linear-to-b from-[#b5b5f6] to-[#f7bff4] opacity-0 transition",
                    active && "opacity-100"
                  )}
                />
                <Icon
                  size={16}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-[#f7bff4]" : "text-neutral-500 group-hover:text-[#b5b5f6]"
                  )}
                />
                {!collapsed ? <span>{link.label}</span> : null}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Onboarding incomplete banner */}
      {isOnboardingIncomplete && (
        <div className="px-3 pb-3">
          <Link
            href="/onboarding"
            className={cn(
              "group relative flex overflow-hidden rounded-xl border border-[#b5b5f6]/20 bg-gradient-to-br from-[#b5b5f6]/10 via-[#f7bff4]/8 to-[#b5b5f6]/5 p-3 transition-all duration-200 hover:border-[#b5b5f6]/40 hover:from-[#b5b5f6]/15 hover:via-[#f7bff4]/12 hover:to-[#b5b5f6]/8",
              collapsed && "justify-center p-2.5"
            )}
          >
            {/* Subtle animated shimmer */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            {collapsed ? (
              <span title="Complete setup">
                <Sparkles size={15} className="text-[#b5b5f6]" />
              </span>
            ) : (
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b5b5f6]/30 to-[#f7bff4]/20">
                  <Sparkles size={12} className="text-[#b5b5f6]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">Complete your setup</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500">
                    Finish onboarding to unlock all features
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-[#b5b5f6] transition-all duration-150 group-hover:gap-1.5">
                    Go to setup
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="transition-transform duration-150 group-hover:translate-x-0.5">
                      <path d="M1.5 4h5M4 1.5L6.5 4 4 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>
      )}

      <div className="border-t border-white/5 p-4">
        <div className={cn("flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-3", collapsed && "justify-center p-2")}>
          <UserButton />
          {!collapsed ? (
            <div>
              <p className="text-xs font-medium text-neutral-300">{displayName}</p>
              <p className="text-[10px] text-neutral-600">{displayEmail}</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
