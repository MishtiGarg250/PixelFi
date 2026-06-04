"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { usePortfolios } from "@/hooks/usePortfolio";

interface CreatePortfolioSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePortfolioSheet({ open, onClose, onSuccess }: CreatePortfolioSheetProps) {
  const { create } = usePortfolios();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">New Portfolio</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Create a new wealth allocation structure</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Portfolio Name <span className="text-[#f7bff4]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth Equity Portfolio"
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Description <span className="text-neutral-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this portfolio's strategy..."
              rows={3}
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition resize-none"
              maxLength={200}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-sm text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {create.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Creating...</>
              ) : (
                <><Plus size={14} /> Create Portfolio</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}