import React from "react";
import { StepsRow } from "./Steps";
import { DropZone } from "./DropZone";

export function StartScreen({
  onFiles,
}: {
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <section className="w-full">
      {/* Hidden SEO/Accessibility title */}
      <h1 className="sr-only">Soldered Image Converter</h1>

      {/* scale up strongly on wide screens, but responsive */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 md:py-10 lg:py-12">
        <StepsRow />

        <div className="mt-8 md:mt-10 lg:mt-12">
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    </section>
  );
}
