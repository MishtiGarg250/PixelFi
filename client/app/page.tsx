"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  BarChart3,
  ShieldAlert,
  BrainCircuit,
  LineChart,
  Activity,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white antialiased">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 -top-62.5 h-150 w-200 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b5b5f6]/10 to-[#f7bff4]/10 blur-[160px]" />
        <div className="absolute -right-25 top-75 h-100 w-100 rounded-full bg-[#f7bff4]/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:64px_64px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image src="/logo.webp" alt="PixelFi logo" width={80} height={80} className="h-6 w-6" />
            </div>
            <span className="text-xl font-medium tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              PixelFi
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "Intelligence", href: "#intelligence" },
            ].map((link) => (
              <a key={link.label} href={link.href} className="text-xs font-medium tracking-wide uppercase text-neutral-400 transition-colors duration-200 hover:text-white">
                {link.label}
              </a>
            ))}
            <Show when="signed-in">
              <Link href="/dashboard" className="text-xs font-medium tracking-wide uppercase text-[#b5b5f6] transition-colors duration-200 hover:text-white">
                Dashboard
              </Link>
            </Show>
          </div>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/sign-in">
                <button className="rounded-full px-4 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white">Login</button>
              </Link>
              <Link href="/sign-up">
                <button className="rounded-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] px-5 py-1.5 text-xs font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:opacity-95 shadow-[0_0_25px_rgba(247,191,244,0.25)]">
                  Sign Up
                </button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="mr-2 hidden md:block">
                <button className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10">
                  Go to Dashboard
                </button>
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex min-h-[calc(100vh-70px)] max-w-7xl flex-col items-center justify-center lg:justify-between gap-16 px-6 py-12 lg:flex-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-xl lg:max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <TrendingUp className="h-3.5 w-3.5 text-[#f7bff4]" />
            <span className="text-xs font-medium tracking-wide text-neutral-300 uppercase">AI Powered Wealth Intelligence</span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl leading-[1.05]">
            Build <span className="bg-gradient-to-r from-[#b5b5f6] via-[#d8c4ff] to-[#f7bff4] bg-clip-text text-transparent">Wealth</span><br />with clarity.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-400">
            PixelFi structures your investments, tracking, and future targets into one beautifully minimal, intelligent financial operating system.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-up">
                <button className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:opacity-95 shadow-[0_0_30px_rgba(247,191,244,0.25)]">
                  Get Started <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <button className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10">
                Live Demo
              </button>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <button className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:opacity-95 shadow-[0_0_30px_rgba(247,191,244,0.25)]">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            </Show>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/5 pt-8 max-w-md">
            {[{ val: "+24%", label: "Portfolio Growth" }, { val: "$128K", label: "Assets Managed" }, { val: "12K+", label: "Active Investors" }].map((stat, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-medium tracking-tight text-white">{stat.val}</h3>
                <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="relative w-full max-w-lg lg:max-w-xl hidden md:block">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-[#b5b5f6]/10 to-[#f7bff4]/10 opacity-30 blur-2xl" />
          <div className="rounded-[2rem] border border-white/5 bg-neutral-950/40 p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-neutral-500">Total Balance</p>
                <h2 className="mt-1 text-4xl font-semibold tracking-tight text-white">$84,240</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Wallet className="h-5 w-5 text-[#f7bff4]" />
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-5">
              <div className="flex h-44 items-end gap-3.5 px-2">
                {[35, 55, 45, 85, 65, 95].map((height, i) => (
                  <div key={i} style={{ height: `${height}%` }} className="w-full rounded-full bg-gradient-to-t from-[#b5b5f6]/40 via-[#d8c4ff]/60 to-[#f7bff4] opacity-85 transition-all duration-500 hover:opacity-100" />
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Investments</span><BarChart3 className="h-4 w-4 text-[#b5b5f6]" />
                </div>
                <h4 className="mt-3 text-2xl font-medium text-white">+18.4%</h4>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">This Month</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Savings</span><TrendingUp className="h-4 w-4 text-[#f7bff4]" />
                </div>
                <h4 className="mt-3 text-2xl font-medium text-white">$12.8K</h4>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">Annual Growth</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 border-t border-white/5 bg-black/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Everything you need to scale</h2>
            <p className="mt-4 text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">Manage all your assets, liabilities, and income in one place. Stop using spreadsheets and start using a platform built for the modern investor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: "Asset Aggregation", desc: "Unify your crypto, stocks, real estate, and cash across all institutions automatically." },
              { icon: BrainCircuit, title: "ML Forecasting", desc: "XGBoost-powered algorithms predict your net worth trajectory 12 months into the future." },
              { icon: ShieldAlert, title: "Anomaly Detection", desc: "Instantly flags unusual spending patterns that deviate from your historical baselines." },
              { icon: LineChart, title: "Real-time Metrics", desc: "Live integration with Finnhub keeps your portfolio valued to the second, not the day." }
            ].map((feature, i) => (
              <div key={i} className="group rounded-[2rem] border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b5b5f6]/20 to-[#f7bff4]/20 border border-white/10">
                  <feature.icon className="h-5 w-5 text-[#f7bff4]" />
                </div>
                <h3 className="mb-3 text-lg font-medium text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Showcase */}
      <section id="intelligence" className="relative py-24 overflow-hidden">
        <div className="absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#b5b5f6]/10 blur-[120px]" />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <div className="rounded-[2rem] border border-white/5 bg-neutral-900/50 p-6 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute -top-4 -right-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live Insight
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 border border-white/5 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-[#f7bff4]" />
                    <h4 className="text-sm font-medium text-white">Lifestyle Creep Warning</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">Discretionary category outbound allocation trends have systematically surged upwards by 14.5% relative to your baseline index over past evaluation intervals.</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/5 p-5 opacity-75">
                  <div className="flex items-center gap-3 mb-2">
                    <BrainCircuit className="h-5 w-5 text-[#b5b5f6]" />
                    <h4 className="text-sm font-medium text-white">Net Worth Projection Compiled</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">Multi-horizon forward predictive configurations successfully processed system-wide data blocks for horizon date: Oct 2026.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl leading-tight">Actionable insights,<br />not just raw data.</h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-400">
              Our background Kafka-driven ML workers analyze every transaction and asset swing in real-time. We don't just show you charts—we actively monitor your financial health for anomalies, liquidity risks, and lifestyle creep.
            </p>
            <ul className="mt-8 space-y-4">
              {["Always-on anomaly detection", "Predictive liquidity risk warnings", "Adaptive forecasting models"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-[#b5b5f6]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="PixelFi logo" width={32} height={32} className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium tracking-tight text-neutral-300">PixelFi</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
          
        </div>
        <div className="mt-8 text-center text-xs text-neutral-600">
          &copy; {new Date().getFullYear()} PixelFi. All rights reserved.
        </div>
      </footer>
    </main>
  );
}