"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";

const mobileLinks = [
  ["Dashboard", "/dashboard"],
  ["Accounts", "/accounts"],
  ["Market Assets", "/assets/market"],
  ["Custom Assets", "/assets/custom"],
  ["Portfolios", "/portfolios"],
  ["Transactions", "/transactions"],
  ["Liabilities", "/liabilities"],
  ["Analytics", "/analytics"],
  ["Settings", "/settings"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="min-w-0 flex-1">
          <TopNav onMobileMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="relative h-full w-80 max-w-[85vw] border-r border-white/10 bg-black p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold">PixelFi</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-white/5 bg-white/2 p-2 text-neutral-400"
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-1">
              {mobileLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
