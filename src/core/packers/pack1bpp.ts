export function pack1bppMSBFirstBlack1(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 128,
  invert = false
): Uint8Array {
  const bytesPerRow = Math.ceil(width / 8);
  const out = new Uint8Array(bytesPerRow * height);
  let oi = 0;
  for (let y = 0; y < height; y++) {
    let bitCount = 0, byte = 0;
    for (let x = 0; x < width; x++) {
      const g = gray[y * width + x];
      const bw = g > threshold ? 0 : 1;
      const v = invert ? (bw ^ 1) : bw;
      byte = (byte << 1) | v;
      bitCount++;
      if (bitCount === 8) { out[oi++] = byte; bitCount = 0; byte = 0; }
    }
    if (bitCount !== 0) {
      byte = byte << (8 - bitCount);
      out[oi++] = byte;
    }
  }
  return out;
}
