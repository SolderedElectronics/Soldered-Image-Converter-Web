import React from "react";

// A pill-styled numbered step, like "1. Upload an image"
function StepPill({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 bg-[#EFE7F7] text-[#5A2D82] rounded-full px-4 py-2 text-lg md:text-xl font-semibold">
        <span className="bg-white text-[#5A2D82] rounded-full w-8 h-8 md:w-9 md:h-9 grid place-items-center font-bold">
          {n}.
        </span>
        <span>{title}</span>
      </div>
    </div>
  );
}

export function StepsRow() {
  return (
    <div className="w-full flex flex-col gap-6">
      <p className="text-center text-gray-700 text-sm md:text-base">
        Soldered Image Converter is a simple tool used to generate Arduino-compatible C++ code
        for displaying images on displays from Soldered Electronics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        <StepPill n={1} title="Upload an image" />
        <StepPill n={2} title="Convert and save" />
        <StepPill n={3} title="Upload to board" />
      </div>
    </div>
  );
}
