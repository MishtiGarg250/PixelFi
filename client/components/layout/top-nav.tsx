"use client";

import { useMemo } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { NotificationBell } from "./notification-bell";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/assets/market": "Market Assets",
  "/assets/custom": "Custom Assets",
  "/portfolios": "Portfolios",
  "/transactions": "Transactions",
  "/liabilities": "Liabilities",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function TopNav({ onMobileMenu }: { onMobileMenu: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const title = useMemo(() => {
    const match = Object.entries(routeTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([route]) => pathname === route || pathname.startsWith(`${route}/`));
    return match?.[1] ?? "PixelFi";
  }, [pathname]);

  const currentUser = user.data;
  const displayName = currentUser?.username || currentUser?.email || "Investor";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-black/80 px-4 text-white backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenu}
          className="rounded-lg border border-white/5 bg-white/2 p-2 text-neutral-400 transition hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">{title}</p>
          <p className="hidden text-xs text-neutral-500 sm:block">Live wealth operating view</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden w-full max-w-sm md:block">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="search"
            placeholder="Search accounts, assets, transactions..."
            className="h-10 w-full rounded-full border border-white/5 bg-white/2 pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-white/10 focus:bg-white/[0.04]"
          />
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
