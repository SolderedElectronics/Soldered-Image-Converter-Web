export function pack3bppHighFirstFromIndex(
  idx: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const bytesPerRow = Math.ceil(width / 2);
  const out = new Uint8Array(bytesPerRow * height);
  let oi = 0;

  for (let y = 0; y < height; y++) {
    let nibs = 0, byte = 0;
    for (let x = 0; x < width; x++) {
      const v3 = (idx[y * width + x] & 0x07);
      const nibble = (v3 << 1) & 0x0F;
      byte = (byte << 4) | nibble;
      if (++nibs === 2) { out[oi++] = byte; nibs = 0; byte = 0; }
    }
    if (nibs === 1) { out[oi++] = (byte << 4); }
  }
  return out;
}
