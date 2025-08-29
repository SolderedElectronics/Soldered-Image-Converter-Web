export function pack2bppMSBFirst(
  idx: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const bytesPerRow = Math.ceil(width / 4);
  const out = new Uint8Array(bytesPerRow * height);
  let oi = 0;

  for (let y = 0; y < height; y++) {
    let count = 0, byte = 0;
    for (let x = 0; x < width; x++) {
      const v = (idx[y * width + x] & 0x03);
      byte = (byte << 2) | v;
      if (++count === 4) { out[oi++] = byte; count = 0; byte = 0; }
    }
    if (count !== 0) {
      byte = byte << (2 * (4 - count));
      out[oi++] = byte;
    }
  }
  return out;
}
