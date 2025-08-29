import React from "react";

export function NavArrows({
  onPrev,
  onNext,
  disabled,
}: {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="border rounded px-3 py-2 hover:bg-gray-50 active:bg-gray-100"
        onClick={onPrev}
        disabled={disabled}
        type="button"
      >
        ← Prev
      </button>
      <button
        className="border rounded px-3 py-2 hover:bg-gray-50 active:bg-gray-100"
        onClick={onNext}
        disabled={disabled}
        type="button"
      >
        Next →
      </button>
    </div>
  );
}
