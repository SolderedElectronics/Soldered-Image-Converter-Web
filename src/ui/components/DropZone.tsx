import React, { useCallback, useRef, useState } from "react";

export function DropZone({ onFiles }: { onFiles: (files: FileList | null) => void }) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = useCallback(() => inputRef.current?.click(), []);
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(false);
      if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  return (
    <div
      className={[
        "w-full rounded-[2rem] border-4 border-dashed border-[#BDBDBD] transition-colors select-none",
        "px-6 md:px-10 lg:px-14",
        "py-12 md:py-16 lg:py-20 xl:py-24",
        isOver ? "bg-[#D6D6D6]" : "bg-[#E0E0E0]",
      ].join(" ")}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      {/* Title */}
      <h2 className="text-center font-semibold tracking-wide text-gray-900 text-2xl md:text-3xl lg:text-4xl">
        Drag and drop your files here
      </h2>
      <p className="mt-4 text-center text-sm text-gray-600">
        You can upload up to <span className="font-semibold">10 files</span> at a time.
      </p>

      {/* Center artwork — classic photo icon + upload badge */}
      <div className="mt-8 md:mt-10 lg:mt-12 flex justify-center">
        <svg
          className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64"
          viewBox="0 0 256 256"
          aria-hidden="true"
        >
          {/* outer light frame */}
          <rect x="42" y="54" width="148" height="112" rx="10"
                fill="#F3F4F6" stroke="#FFFFFF" strokeWidth="10" />

          {/* mountains */}
          <path d="M54 150 L100 104 L120 124 L138 108 L170 140 L170 166 L54 166 Z"
                fill="#E5E7EB" />
          <path d="M60 166 L102 124 L124 146 L146 130 L166 150 L166 166 Z"
                fill="#D1D5DB" />

          {/* sun */}
          <circle cx="142" cy="92" r="10" fill="#D1D5DB" />

          {/* upload badge overlapping bottom-right */}
          <g transform="translate(168,152)">
            <circle r="34" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="8" />
            <path d="M0 14 V-8 M0 -8 L-9 1 M0 -8 L9 1"
                  stroke="#9CA3AF" strokeWidth="8"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      </div>

      {/* Browse button  */}
      <div className="mt-6 md:mt-8 flex justify-center">
        <button
          className="px-8 md:px-10 lg:px-12 py-3 md:py-3.5 rounded-xl
                     font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0]
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C0DE]"
          onClick={handleBrowse}
          type="button"
        >
          BROWSE
        </button>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
