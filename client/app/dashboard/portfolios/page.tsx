"use client";

import { useState } from "react";
import {
  FolderKanban,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Wallet,
  BarChart2,
  Lock,
  Globe,
  X,
  Loader2,
} from "lucide-react";
import { usePortfolios } from "@/hooks/usePortfolio";
import { useRouter } from "next/navigation";
import type { Portfolio } from "@/services/portfolio.service";

// ─── Modal: Create Portfolio ───────────────────────────────────────────────
function CreatePortfolioModal({
  open,
  onClose,
  onCreate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() || undefined });
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition"
          >
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
              placeholder="Briefly describe this portfolio's strategy or purpose..."
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
              disabled={isPending || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
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

// ─── Modal: Edit Portfolio ──────────────────────────────────────────────────
function EditPortfolioModal({
  portfolio,
  open,
  onClose,
  onUpdate,
  isPending,
}: {
  portfolio: Portfolio;
  open: boolean;
  onClose: () => void;
  onUpdate: (data: { name?: string; description?: string | null }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(portfolio.name);
  const [description, setDescription] = useState(portfolio.description ?? "");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Portfolio</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Update portfolio details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Portfolio Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#b5b5f6]/50 focus:ring-1 focus:ring-[#b5b5f6]/20 transition resize-none"
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Delete Confirm ──────────────────────────────────────────────────
function DeleteConfirmModal({
  portfolio,
  open,
  onClose,
  onDelete,
  isPending,
}: {
  portfolio: Portfolio;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-red-900/30 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Delete Portfolio</h2>
            <p className="text-xs text-neutral-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-neutral-400 mb-6">
          Deleting <span className="text-white font-medium">{portfolio.name}</span> will permanently remove all associated accounts, holdings, and transactions.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-sm text-neutral-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/30 hover:text-red-300 transition disabled:opacity-50"
          >
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Card ─────────────────────────────────────────────────────────
function PortfolioCard({
  portfolio,
  onEdit,
  onDelete,
  onClick,
}: {
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const accountCount = portfolio._count?.accounts ?? 0;
  const holdingCount = portfolio._count?.holdings ?? 0;

  return (
    <div
      className="group relative rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:border-white/10 hover:bg-neutral-900/30 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Ambient gradient glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#b5b5f6]/3 to-[#f7bff4]/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#b5b5f6]/15 to-[#f7bff4]/10 border border-white/8 flex items-center justify-center text-[#b5b5f6]">
            <FolderKanban size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-[#f7bff4] transition-colors text-sm">
              {portfolio.name}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
              {portfolio.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-white transition opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-white/8 bg-neutral-900 shadow-xl shadow-black/40 py-1 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Pencil size={12} /> Edit Portfolio
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Wallet size={11} className="text-[#b5b5f6]" />
          <span>{accountCount} account{accountCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <BarChart2 size={11} className="text-[#f7bff4]" />
          <span>{holdingCount} holding{holdingCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-neutral-600">
          {portfolio.visibility === "PRIVATE" ? <Lock size={10} /> : <Globe size={10} />}
          {portfolio.visibility === "PRIVATE" ? "Private" : "Public"}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-neutral-600">
          Created {new Date(portfolio.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1 text-xs text-[#b5b5f6] opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/8 bg-neutral-950/20">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#b5b5f6]/10 to-[#f7bff4]/10 border border-white/8 flex items-center justify-center mb-5">
        <FolderKanban size={24} className="text-[#b5b5f6]" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">No portfolios yet</h3>
      <p className="text-sm text-neutral-500 mb-6 text-center max-w-xs">
        Create your first portfolio to start tracking accounts, holdings, and transactions.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
      >
        <Plus size={14} /> Create Portfolio
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PortfoliosPage() {
  const { portfolios, create, update, remove } = usePortfolios();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Portfolio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  const handleCreate = (data: { name: string; description?: string }) => {
    create.mutate(data, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (data: { name?: string; description?: string | null }) => {
    if (!editTarget) return;
    update.mutate({ portfolioId: editTarget.id, data }, { onSuccess: () => setEditTarget(null) });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Portfolios</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Discreet wealth allocation structures — each portfolio holds its own accounts, holdings, and transactions.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b5b5f6] to-[#f7bff4] px-4 py-2 text-xs font-medium text-black transition hover:scale-[1.02] hover:opacity-90 shadow-[0_0_20px_rgba(181,181,246,0.2)]"
        >
          <Plus size={13} /> New Portfolio
        </button>
      </div>

      {/* Stats Bar */}
      {portfolios.data && portfolios.data.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Portfolios",
              value: portfolios.data.length,
              color: "text-[#b5b5f6]",
            },
            {
              label: "Total Accounts",
              value: portfolios.data.reduce((s, p) => s + (p._count?.accounts ?? 0), 0),
              color: "text-[#f7bff4]",
            },
            {
              label: "Total Holdings",
              value: portfolios.data.reduce((s, p) => s + (p._count?.holdings ?? 0), 0),
              color: "text-white",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-neutral-950/40 p-4"
            >
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {portfolios.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 h-48 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 rounded bg-white/5 w-2/3" />
                  <div className="h-2.5 rounded bg-white/4 w-1/2" />
                </div>
              </div>
              <div className="h-2 rounded bg-white/4 w-full mt-8" />
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Grid */}
      {!portfolios.isLoading && portfolios.data && portfolios.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {portfolios.data.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onClick={() => router.push(`/dashboard/portfolios/${portfolio.id}`)}
              onEdit={() => setEditTarget(portfolio)}
              onDelete={() => setDeleteTarget(portfolio)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!portfolios.isLoading && portfolios.data?.length === 0 && (
        <EmptyState onCreateClick={() => setCreateOpen(true)} />
      )}

      {/* Modals */}
      <CreatePortfolioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        isPending={create.isPending}
      />

      {editTarget && (
        <EditPortfolioModal
          portfolio={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={handleUpdate}
          isPending={update.isPending}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          portfolio={deleteTarget}
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
          isPending={remove.isPending}
        />
      )}
    </div>
  );
}