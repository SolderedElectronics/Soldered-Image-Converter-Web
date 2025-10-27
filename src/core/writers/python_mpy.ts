export function writePythonInkplateModule(
  name: string,
  buf: Uint8Array,
  w: number,
  h: number,
  wrap = 16,
  addHelper = true
): Blob {
  const hex = Array.from(buf).map(v => `0x${v.toString(16).toUpperCase().padStart(2, "0")}`);
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += wrap) {
    lines.push("    " + hex.slice(i, i + wrap).join(", "));
  }
  const bytesLen = buf.length;
  const helper = addHelper ? `

def draw_${name}(ink, x=0, y=0, invert=False):
    data = ${name} if not invert else bytes((b ^ 0xFF) for b in ${name})
    ink.drawBitmap(x, y, data, ${name}_W, ${name}_H)
` : "";

  const module = `# Auto-generated from Soldered Image Converter
${name}_W = ${w}
${name}_H = ${h}
${name} = bytes([
${lines.join(",\n")}
])
${helper}`;

  return new Blob([module], { type: "text/x-python" });
}
