"use client";

import { EyeOff, ShieldAlert, Sliders} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">System Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">Configure parameters, access keys, and operational limits.</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-6">
        <h3 className="text-sm font-medium text-neutral-300 pb-3 border-b border-white/5 flex items-center gap-2">
          <Sliders size={14} className="text-[#b5b5f6]" /> Profile Variables
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 uppercase tracking-wider">Operator Identity</label>
            <input 
              type="text" 
              defaultValue="Alex Mercer" 
              className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 text-sm text-white outline-none focus:border-white/10 focus:bg-white/[0.03] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 uppercase tracking-wider">Secure Communication Routing</label>
            <input 
              type="email" 
              defaultValue="alex@pixelfi.io" 
              className="w-full rounded-xl border border-white/5 bg-white/1  px-4 py-2.5 text-sm text-white outline-none focus:border-white/10 focus:bg-white/[0.03] transition"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-300">Secret Integration Key</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Required for external cloud ingestion routines.</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/2 px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition">
            <EyeOff size={12} /> Reveal Node Key
          </button>
        </div>
        <div className="font-mono text-xs text-neutral-500 bg-white/1 border border-white/5 p-3 rounded-xl select-all">
          pxfi_live_60c226_84240a_95b5f6_f7bff4_premium_sys
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 space-y-4">
        <h3 className="text-sm font-medium text-neutral-300 pb-3 border-b border-white/5 flex items-center gap-2">
          <ShieldAlert size={14} className="text-[#f7bff4]" /> Safety Protocol
        </h3>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-neutral-200 block">Biometric Lock Verification</span>
            <span className="text-xs text-neutral-500 mt-0.5">Mandate secure identification handshakes prior to execution runs.</span>
          </div>
          <div className="h-5 w-9 rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] p-0.5 flex items-center justify-end cursor-pointer">
            <div className="h-4 w-4 rounded-full bg-black shadow-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <button className="rounded-full px-5 py-2.5 text-xs font-medium text-neutral-400 hover:text-white transition">
          Discard Edits
        </button>
        <button className="rounded-full bg-linear-to-r from-[#b5b5f6] to-[#f7bff4] px-6 py-2.5 text-xs font-medium text-black transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(247,191,244,0.15)]">
          Commit Core Parameters
        </button>
      </div>
    </div>
  );
}