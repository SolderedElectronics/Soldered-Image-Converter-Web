export function pack4bppHighFirst(
gray: Uint8ClampedArray,
width: number,
height: number,
invert = false
): Uint8Array {
const bytesPerRow = Math.ceil(width / 2);
const out = new Uint8Array(bytesPerRow * height);
let oi = 0;
for (let y = 0; y < height; y++) {
let nibbleCount = 0, byte = 0;
for (let x = 0; x < width; x++) {
let v4 = (gray[y * width + x] >> 4) & 0x0f;
if (invert) v4 = 0x0f - v4;
byte = (byte << 4) | v4;
nibbleCount++;
if (nibbleCount === 2) { out[oi++] = byte; nibbleCount = 0; byte = 0; }
}
if (nibbleCount === 1) {
byte = (byte << 4);
out[oi++] = byte;
}
}
return out;
}