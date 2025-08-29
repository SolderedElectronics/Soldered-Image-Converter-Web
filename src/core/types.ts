export type ResizeMode = "fit" | "fill" | "stretch";

export type DitherMode = "none" | "floyd-steinberg" | "jarvis" | "simple2d";

type ModeDefaults = {
  threshold?: number;
  invert?: boolean;
  dither?: DitherMode;
};

export interface Mode1Bpp {
  id: string;
  bpp: 1;
  defaults?: ModeDefaults;
}

export interface Mode3Bpp {
  id: string;
  bpp: 3;
  levels?: 8;
  defaults?: ModeDefaults;
}

export interface Mode4Bpp {
  id: string;
  bpp: 4;
  levels?: 16;
  defaults?: ModeDefaults;
}

export type Mode = Mode1Bpp | Mode3Bpp | Mode4Bpp;

export interface Board {
  board: string;
  display_width: number;
  display_height: number;
  modes: Mode[];
  ui_defaults?: { resize?: ResizeMode };
}

export interface BoardsFile { boards: Board[] }

// ---- Converter I/O ----
export interface ConvertParams {
  threshold?: number;
  invert?: boolean;
  resize: ResizeMode;
  modeId: string;
  dither?: DitherMode;
  imageName?: string;
}

export interface ConvertRequest {
  imageBitmap: ImageBitmap;
  targetW: number;
  targetH: number;
  params: ConvertParams;
  mode: Mode;
}

export interface ConvertResult {
  buffer: Uint8Array;
  meta: { width: number; height: number; bpp: number; modeId: string };
  preview: ImageData;
}
