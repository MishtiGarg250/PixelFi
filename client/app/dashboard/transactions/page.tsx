"use client";

import { FolderKanban, ArrowRight, ArrowLeftRight } from "lucide-react";
import { usePortfolios } from "@/hooks/usePortfolio";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const { portfolios } = usePortfolios();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ledger Operations</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Select a portfolio to view its immutable register of capital flow events.
        </p>
      </div>

      {portfolios.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-white/5 bg-white/2 animate-pulse" />
          ))}
        </div>
      )}

      {!portfolios.isLoading && portfolios.data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/8 bg-neutral-950/20 text-center">
          <ArrowLeftRight size={28} className="text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500 mb-4">No portfolios found. Create a portfolio first to view transactions.</p>
          <button
            onClick={() => router.push("/dashboard/portfolios")}
            className="flex items-center gap-1.5 text-xs text-[#b5b5f6] hover:text-white transition"
          >
            Go to Portfolios <ArrowRight size={12} />
          </button>
        </div>
      )}

      {portfolios.data && portfolios.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolios.data.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/dashboard/portfolios/${p.id}?tab=transactions`)}
              className="group text-left rounded-2xl border border-white/5 bg-neutral-950/40 p-5 flex items-center justify-between hover:border-white/10 hover:bg-neutral-900/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#b5b5f6]/15 to-[#f7bff4]/10 border border-white/8 flex items-center justify-center text-[#b5b5f6]">
                  <FolderKanban size={15} />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm group-hover:text-[#f7bff4] transition-colors">{p.name}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {p.description || "View transactions →"}
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-neutral-600 group-hover:text-[#b5b5f6] transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}