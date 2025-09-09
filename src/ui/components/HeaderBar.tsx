import React from "react";
import type { Board } from "../../core/types";

export function HeaderBar({
  logoSrc,
  boards,
  selectedBoardIdx,
  onBoardChange,
  statusText,
}: {
  logoSrc: string;
  boards: Board[];
  selectedBoardIdx: number;
  onBoardChange: (i: number) => void;
  statusText: string;
}) {
  return (
    <header className="w-full bg-[#5B2379]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex items-center justify-between">
        {/* LEFT: logo */}
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}img/logo.png`}
            alt="Soldered Image Converter"
            className="h-10 md:h-12 object-contain"
          />
        </div>

        {/* CENTER: status text */}
        <div className="flex-1 text-center">
          <span className="text-white font-medium text-sm md:text-base">
            {statusText}
          </span>
        </div>

        {/* RIGHT: board select */}
        <div className="flex items-center gap-3">
          <label className="text-white text-sm md:text-base">Select board:</label>
          <select
            className="bg-white text-gray-900 rounded-lg px-3 py-2 shadow-sm min-w-[220px] focus:outline-none"
            value={selectedBoardIdx}
            onChange={(e) => onBoardChange(Number(e.target.value))}
          >
            {boards.map((b, i) => (
              <option key={b.board} value={i}>
                {b.board}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
