export function writeCArray(
  name: string,
  buf: Uint8Array,
  w: number,
  h: number,
  bitsPerPixel = 1,
  wrap = 16
): Blob {
  const bytesPerRow =
    bitsPerPixel === 1 ? Math.ceil(w / 8) :
    bitsPerPixel === 2 ? Math.ceil(w / 4) :
    bitsPerPixel === 3 ? Math.ceil((w * 3) / 8) :
    bitsPerPixel === 4 ? Math.ceil(w / 2) :
    Math.ceil((w * bitsPerPixel) / 8);

  const expectedLen = bytesPerRow * h;

  let data = buf;
  if (buf.length !== expectedLen) {
    const fixed = new Uint8Array(expectedLen);
    fixed.set(buf.subarray(0, Math.min(buf.length, expectedLen)));
    data = fixed;
  }

  const hexLines: string[] = [];
  for (let i = 0; i < data.length; i += wrap) {
    const slice = data.subarray(i, Math.min(i + wrap, data.length));
    hexLines.push(
      "  " +
        Array.from(
          slice,
          b => "0x" + b.toString(16).toUpperCase().padStart(2, "0")
        ).join(", ")
    );
  }

  const hexBlock = hexLines.join(",\n");

  const header =
`// ${bitsPerPixel} BPP image
// size: ${w}x${h}px, bytesPerRow: ${bytesPerRow}, total bytes: ${data.length}
#include <stdint.h>

const uint8_t ${name}[${data.length}] PROGMEM = {
${hexBlock}
};

const uint16_t ${name}_w = ${w};
const uint16_t ${name}_h = ${h};
`;

  return new Blob([header], { type: "text/plain" });
}
