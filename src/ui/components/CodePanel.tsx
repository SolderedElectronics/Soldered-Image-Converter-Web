import React from "react";

export function CodePanel(props: {
  codeText: string;
  onCopy: () => void;
  onSaveHeader: () => void;
  onSaveAll: () => void;
  onReset: () => void;
}) {
  const { codeText, onCopy, onSaveHeader, onSaveAll, onReset } = props;

  return (
    <div className="flex flex-col h-full">
      <label className="text-sm font-semibold mb-2">Code:</label>
      <textarea
        readOnly
        className="flex-1 w-full border rounded p-2 text-xs leading-4 resize-none"
        style={{ minHeight: 320 }}
        value={codeText}
      />
      <div className="mt-3 space-y-2">
        <button
          className="w-full rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onCopy}
          type="button"
        >
          COPY TO CLIPBOARD
        </button>
        <button
          className="w-full rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onSaveHeader}
          type="button"
        >
          SAVE HEADER FILE
        </button>
        <button
          className="w-full rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onSaveAll}
          type="button"
        >
          SAVE ALL
        </button>
        <button
          className="w-full rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0] active:bg-[#0090A8]"
          onClick={onReset}
          type="button"
        >
          GO BACK
        </button>
      </div>
    </div>
  );
}
