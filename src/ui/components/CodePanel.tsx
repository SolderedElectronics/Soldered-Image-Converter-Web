import React from "react";

export function CodePanel(props: {
  codeText: string;
  onCopy: () => void;
  onSaveHeader: () => void;
  onSaveAll: () => void;
  onReset: () => void;

  // NOVO:
  codeMode: "arduino" | "micropython";
  onToggleMode: () => void;
  onSavePy: () => void;
}) {
  const {
    codeText,
    onCopy,
    onSaveHeader,
    onSaveAll,
    onReset,
    codeMode,
    onToggleMode,
    onSavePy,
  } = props;

  const isMP = codeMode === "micropython";

  return (
    <div className="flex flex-col h-full">
      {/* ====== TOGGLE FULL WIDTH ====== */}
      <div className="w-full mb-3">
        <button
          type="button"
          onClick={onToggleMode}
          aria-label="Toggle Arduino/MicroPython"
          className="relative inline-flex items-center justify-between rounded-lg px-1 py-1 select-none shadow-sm overflow-hidden w-full"
          style={{
            backgroundColor: "#5B2379",
            position: "relative",
          }}
        >
          {/* Bubble — malo uži i zaobljen kao gumbi ispod */}
          <span
            className="absolute top-1 bottom-1 rounded-md bg-white transition-all duration-300 ease-in-out"
            style={{
              width: "calc(48% - 0.25rem)", // malo uži bubble
              left: isMP ? "calc(50% + 0.25rem)" : "0.25rem",
              zIndex: 0,
            }}
          />

          {/* Labels iznad bubble-a */}
          <span
            className={`relative z-10 flex-1 text-center py-1 font-semibold text-base transition-colors duration-150 ${
              !isMP ? "text-[#5B2379]" : "text-white"
            }`}
          >
            Arduino
          </span>
          <span
            className={`relative z-10 flex-1 text-center py-1 font-semibold text-base transition-colors duration-150 ${
              isMP ? "text-[#5B2379]" : "text-white"
            }`}
          >
            MicroPython
          </span>
        </button>
      </div>

      {/* ====== CODE BLOCK ====== */}
      <textarea
        readOnly
        className="flex-1 w-full border rounded p-2 text-xs leading-4 resize-none"
        style={{ minHeight: 320 }}
        value={codeText}
      />

      {/* ====== BUTTONS ====== */}
      <div className="mt-3 space-y-2">
        <button
          className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onCopy}
          type="button"
        >
          COPY TO CLIPBOARD
        </button>

        {isMP ? (
          <button
            className="w-full rounded-lg py-2 font-semibold text-white text-base"
            style={{ backgroundColor: "#5B2379" }}
            onClick={onSavePy}
            type="button"
          >
            SAVE PYTHON FILE
          </button>
        ) : (
          <button
            className="w-full rounded-lg py-2 font-semibold text-white text-base"
            style={{ backgroundColor: "#5B2379" }}
            onClick={onSaveHeader}
            type="button"
          >
            SAVE HEADER FILE
          </button>
        )}

        <button
          className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onSaveAll}
          type="button"
        >
          SAVE ALL
        </button>

        <button
          className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onReset}
          type="button"
        >
          GO BACK
        </button>
      </div>
    </div>
  );
}
