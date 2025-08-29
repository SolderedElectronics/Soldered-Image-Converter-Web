import React from "react";
import { Preview } from "./Preview";
import { Controls } from "./Controls";
import { CodePanel } from "./CodePanel";

export function EditorScreen(props: {
  preview: ImageData | null;
  controlsProps: any;
  codeText: string;
  onCopy: () => void;
  onSaveHeader: () => void;
  onSaveAll: () => void;
  onReset: () => void;
  onPreviewRendered?: () => void;

  // NEW: multi-image navigation
  itemsCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const {
    preview,
    controlsProps,
    codeText,
    onCopy,
    onSaveHeader,
    onSaveAll,
    onReset,
    onPreviewRendered,
    itemsCount,
    currentIndex,
    onPrev,
    onNext,
  } = props;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < itemsCount - 1;

  return (
    <div className="mx-auto max-w-[calc(55vw+620px)] 2xl:max-w-[calc(55vw+680px)] w-full">
      <div className="grid grid-cols-1 xl:grid-cols-[260px_55vw_300px] 2xl:grid-cols-[280px_55vw_340px] gap-3 md:gap-4 items-stretch w-full">
        {/* LEFT */}
        <aside className="hidden xl:block">
          <div className="border rounded sticky top-4 max-h[calc(100vh-6rem)] overflow-auto p-0">
            <Controls {...controlsProps} />
          </div>
        </aside>

        {/* CENTER — PREVIEW + NAV */}
        <main className="border rounded p-3 md:p-4 flex flex-col items-center justify-between min-h-[50vh] w-[55vw] mx-auto">
          <div className="w-full flex-1 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <Preview imageData={preview} onRendered={onPreviewRendered} />
            </div>
          </div>

          {/* Navigation row */}
          <div className="flex justify-center items-center gap-4 mt-3">
            <button
              className={`px-4 py-2 rounded-md font-semibold text-white ${
                hasPrev
                  ? "bg-[#5B2379] hover:bg-[#722C96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B2379]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={onPrev}
              disabled={!hasPrev}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              Prev
            </button>
            
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {itemsCount}
            </span>
            
            <button
              className={`px-4 py-2 rounded-md font-semibold text-white ${
                hasNext
                  ? "bg-[#5B2379] hover:bg-[#722C96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B2379]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={onNext}
              disabled={!hasNext}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              Next
            </button>
          </div>


        </main>

        {/* RIGHT */}
        <aside className="hidden xl:block">
          <div className="border rounded sticky top-4 max-h-[calc(100vh-6rem)] overflow-auto p-3">
            <CodePanel
              codeText={codeText}
              onCopy={onCopy}
              onSaveHeader={onSaveHeader}
              onSaveAll={onSaveAll}
              onReset={onReset}
            />
          </div>
        </aside>

        {/* MOBILE/TABLET */}
        <section className="xl:hidden space-y-3 mt-3">
          <div className="border rounded">
            <Controls {...controlsProps} />
          </div>
          <div className="border rounded p-3">
            <CodePanel
              codeText={codeText}
              onCopy={onCopy}
              onSaveHeader={onSaveHeader}
              onSaveAll={onSaveAll}
              onReset={onReset}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
