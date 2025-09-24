import type { ConvertRequest, ConvertResult, Mode, DitherMode } from "./types";
import { pack1bppMSBFirstBlack1 } from "./packers/pack1bpp";
import { pack2bppMSBFirst } from "./packers/pack2bpp";
import { pack3bppHighFirstFromIndex } from "./packers/pack3bpp";
import { pack4bppHighFirst } from "./packers/pack4bpp";
import { ditherTo1bpp, ditherToLevelsN, levelsIndexToGray } from "./dither";

export async function runPipeline(req: ConvertRequest): Promise<ConvertResult> {
  const { imageBitmap, targetW, targetH, params, mode } = req;

  const off =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(targetW, targetH)
      : (document.createElement("canvas") as HTMLCanvasElement);
  (off as any).width = targetW;
  (off as any).height = targetH;
  const ctx = (off as any).getContext("2d")!;

  const r = computeDrawRects(
    imageBitmap.width, imageBitmap.height, targetW, targetH, params.resize
  );
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(imageBitmap, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const rgba = imgData.data;

  let gray = toGrayscale(rgba);
  if (params.invert && (mode.bpp === 1 || mode.bpp === 3 || mode.bpp === 4)) {
    gray = invertGray(gray);
  }

  const bpp = mode.bpp as 1 | 2 | 3 | 4 | 5;

  switch (bpp) {
    case 1: {
      const dmode: DitherMode = params.dither ?? "none";
    
      if (dmode !== "none") {
        const thr = params.threshold ?? 128;
        const bwMap = ditherTo1bpp(gray, targetW, targetH, dmode, thr);
        if (dmode === "simple2d") {
          for (let i = 0; i < bwMap.length; i++) bwMap[i] = 255 - bwMap[i];
        }
        imgData.data.set(monoToRGBA(bwMap));
        const buffer = pack1bppMSBFirstBlack1(bwMap, targetW, targetH, thr, false);
        return done(buffer, imgData, targetW, targetH, 1, mode.id);
      }
    
      const thr = params.threshold ?? 128;
      const bwMap = new Uint8ClampedArray(gray.length);
      for (let i = 0; i < gray.length; i++) bwMap[i] = gray[i] > thr ? 255 : 0;
      imgData.data.set(monoToRGBA(bwMap));
      const buffer = pack1bppMSBFirstBlack1(bwMap, targetW, targetH, thr, false);
      return done(buffer, imgData, targetW, targetH, 1, mode.id);
    }

    case 2: {
      const PAL_WBR: [number, number, number, number][] = [
        [255, 255, 255, 255],
        [0, 0, 0, 255],
        [220, 0, 0, 255],
      ];
      const kernel = normalizeColorKernel(params.dither as string);
      const invertRGBBefore = !!params.invert;

      const idx =
        kernel === "none"
          ? quantizeToPalette(rgba, targetW, targetH, PAL_WBR, invertRGBBefore)
          : colorDitherToPalette(rgba, targetW, targetH, kernel, PAL_WBR, invertRGBBefore);

      paintPalettePreviewRGBA(imgData.data, idx, PAL_WBR);
      const buffer = pack2bppMSBFirst(idx, targetW, targetH);
      return done(buffer, imgData, targetW, targetH, 2, mode.id);
    }

    case 3: {
      const idx = ditherToLevelsN(gray, targetW, targetH, 8, (params.dither ?? "none") as DitherMode);
      const q = levelsIndexToGray(idx, 8);
      imgData.data.set(monoToRGBA(q));
      const buffer = pack3bppHighFirstFromIndex(idx, targetW, targetH);
      return done(buffer, imgData, targetW, targetH, 3, mode.id);
    }

    case 4: {
      const idx = ditherToLevelsN(gray, targetW, targetH, 16, (params.dither ?? "none") as DitherMode);
      const q = levelsIndexToGray(idx, 16);
      imgData.data.set(monoToRGBA(q));
      const buffer = pack4bppHighFirst(q, targetW, targetH, false);
      return done(buffer, imgData, targetW, targetH, 4, mode.id);
    }

    case 5: {
      if ((mode as any)?.levels === 7) {
        const PAL_6COLOR: [number, number, number, number][] = [
          [0,   0,   0,   255], // 0 black
          [255, 255, 255, 255], // 1 white
          [0,   255, 0,   255], // 2 green
          [0,   0,   255, 255], // 3 blue
          [255, 0,   0,   255], // 4 red
          [255, 255, 0,   255], // 5 yellow
          [255, 165, 0,   255], // 6 orange
        ];

        const invertRGBBefore = !!params.invert;
        const kernel = normalizeColorKernel(params.dither as string);

        const idx =
          kernel === "none"
            ? quantizeToPalette(rgba, targetW, targetH, PAL_6COLOR, invertRGBBefore)
            : colorDitherToPalette(rgba, targetW, targetH, kernel, PAL_6COLOR, invertRGBBefore);

        paintPalettePreviewRGBA(imgData.data, idx, PAL_6COLOR);

        const buffer = pack3bppHighFirstFromIndex(idx, targetW, targetH);

        return done(buffer, imgData, targetW, targetH, 4, mode.id);
      }

      break;
    }

  }

  throw new Error(`Unsupported bpp mode: ${String((mode as Mode).bpp)}`);
}

function done(
  buffer: Uint8Array,
  imgData: ImageData,
  width: number,
  height: number,
  bpp: 1 | 2 | 3 | 4,
  modeId: string
): ConvertResult {
  return { buffer, meta: { width, height, bpp, modeId }, preview: imgData };
}

function toGrayscale(src: Uint8ClampedArray): Uint8ClampedArray {
  const n = Math.floor(src.length / 4);
  const out = new Uint8ClampedArray(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    out[i] = Math.round(0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]);
  }
  return out;
}
function invertGray(src: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i++) out[i] = 255 - src[i];
  return out;
}

