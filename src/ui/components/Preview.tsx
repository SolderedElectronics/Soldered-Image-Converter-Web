import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const REF_W = 1300;
const REF_H = 825;

export function Preview({
  imageData,
  onRendered,
}: {
  imageData: ImageData | null;
  onRendered?: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setBox({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!imageData || !canvas || box.w === 0 || box.h === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = imageData.width * dpr;
    canvas.height = imageData.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, imageData.width, imageData.height);
    ctx.putImageData(imageData, 0, 0);

    const baseScale = Math.min(box.w / REF_W, box.h / REF_H);
    const capScale = Math.min(1, REF_W / imageData.width, REF_H / imageData.height);

    const displayW = Math.floor(imageData.width * capScale * baseScale);
    const displayH = Math.floor(imageData.height * capScale * baseScale);

    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    requestAnimationFrame(() => onRendered?.());
  }, [imageData, box, onRendered]);

  if (!imageData) {
    return (
      <div
        ref={wrapperRef}
        className="w-full h-full flex items-center justify-center border rounded bg-[#F9F5FF]"
      >
        <div className="text-gray-500 text-sm">No preview.</div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full flex items-center justify-center border rounded bg-[#F9F5FF]"
    >
      <canvas ref={canvasRef} className="h-auto" />
    </div>
  );
}