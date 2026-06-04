"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Market Assets", href: "/assets/market", icon: LineChart, eyebrow: "Assets" },
  { label: "Custom Assets", href: "/assets/custom", icon: Database, eyebrow: "Assets" },
  { label: "Portfolios", href: "/portfolios", icon: BriefcaseBusiness },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Liabilities", href: "/liabilities", icon: CircleDollarSign },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
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

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-white/5 bg-black text-white transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#b5b5f6] to-[#f7bff4] shadow-[0_0_18px_rgba(247,191,244,0.18)]">
            <Sparkles className="h-3.5 w-3.5 text-black" />
          </span>
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

      <div className="border-t border-white/5 p-4">
        <div className={cn("flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-3", collapsed && "justify-center p-2")}>
          <div className="h-8 w-8 rounded-full border border-white/10 bg-linear-to-br from-[#b5b5f6]/30 to-[#f7bff4]/20" />
          {!collapsed ? (
            <div>
              <p className="text-xs font-medium text-neutral-300">Premium Account</p>
              <p className="text-[10px] text-neutral-600">Workspace Active</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