function computeDrawRects(
  sw: number, sh: number, tw: number, th: number, mode: "fit" | "fill" | "stretch"
) {
  if (mode === "stretch") return { sx: 0, sy: 0, sw, sh, dx: 0, dy: 0, dw: tw, dh: th };
  const sAspect = sw / sh, tAspect = tw / th;
  if (mode === "fit") {
    if (sAspect > tAspect) {
      const scale = tw / sw;
      const dh = Math.round(sh * scale);
      const dy = Math.floor((th - dh) / 2);
      return { sx: 0, sy: 0, sw, sh, dx: 0, dy, dw: tw, dh };
    } else {
      const scale = th / sh;
      const dw = Math.round(sw * scale);
      const dx = Math.floor((tw - dw) / 2);
      return { sx: 0, sy: 0, sw, sh, dx, dy: 0, dw, dh: th };
    }
  } else {
    if (sAspect > tAspect) {
      const newW = Math.round(sh * tAspect);
      const sx = Math.floor((sw - newW) / 2);
      return { sx, sy: 0, sw: newW, sh, dx: 0, dy: 0, dw: tw, dh: th };
    } else {
      const newH = Math.round(sw / tAspect);
      const sy = Math.floor((sh - newH) / 2);
      return { sx: 0, sy, sw, sh: newH, dx: 0, dy: 0, dw: tw, dh: th };
    }
  }
}

function monoToRGBA(mono: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(mono.length * 4);
  for (let i = 0, j = 0; i < mono.length; i++, j += 4) {
    const v = mono[i];
    out[j] = out[j + 1] = out[j + 2] = v;
    out[j + 3] = 255;
  }
  return out;
}

type ColorDitherName =
  | "FloydSteinberg" | "FalseFloydSteinberg"
  | "Stucki" | "Atkinson" | "Jarvis" | "Burkes"
  | "Sierra" | "TwoSierra" | "SierraLite"
  | "none";

type Kernel = { matrix: number[][]; div: number; serpentine?: boolean };

const KERNELS: Record<Exclude<ColorDitherName, "none">, Kernel> = {
  FloydSteinberg: { matrix: [[0, 0, 7], [3, 5, 1]], div: 16, serpentine: true },
  FalseFloydSteinberg: { matrix: [[0, 0, 3], [3, 2, 0]], div: 8, serpentine: true },
  Jarvis: { matrix: [[0,0,7,5],[3,5,7,5,3],[1,3,5,3,1]], div: 48, serpentine: true },
  Stucki: { matrix: [[0,0,8,4],[2,4,8,4,2],[1,2,4,2,1]], div: 42, serpentine: true },
  Atkinson: { matrix: [[0,0,1,1],[1,1,1],[0,1]], div: 8, serpentine: true },
  Burkes: { matrix: [[0,0,8,4],[2,4,8,4,2]], div: 32, serpentine: true },
  Sierra: { matrix: [[0,0,5,3],[2,4,5,4,2],[0,2,3,2]], div: 32, serpentine: true },
  TwoSierra: { matrix: [[0,0,4,3],[1,2,3,2,1]], div: 16, serpentine: true },
  SierraLite: { matrix: [[0,0,2],[1,1]], div: 4, serpentine: true },
};

