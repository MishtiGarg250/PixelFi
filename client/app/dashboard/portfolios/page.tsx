"use client";

import { FolderKanban, Plus } from "lucide-react";
import { usePortfolios } from "@/hooks/usePortfolio";

export default function PortfoliosPage() {
  const {portfolios,create} = usePortfolios();

  if(portfolios.isLoading){
    return (
      <div className= "text-neutral-400">
        Loading Portfolios...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Portfolios</h1>
          <p className="text-sm text-neutral-400 mt-1">Discreet wealth allocation structures.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] px-4 py-2 text-xs font-medium text-black transition hover:scale-[1.02]" onClick={()=>{
          create.mutate({
            name:"New Portfolio",
            description:"My investement structure"
          })
        }}>
          <Plus size={14} /> New Structure
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {portfolios.data?.map((p, idx) => (
          <div key={idx} className="group rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-neutral-900/30">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-[#b5b5f6]">
                <FolderKanban size={16} />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-[#f7bff4] transition-colors">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{p.description || "No description"}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-neutral-500">Created</span>
              <p className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}