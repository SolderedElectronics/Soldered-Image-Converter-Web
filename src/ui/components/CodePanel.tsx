import React from "react";

/**
 * CodePanel
 * ----------
 * A UI component for displaying generated code (Arduino or MicroPython),
 * switching between modes, and providing file export actions.
 *
 * Props:
 *  - codeText:       The text displayed inside the read-only code editor panel.
 *  - onCopy:         Triggered when the user clicks "Copy to Clipboard".
 *  - onSaveHeader:   Saves Arduino code as a .h header file.
 *  - onSaveAll:      Saves the full dataset (images + code + metadata).
 *  - onReset:        Navigates back to the previous UI step.
 *
 *  - codeMode:       Current code format ("arduino" | "micropython").
 *  - onToggleMode:   Switches between Arduino and MicroPython display modes.
 *  - onSavePy:       Saves MicroPython code as a .py file.
 */

export function CodePanel(props: {
  codeText: string;
  onCopy: () => void;
  onSaveHeader: () => void;
  onSaveAll: () => void;
  onReset: () => void;

  // Newer props:
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

  // Whether MicroPython mode is active
  const isMP = codeMode === "micropython";

  return (
    <div className="flex flex-col h-full">

      {/* ====================== MODE TOGGLE ====================== */}
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
          {/* Sliding bubble indicator */}
          <span
            className="absolute top-1 bottom-1 rounded-md bg-white transition-all duration-300 ease-in-out"
            style={{
              width: "calc(48% - 0.25rem)",
              left: isMP ? "calc(50% + 0.25rem)" : "0.25rem",
              zIndex: 0,
            }}
          />

          {/* Labels (drawn above the sliding bubble) */}
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

      {/* ====================== CODE DISPLAY AREA ====================== */}
      <textarea
        readOnly
        className="flex-1 w-full border rounded p-2 text-xs leading-4 resize-none"
        style={{ minHeight: 320 }}
        value={codeText}
      />

      {/* ====================== ACTION BUTTONS ====================== */}
      <div className="mt-3 space-y-2">

        {/* Copy to Clipboard */}
        <button
          className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onCopy}
          type="button"
        >
          COPY TO CLIPBOARD
        </button>

        {/* Save Arduino header OR MicroPython script
            Now includes hover highlight (github-style improvement) */}
        {isMP ? (
          <button
            className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#5B2379] hover:bg-[#6A2C8C] transition-colors"
            onClick={onSavePy}
            type="button"
          >
            SAVE PYTHON FILE
          </button>
        ) : (
          <button
            className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#5B2379] hover:bg-[#6A2C8C] transition-colors"
            onClick={onSaveHeader}
            type="button"
          >
            SAVE HEADER FILE
          </button>
        )}

        {/* Save all data */}
        <button
          className="w-full rounded-lg py-2 font-semibold text-white text-base bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onSaveAll}
          type="button"
        >
          SAVE ALL
        </button>

        {/* Return to previous step */}
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