function clamp255(x: number): number { return x < 0 ? 0 : x > 255 ? 255 : x; }

function normalizeColorKernel(name?: string | null): ColorDitherName {
  if (!name || name === "none") return "none";
  switch (name) {
    case "FloydSteinberg": case "floyd-steinberg": case "fs": return "FloydSteinberg";
    case "FalseFloydSteinberg": case "false-floyd-steinberg": case "ffs": return "FalseFloydSteinberg";
    case "Jarvis": case "jarvis": return "Jarvis";
    case "Stucki": case "stucki": return "Stucki";
    case "Atkinson": case "atkinson": return "Atkinson";
    case "Burkes": case "burkes": return "Burkes";
    case "Sierra": case "sierra": return "Sierra";
    case "TwoSierra": case "two-sierra": case "two_sierra": return "TwoSierra";
    case "SierraLite": case "sierra-lite": case "sierra_lite": case "simple2d": return "SierraLite";
  }
  return "FloydSteinberg";
}

function quantizeToPalette(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  PAL: [number, number, number, number][],
  invertRGBBefore = false
): Uint8ClampedArray {
  const N = width * height;
  const idx = new Uint8ClampedArray(N);
  for (let i = 0; i < N; i++) {
    const j = i * 4;
    let r = rgba[j], g = rgba[j + 1], b = rgba[j + 2];
    if (invertRGBBefore) { r = 255 - r; g = 255 - g; b = 255 - b; }
    let best = Infinity, bestK = 0;
    for (let k = 0; k < PAL.length; k++) {
      const pr = PAL[k][0], pg = PAL[k][1], pb = PAL[k][2];
      const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (d < best) { best = d; bestK = k; }
    }
    idx[i] = bestK;
  }
  return idx;
}

function colorDitherToPalette(
  rgbaIn: Uint8ClampedArray,
  width: number,
  height: number,
  kernelName: ColorDitherName,
  PAL: [number, number, number, number][],
  invertRGBBefore = false
): Uint8ClampedArray {
  const N = width * height;
  const rgba = new Float32Array(rgbaIn.length);
  for (let i = 0; i < rgbaIn.length; i++) {
    const v = rgbaIn[i];
    rgba[i] = invertRGBBefore ? (i % 4 === 3 ? v : 255 - v) : v;
  }

  const idx = new Uint8ClampedArray(N);
  if (kernelName === "none") return quantizeToPalette(rgbaIn, width, height, PAL, invertRGBBefore);

  const K = KERNELS[kernelName as Exclude<ColorDitherName, "none">] ?? KERNELS.FloydSteinberg;
  const serp = K.serpentine ?? true;

  for (let y = 0; y < height; y++) {
    const ltr = serp ? (y % 2 === 0) : true;
    const xStart = ltr ? 0 : width - 1;
    const xEnd = ltr ? width : -1;
    const xStep = ltr ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = y * width + x, j = i * 4;
      const r = clamp255(rgba[j]), g = clamp255(rgba[j + 1]), b = clamp255(rgba[j + 2]);

      let best = Infinity, bestK = 0;
      for (let k = 0; k < PAL.length; k++) {
        const pr = PAL[k][0], pg = PAL[k][1], pb = PAL[k][2];
        const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (d < best) { best = d; bestK = k; }
      }
      idx[i] = bestK;

      const qr = PAL[bestK][0], qg = PAL[bestK][1], qb = PAL[bestK][2];
      const er = r - qr, eg = g - qg, eb = b - qb;

      const M = K.matrix, div = K.div;
      for (let ky = 0; ky < M.length; ky++) {
        const row = M[ky];
        for (let kx = 0; kx < row.length; kx++) {
          const w = row[kx]; if (!w) continue;
          const dx = ltr ? (kx - 1) : -(kx - 1);
          const nx = x + dx, ny = y + (ky + 1);
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nj = (ny * width + nx) * 4;
          const f = w / div;
          rgba[nj]     += er * f;
          rgba[nj + 1] += eg * f;
          rgba[nj + 2] += eb * f;
        }
      }
    }
  }
  return idx;
}

function paintPalettePreviewRGBA(
  rgba: Uint8ClampedArray,
  idx: Uint8ClampedArray,
  PAL: [number, number, number, number][]
) {
  for (let i = 0; i < idx.length; i++) {
    const j = i * 4, p = PAL[idx[i]];
    rgba[j] = p[0]; rgba[j + 1] = p[1]; rgba[j + 2] = p[2]; rgba[j + 3] = p[3];
  }
}
