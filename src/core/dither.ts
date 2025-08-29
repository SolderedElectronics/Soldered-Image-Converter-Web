export type DitherMode = "none" | "floyd-steinberg" | "jarvis" | "simple2d";

export function ditherTo1bpp(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  mode: DitherMode,
  threshold = 128
): Uint8ClampedArray {
  if (mode === "none") return threshold1bpp(gray, threshold);

  const f = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) f[i] = gray[i];

  const out = new Uint8ClampedArray(gray.length);
  const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const at = (x: number, y: number) => y * width + x;

  if (mode === "simple2d") {
    const pat = [
      [0, 128],
      [192, 64],
    ];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = f[at(x, y)];
        const t = pat[y & 1][x & 1] * 0.75 + threshold * 0.25;
        out[at(x, y)] = v > t ? 0 : 255;
      }
    }
    return out;
  }

  const fs = [
    { dx: +1, dy: 0, w: 7 },
    { dx: -1, dy: +1, w: 3 },
    { dx: 0, dy: +1, w: 5 },
    { dx: +1, dy: +1, w: 1 },
  ];
  const jarvis = [
    // dy=0
    { dx: +1, dy: 0, w: 7 }, { dx: +2, dy: 0, w: 5 },
    // dy=+1
    { dx: -2, dy: +1, w: 3 }, { dx: -1, dy: +1, w: 5 }, { dx:  0, dy: +1, w: 7 }, { dx: +1, dy: +1, w: 5 }, { dx: +2, dy: +1, w: 3 },
    // dy=+2
    { dx: -2, dy: +2, w: 1 }, { dx: -1, dy: +2, w: 3 }, { dx:  0, dy: +2, w: 5 }, { dx: +1, dy: +2, w: 3 }, { dx: +2, dy: +2, w: 1 },
  ];
  const norm = mode === "floyd-steinberg" ? 16 : 48;
  const kernel = mode === "floyd-steinberg" ? fs : jarvis;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = at(x, y);
      const old = f[i];
      const newPx = old > threshold ? 255 : 0;
      out[i] = newPx;
      const err = old - newPx;
      for (const k of kernel) {
        const nx = x + k.dx, ny = y + k.dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = at(nx, ny);
        f[ni] = clamp255(f[ni] + (err * k.w) / norm);
      }
    }
  }
  return out;
}

function threshold1bpp(gray: Uint8ClampedArray, threshold: number) {
  const out = new Uint8ClampedArray(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i] > threshold ? 0 : 255;
  return out;
}

export function ditherToLevelsN(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  levels: number,
  mode: DitherMode
): Uint8ClampedArray {
  if (levels < 2) throw new Error("levels must be >= 2");

  if (mode === "none") {
    const step = 255 / (levels - 1);
    const idx = new Uint8ClampedArray(gray.length);
    for (let i = 0; i < gray.length; i++) {
      let k = Math.round(gray[i] / step);
      if (k < 0) k = 0;
      else if (k > levels - 1) k = levels - 1;
      idx[i] = k;
    }
    return idx;
  }

  if (mode === "simple2d") {
    const step = 255 / (levels - 1);
    const pat = [
      [0, 128],
      [192, 64],
    ];
    const out = new Uint8ClampedArray(gray.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const t = pat[y & 1][x & 1];
        const q = Math.round(Math.min(255, Math.max(0, gray[i] + (t - 128) * 0.5)) / step);
        out[i] = clampIndex(q, levels);
      }
    }
    return out;
  }

  // Error diffusion (FS/Jarvis), serpentine scan
  const work = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) work[i] = gray[i];

  const out = new Uint8ClampedArray(gray.length);
  const step = 255 / (levels - 1);
  const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const clampIdx = (k: number) => (k < 0 ? 0 : k > levels - 1 ? levels - 1 : k);

  type Tap = { dx: number; dy: number; w: number };
  let taps: Tap[];
  let norm: number;

  if (mode === "floyd-steinberg") {
    norm = 16;
    taps = [
      { dx: +1, dy: 0, w: 7 },
      { dx: -1, dy: +1, w: 3 },
      { dx:  0, dy: +1, w: 5 },
      { dx: +1, dy: +1, w: 1 },
    ];
  } else { // "jarvis"
    norm = 48;
    taps = [
      // dy=0
      { dx: +1, dy: 0, w: 7 }, { dx: +2, dy: 0, w: 5 },
      // dy=+1
      { dx: -2, dy: +1, w: 3 }, { dx: -1, dy: +1, w: 5 }, { dx: 0, dy: +1, w: 7 },
      { dx: +1, dy: +1, w: 5 }, { dx: +2, dy: +1, w: 3 },
      // dy=+2
      { dx: -2, dy: +2, w: 1 }, { dx: -1, dy: +2, w: 3 }, { dx: 0, dy: +2, w: 5 },
      { dx: +1, dy: +2, w: 3 }, { dx: +2, dy: +2, w: 1 },
    ];
  }

  for (let y = 0; y < height; y++) {
    const serp = (y & 1) === 1;
    const xStart = serp ? width - 1 : 0;
    const xEnd = serp ? -1 : width;
    const xStep = serp ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = y * width + x;
      const val = work[i];

      let k = Math.round(val / step);
      k = clampIdx(k);
      out[i] = k;

      const qv = k * step;
      const err = val - qv;

      for (const t of taps) {
        const dx = serp ? -t.dx : t.dx;
        const xx = x + dx, yy = y + t.dy;
        if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
        const j = yy * width + xx;
        work[j] = clamp255(work[j] + (err * t.w) / norm);
      }
    }
  }

  return out;
}

export function levelsIndexToGray(idx: Uint8ClampedArray, levels: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(idx.length);
  const step = 255 / (levels - 1);
  for (let i = 0; i < idx.length; i++) out[i] = Math.round(idx[i] * step);
  return out;
}

function clampIndex(k: number, levels: number) {
  return k < 0 ? 0 : k > levels - 1 ? levels - 1 : k;
}
