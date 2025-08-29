import React from "react";
import type { Mode, ResizeMode } from "../../core/types";

export type DitherUI =
  | "none"
  | "floyd-steinberg"
  | "false-floyd-steinberg"
  | "jarvis"
  | "stucki"
  | "atkinson"
  | "burkes"
  | "sierra"
  | "two-sierra"
  | "sierra-lite"
  | "simple2d";

type Bpp = 1 | 2 | 3 | 4;

export function Controls(props: {
  modes: Mode[];
  selectedModeId: string;
  onModeChange: (id: string) => void;

  imageName: string;
  onImageName: (s: string) => void;
  onSetImageName: () => void;

  threshold: number;
  onThresholdChange: (n: number) => void;
  onThresholdCommit: () => void;

  dither: DitherUI;
  onDither: (d: DitherUI) => void;

  invert: boolean;
  onInvert: (b: boolean) => void;

  resize: ResizeMode;
  onResize: (m: ResizeMode) => void;
  constrain: boolean;
  onConstrain: (b: boolean) => void;

  baseWidth: number;
  baseHeight: number;

  customWidth: number | null;
  onCustomWidth: (n: number | null) => void;
  customHeight: number | null;
  onCustomHeight: (n: number | null) => void;

  onApplySize: () => void;
  onConvert: () => void;
}) {
  const {
    modes,
    selectedModeId,
    onModeChange,
    imageName,
    onImageName,
    onSetImageName,
    threshold,
    onThresholdChange,
    onThresholdCommit,
    dither,
    onDither,
    invert,
    onInvert,
    resize,
    onResize,
    constrain,
    onConstrain,
    baseWidth,
    baseHeight,
    customWidth,
    onCustomWidth,
    customHeight,
    onCustomHeight,
    onApplySize,
    onConvert,
  } = props;

  const currentMode = modes.find((m) => m.id === selectedModeId);
  const bpp: Bpp = (currentMode?.bpp ?? 1) as Bpp;

  const is2bpp = bpp === 2;
  const isSixColor = bpp === 4 && (currentMode as any)?.levels === 7;
  const isColorDither = is2bpp || isSixColor;

  const thresholdAllowed = bpp === 1;

  const ditherOptionsBW = [
    { value: "none", label: "None" },
    { value: "floyd-steinberg", label: "Floyd–Steinberg" },
    { value: "jarvis", label: "Jarvis–Judice–Ninke" },
    { value: "simple2d", label: "Simple 2D" },
  ] as const;

  const ditherOptionsColor = [
    { value: "none", label: "None" },
    { value: "floyd-steinberg", label: "Floyd–Steinberg" },
    { value: "false-floyd-steinberg", label: "False Floyd–Steinberg" },
    { value: "stucki", label: "Stucki" },
    { value: "atkinson", label: "Atkinson" },
    { value: "jarvis", label: "Jarvis–Judice–Ninke" },
    { value: "burkes", label: "Burkes" },
    { value: "sierra", label: "Sierra" },
    { value: "two-sierra", label: "Two-Row Sierra" },
    { value: "sierra-lite", label: "Sierra Lite" },
    { value: "simple2d", label: "Simple 2D" },
  ] as const;

  const ditherOptions = isColorDither ? ditherOptionsColor : ditherOptionsBW;

  const shownW = customWidth ?? baseWidth;
  const shownH = customHeight ?? baseHeight;

  return (
    <div className="p-4 space-y-4">
      {/* Mode */}
      <div>
        <label className="block text-sm font-semibold mb-1">Color depth / Mode:</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedModeId}
          onChange={(e) => onModeChange(e.target.value)}
        >
          {modes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
      </div>

      {/* Image name + SET */}
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Image name:</label>
          <input
            className="border rounded p-2 w-full"
            value={imageName}
            onChange={(e) => onImageName(e.target.value)}
            placeholder="image_name"
          />
          <p className="text-xs text-gray-500 mt-1">
            Allowed: A–Z a–z 0–9 and _. Must not start with a number.
          </p>
        </div>
        <button
          className="h-[40px] px-4 rounded-md font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0]"
          onClick={onSetImageName}
          type="button"
        >
          SET
        </button>
      </div>

      {/* Threshold (1-bpp only) */}
      <div className={thresholdAllowed ? "" : "opacity-50"}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold">B/W threshold:</label>
          <span className="text-sm">{threshold}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          onMouseUp={onThresholdCommit}
          onTouchEnd={onThresholdCommit}
          className="w-full"
          disabled={!thresholdAllowed}
        />
        {!thresholdAllowed && (
          <p className="text-xs text-gray-500 mt-1">Threshold applies to 1-bpp only.</p>
        )}
      </div>

      {/* Dither */}
      <div>
        <label className="block text-sm font-semibold mb-1">
          Dither kernel{isColorDither ? " (palette)" : ""}:
        </label>
        <select
          className="border rounded p-2 w-full"
          value={dither}
          onChange={(e) => onDither(e.target.value as DitherUI)}
        >
          {ditherOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isColorDither && (
          <p className="text-xs text-gray-500 mt-1">
            Applies color error-diffusion on the device palette.
          </p>
        )}
      </div>

      {/* Invert */}
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={invert}
          onChange={(e) => onInvert(e.target.checked)}
        />
        Invert
      </label>

      {/* Resize mode */}
      <div>
        <label className="block text-sm font-semibold mb-1">Resize mode:</label>
        <select
          className="border rounded p-2 w-full"
          value={resize}
          onChange={(e) => onResize(e.target.value as ResizeMode)}
        >
          <option value="fit">Fit</option>
          <option value="fill">Fill</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>

      {/* Constrain proportions */}
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={constrain}
          onChange={(e) => onConstrain(e.target.checked)}
        />
        Constrain proportions
      </label>

      {/* Width / Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Width:</label>
          <input
            type="number"
            min={1}
            className="border rounded p-2 w-full"
            value={shownW}
            onChange={(e) => {
              const v = e.target.value;
              onCustomWidth(v === "" ? null : Math.max(1, Number(v)));
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Base: {baseWidth}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Height:</label>
          <input
            type="number"
            min={1}
            className="border rounded p-2 w-full"
            value={shownH}
            onChange={(e) => {
              const v = e.target.value;
              onCustomHeight(v === "" ? null : Math.max(1, Number(v)));
            }}
            disabled={constrain}
          />
          <p className="text-xs text-gray-500 mt-1">Base: {baseHeight}</p>
        </div>
      </div>

      {/* Apply size */}
      <button
        className="w-full rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0]"
        onClick={onApplySize}
        type="button"
      >
        RESIZE
      </button>

      {/* Convert */}
      <button
        className="w-full mt-1 rounded-lg py-2 font-semibold text-white bg-[#00C0DE] hover:bg-[#00A8C0]"
        onClick={onConvert}
        type="button"
      >
        UPDATE
      </button>
    </div>
  );
}
