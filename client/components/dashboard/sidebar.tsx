"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Optional: to detect the active route
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  LineChart, 
  Settings,
  Sparkles
} from "lucide-react";
import { label } from "framer-motion/client";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolios", href: "/dashboard/portfolios", icon: Briefcase },
  { label: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Holdings", href: "/dashboard/holdings", icon: PieChart },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  {label:"Market", href:"/dashboard/market", icon: LineChart},
  {label: "Settings", href:"/dashboard/settings", icon: Settings}
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-white/5 bg-black text-white p-6 flex flex-col justify-between antialiased">
      <div>
        <Link href="/">  
        <div className="flex items-center gap-2.5 group cursor-pointer mb-10 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b5b5f6] to-[#f7bff4] shadow-[0_0_15px_rgba(247,191,244,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-black" />
          </div>
          <span className="text-lg font-medium tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            PixelFi
          </span>
        </div>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href; // Elegant fallback state handling

            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 relative ${
                  isActive 
                    ? "text-white bg-white/[0.03] border border-white/5" 
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                {/* Micro Ambient Indicator Dot for Active/Hover State */}
                <span className="absolute left-0 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-[#b5b5f6] to-[#f7bff4] opacity-0 transition-opacity group-hover:opacity-100" />
                
                <Icon 
                  size={16} 
                  className={`transition-colors ${
                    isActive ? "text-[#f7bff4]" : "text-neutral-400 group-hover:text-[#b5b5f6]"
                  }`} 
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-white/5 pt-4 px-2 flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#b5b5f6]/40 to-[#f7bff4]/40 border border-white/10" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-neutral-300">Premium Account</span>
          <span className="text-[10px] text-neutral-500">Workspace Active</span>
        </div>
      </div>
    </aside>
  );
};