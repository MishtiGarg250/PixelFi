"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Search, TrendingUp, X, Zap } from "lucide-react"
import Link from "next/link"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { useDebounce } from "@/hooks/useDebounce"

export default function SearchCommand({
  renderAs = "button",
  label = "Search Symbols",
  initialStocks,
  onAddStock,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSearchMode = !!searchTerm.trim()
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

  /* ── keyboard shortcut ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  /* ── auto-focus input when dialog opens ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
    else {
      setSearchTerm("")
      setStocks(initialStocks)
    }
  }, [open])

  /* ── search ── */
  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks)
    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim())
      setStocks(results)
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300)
  useEffect(() => { debouncedSearch() }, [searchTerm])

  const handleSelectStock = () => {
    setOpen(false)
    setSearchTerm("")
    setStocks(initialStocks)
  }

  /* ── colour helper for type badge ── */
  const typeBadgeStyle = (type: string) => {
    const t = type?.toLowerCase()
    if (t?.includes("crypto")) return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    if (t?.includes("etf")) return "bg-sky-500/10 text-sky-400 border-sky-500/20"
    if (t?.includes("bond")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    return "bg-[#b5b5f6]/10 text-[#b5b5f6] border-[#b5b5f6]/20"
  }

  return (
    <>
      {/* ── Trigger ── */}
      {renderAs === "text" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-[#b5b5f6] hover:text-white transition-colors"
        >
          <Search size={12} />
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-[#b5b5f6]/40 hover:bg-[#b5b5f6]/10 hover:text-white"
        >
          <Search size={13} className="text-[#b5b5f6]" />
          {label}
          <kbd className="ml-1 hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 sm:inline">
            ⌘K
          </kbd>
        </button>
      )}

      {/* ── Backdrop + Dialog ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60 ring-1 ring-white/5">

            {/* Search bar */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              {loading ? (
                <Loader2 size={16} className="shrink-0 animate-spin text-[#b5b5f6]" />
              ) : (
                <Search size={16} className="shrink-0 text-neutral-500" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by symbol or company name…"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="rounded-md p-1 text-neutral-600 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[420px] overflow-y-auto">

              {/* Section label */}
              {!loading && (displayStocks?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                  {isSearchMode ? (
                    <><Search size={11} className="text-neutral-600" /><span className="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Results</span></>
                  ) : (
                    <><Zap size={11} className="text-neutral-600" /><span className="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Popular</span></>
                  )}
                  <span className="ml-auto text-[11px] text-neutral-700">{displayStocks?.length}</span>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-24 animate-pulse rounded-full bg-white/5" />
                        <div className="h-2 w-36 animate-pulse rounded-full bg-white/5" />
                      </div>
                      <div className="h-6 w-14 animate-pulse rounded-full bg-white/5" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && (displayStocks?.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-neutral-600">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isSearchMode ? "No results found" : "No stocks available"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {isSearchMode ? `Nothing matched "${searchTerm}"` : "Check back later"}
                    </p>
                  </div>
                </div>
              )}

              {/* Stock rows */}
              {!loading && (displayStocks?.length ?? 0) > 0 && (
                <ul className="space-y-0.5 p-2 pb-2.5">
                  {displayStocks?.map((stock, i) => (
                    <li
                      key={`${stock.symbol}-${i}`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      {/* Symbol badge */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-[10px] font-bold text-[#b5b5f6]">
                        {stock.symbol.slice(0, 3)}
                      </div>

                      {/* Name + meta — clicking navigates to stock page */}
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        onClick={handleSelectStock}
                        className="min-w-0 flex-1"
                      >
                        <p className="truncate text-sm font-medium text-white group-hover:text-[#b5b5f6] transition-colors">
                          {stock.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <span className="font-mono font-semibold text-neutral-400">{stock.symbol}</span>
                          {stock.exchange && (
                            <>
                              <span className="text-neutral-700">·</span>
                              <span>{stock.exchange}</span>
                            </>
                          )}
                        </div>
                      </Link>

                      {/* Type tag + track button */}
                      <div className="flex shrink-0 items-center gap-2">
                        {stock.type && (
                          <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block ${typeBadgeStyle(stock.type)}`}>
                            {stock.type}
                          </span>
                        )}
                        {onAddStock && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              onAddStock({ symbol: stock.symbol, name: stock.name })
                              setOpen(false)
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#b5b5f6]/20 bg-[#b5b5f6]/8 px-2.5 py-1 text-[11px] font-semibold text-[#b5b5f6] transition-all hover:border-[#b5b5f6]/40 hover:bg-[#b5b5f6]/18 active:scale-95"
                          >
                            <Plus size={11} />
                            Track
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
              <p className="text-[11px] text-neutral-700">
                {isSearchMode ? "Real-time via Finnhub" : "Showing popular symbols"}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-700">
                <span><kbd className="rounded border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate</span>
                <span><kbd className="rounded border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}