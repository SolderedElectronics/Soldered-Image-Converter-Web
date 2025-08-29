import React from "react";

export function BusyOverlay({ show, label = "Processing…" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3
                 bg-white/70 backdrop-blur-[1px] rounded"
      aria-live="polite"
      aria-busy="true"
    >
      <svg className="w-10 h-10 animate-spin" viewBox="0 0 50 50" role="status" aria-label={label}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" className="opacity-25" />
        <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="currentColor" strokeWidth="5" className="opacity-90" />
      </svg>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
