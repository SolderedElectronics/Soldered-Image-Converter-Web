import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Board,
  BoardsFile,
  ConvertRequest,
  ConvertResult,
  ResizeMode,
} from "../core/types";

import { HeaderBar } from "./components/HeaderBar";
import { StartScreen } from "./components/StartScreen";
import { EditorScreen } from "./components/EditorScreen";
import { writeCArray } from "../core/writers/carray";
import { downloadBlob } from "../lib/util";
import type { DitherUI } from "./components/Controls";
import { Footer } from "./components/Footer";

const worker = new Worker(
  new URL("../workers/converter.worker.ts", import.meta.url),
  { type: "module" }
);

type Item = {
  file: File;
  name: string;
  draftName: string;
  bitmap: ImageBitmap | null;
  preview: ImageData | null;
  buffer: Uint8Array | null;
  meta: ConvertResult["meta"] | null;

  threshold: number;
  dither: DitherUI;
  invert: boolean;

  boardIdx: number;
  modeId: string;
  resizeMode: ResizeMode;
  customWidth: number | null;
  customHeight: number | null;
};

export default function App() {
  const [mainStackIndex, setMainStackIndex] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [busy, setBusy] = useState(false);

  const renderToken = useRef(0);
  const convertingRef = useRef(false);
  const queuedLabelRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const [boards, setBoards] = useState<Board[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [current, setCurrent] = useState(0);
  const [constrain, setConstrain] = useState(false);

  // NEW: global defaults while there are no items (used by Start screen)
  const [defaultBoardIdx, setDefaultBoardIdx] = useState(0);
  const [defaultModeId, setDefaultModeId] = useState<string>("");
  const [defaultResize, setDefaultResize] = useState<ResizeMode>("fit");

  const itemsRef = useRef(items);
  const currentRef = useRef(current);
  const boardsRef = useRef(boards);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);
  useEffect(() => {
    boardsRef.current = boards;
  }, [boards]);

  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.BASE_URL || "/";
        const resp = await fetch(`${base}boards.json`, { cache: "no-cache" });
        if (!resp.ok) throw new Error(`Failed to load boards.json (${resp.status})`);
      
        const j: BoardsFile = await resp.json();
        setBoards(j.boards);
      
        // init global defaults from first board
        const b0 = j.boards?.[0];
        if (b0) {
          setDefaultBoardIdx(0);
          setDefaultModeId(b0.modes?.[0]?.id ?? "");
          setDefaultResize((b0.ui_defaults?.resize ?? "fit") as ResizeMode);
        }
      } catch (err) {
        console.error("Error loading boards.json:", err);
        setBoards([]);
      }
    })();
  }, []);


  function setItemsAndRef(next: Item[]) {
    itemsRef.current = next;
    setItems(next);
  }

  function patchCurrentItem(patch: Partial<Item>) {
    setItems(prev => {
      const idx = currentRef.current;
      if (idx < 0 || idx >= prev.length) return prev;
      const next = [...prev];
      next[idx] = { ...prev[idx], ...patch };
      itemsRef.current = next;
      return next;
    });
  }

  function scheduleConvert(label: string) {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    debounceTimerRef.current = window.setTimeout(() => {
      if (convertingRef.current) {
        queuedLabelRef.current = label;
        setStatusText(label + " (queued)");
      } else {
        void convert(label);
      }
    }, 30);
  }

  async function convert(label: string = "Converting…") {
    convertingRef.current = true;
    try {
      const _boards = boardsRef.current;
      const _items = itemsRef.current;
      const _current = currentRef.current;

      if (!_items.length || !_boards.length) return;

      const it = _items[_current];
      if (!it?.bitmap) return;

      const board = _boards[it.boardIdx];
      if (!board) return;

      const mode = board.modes.find(m => m.id === it.modeId);
      if (!mode) return;

      const baseW = board.display_width ?? 0;
      const baseH = board.display_height ?? 0;
      const tW = (it.customWidth ?? null) ?? baseW;
      const tH = (it.customHeight ?? null) ?? baseH;

      const token = ++renderToken.current;

      setBusy(true);
      setStatusText(label);

      const req: ConvertRequest = {
        imageBitmap: it.bitmap,
        targetW: tW,
        targetH: tH,
        params: {
          threshold: it.threshold,
          invert: it.invert,
          resize: it.resizeMode,
          modeId: it.modeId,
          dither: it.dither,
          imageName: it.name,
        },
        mode,
      } as any;

      const result: ConvertResult = await new Promise(res => {
        const handler = (ev: MessageEvent<ConvertResult>) => {
          worker.removeEventListener("message", handler);
          if (token < renderToken.current) return;
          res(ev.data);
        };
        worker.addEventListener("message", handler);
        worker.postMessage(req);
      });

      if (token < renderToken.current) return;

      setItems(prev =>
        prev.map((x, i) =>
          i === _current
            ? { ...x, preview: result.preview, buffer: result.buffer, meta: result.meta }
            : x
        )
      );
      setStatusText("Converted.");
    } finally {
      setBusy(false);
      convertingRef.current = false;
      if (queuedLabelRef.current) {
        const lbl = queuedLabelRef.current;
        queuedLabelRef.current = null;
        void convert(lbl);
      }
    }
  }

  useEffect(() => {
    const it = items[currentRef.current];
    if (it && it.bitmap && !it.buffer) {
      scheduleConvert("Converting…");
    }
  }, [current]);

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const list = Array.from(files).slice(0, 10);

    setStatusText("Loading images…");
    setBusy(true);

    // Use per-image template if exists, otherwise use global defaults (from Start screen)
    const template = itemsRef.current[currentRef.current];
    const boardForDefaults =
      boardsRef.current[template?.boardIdx ?? defaultBoardIdx];

    const resolvedBoardIdx = template?.boardIdx ?? defaultBoardIdx;
    const resolvedModeId =
      template?.modeId ??
      (boardForDefaults?.modes?.[0]?.id ?? defaultModeId);
    const resolvedResize: ResizeMode =
      (template?.resizeMode ??
        (boardForDefaults?.ui_defaults?.resize ?? defaultResize)) as ResizeMode;

    const newItems: Item[] = [];
    for (const f of list) {
      const bmp = await createImageBitmap(f);
      const sanitized = sanitizeCName(stripExt(f.name));
      newItems.push({
        file: f,
        name: sanitized,
        draftName: sanitized,
        bitmap: bmp,
        preview: null,
        buffer: null,
        meta: null,

        threshold: template?.threshold ?? 128,
        dither: template?.dither ?? "none",
        invert: template?.invert ?? false,

        boardIdx: resolvedBoardIdx,
        modeId: resolvedModeId,
        resizeMode: resolvedResize,
        customWidth: template?.customWidth ?? null,
        customHeight: template?.customHeight ?? null,
      });
    }

    setItemsAndRef(newItems);
    setCurrent(0);
    currentRef.current = 0;
    setMainStackIndex(1);

    await convert("Converting…");
  }

  async function onApplySize() {
    await convert("Resizing…");
  }

  function saveHeader(it: Item) {
    if (!it.buffer || !it.meta) return;
    const base = it.name || `image_${Date.now()}`;
    const storedBpp = it.meta.bpp === 3 ? 4 : it.meta.bpp;
    const blob = writeCArray(base, it.buffer, it.meta.width, it.meta.height, storedBpp);
    downloadBlob(blob, `${base}.h`);
    setStatusText("Saved header!");
  }

  function onSaveAll() {
    items.forEach(it => (it.buffer && it.meta ? saveHeader(it) : null));
  }

  function onReset() {
    setItemsAndRef([]);
    setCurrent(0);
    currentRef.current = 0;
    setMainStackIndex(0);
    setBusy(false);
    renderToken.current += 1;
    setStatusText("Reset done. Ready.");
  }

  const it = items[current];
  const board = boards[it?.boardIdx ?? defaultBoardIdx] || boards[0];
  const modes = board?.modes ?? [];
  const baseW = board?.display_width ?? 0;
  const baseH = board?.display_height ?? 0;

  const codeText = useMemo(() => {
    if (!it?.buffer || !it?.meta) return "";
    const storedBpp = it.meta.bpp === 3 ? 4 : it.meta.bpp;
    return cArrayString(it.name, it.buffer, it.meta.width, it.meta.height, storedBpp);
  }, [it?.buffer, it?.meta, it?.name]);

  function onCopy() {
    if (!codeText) return;
    navigator.clipboard?.writeText(codeText).then(() => {
      setStatusText("Copied to clipboard!");
    });
  }

  function handleBoardChange(newBoardIdx: number) {
    if (itemsRef.current.length === 0) {
      // Start screen: change global defaults (so first upload uses this)
      const brd = boardsRef.current[newBoardIdx];
      setDefaultBoardIdx(newBoardIdx);
      setDefaultModeId(brd?.modes?.[0]?.id ?? "");
      setDefaultResize((brd?.ui_defaults?.resize ?? "fit") as ResizeMode);
      setStatusText(`Default board set: ${brd?.board ?? ""}`);
      return;
    }

    // Editor screen: patch current item
    const brd = boardsRef.current[newBoardIdx];
    const firstModeId = brd?.modes?.[0]?.id ?? it?.modeId ?? "";
    patchCurrentItem({
      boardIdx: newBoardIdx,
      modeId: firstModeId,
      customWidth: null,
      customHeight: null,
      dither: ((brd?.modes?.[0] as any)?.defaults?.dither ?? it?.dither) as DitherUI,
    });
    scheduleConvert("Changing board…");
  }

  function onCustomWidthChange(n: number | null) {
    const next: Partial<Item> = { customWidth: n };
    if (constrain && n && baseW && baseH) {
      next.customHeight = Math.round(n * (baseH / baseW));
    }
    patchCurrentItem(next);
  }

  // NAV: Prev/Next
  function goPrev() {
    setCurrent(i => Math.max(0, i - 1));
  }
  function goNext() {
    setCurrent(i => Math.min(itemsRef.current.length - 1, i + 1));
  }

  const controlsProps = it
    ? {
        modes,
        selectedModeId: it.modeId,
        onModeChange: (id: string) => {
          const m = modes.find(mm => mm.id === id) as any;
          patchCurrentItem({
            modeId: id,
            dither: (m?.defaults?.dither ?? it.dither) as DitherUI,
          });
          scheduleConvert("Changing mode…");
        },

        imageName: it.draftName,
        onImageName: (s: string) =>
          patchCurrentItem({ draftName: sanitizeCName(s) }),
        onSetImageName: () => {
          patchCurrentItem({ name: itemsRef.current[currentRef.current].draftName });
          scheduleConvert("Renaming…");
        },

        threshold: it.threshold,
        onThresholdChange: (n: number) => patchCurrentItem({ threshold: n }),
        onThresholdCommit: () => scheduleConvert("Updating threshold…"),

        dither: it.dither,
        onDither: (d: DitherUI) => {
          patchCurrentItem({ dither: d });
          scheduleConvert("Applying dither…");
        },

        invert: it.invert,
        onInvert: (b: boolean) => {
          patchCurrentItem({ invert: b });
          scheduleConvert("Inverting…");
        },

        resize: it.resizeMode,
        onResize: (m: ResizeMode) => {
          patchCurrentItem({ resizeMode: m });
          scheduleConvert("Resizing…");
        },

        constrain,
        onConstrain: (b: boolean) => setConstrain(b),

        baseWidth: baseW,
        baseHeight: baseH,
        customWidth: it.customWidth,
        onCustomWidth: onCustomWidthChange,
        customHeight: it.customHeight,
        onCustomHeight: (n: number | null) => patchCurrentItem({ customHeight: n }),

        onApplySize: onApplySize,
        onConvert: () => scheduleConvert("Converting…"),
      }
    : {
        modes: [],
        selectedModeId: "",
        onModeChange: (_: string) => {},
        imageName: "",
        onImageName: (_: string) => {},
        onSetImageName: () => {},
        threshold: 128,
        onThresholdChange: (_: number) => {},
        onThresholdCommit: () => {},
        dither: "none" as DitherUI,
        onDither: (_: DitherUI) => {},
        invert: false,
        onInvert: (_: boolean) => {},
        resize: "fit" as ResizeMode,
        onResize: (_: ResizeMode) => {},
        constrain,
        onConstrain: setConstrain,
        baseWidth: 0,
        baseHeight: 0,
        customWidth: null,
        onCustomWidth: (_: number | null) => {},
        customHeight: null,
        onCustomHeight: (_: number | null) => {},
        onApplySize: () => {},
        onConvert: () => {},
      };

  // Header select shows current item's board if items exist, otherwise global default
  const selectedBoardIdxForHeader =
    items.length > 0 ? (it?.boardIdx ?? 0) : defaultBoardIdx;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderBar
        logoSrc="/img/logo.png"
        boards={boards}
        selectedBoardIdx={selectedBoardIdxForHeader}
        onBoardChange={handleBoardChange}
        statusText={statusText}
      />

      {mainStackIndex === 0 ? (
        <StartScreen onFiles={onFiles} />
      ) : (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-3">
          <EditorScreen
            preview={it?.preview ?? null}
            controlsProps={controlsProps}
            codeText={codeText}
            onCopy={onCopy}
            onSaveHeader={() => it && saveHeader(it)}
            onSaveAll={onSaveAll}
            onReset={onReset}
            itemsCount={items.length}
            currentIndex={current}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ---------------- helpers ---------------- */

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}
function sanitizeCName(s: string) {
  let t = s.replace(/[^A-Za-z0-9_]/g, "_");
  if (!/^[A-Za-z_]/.test(t)) t = "_" + t;
  return t || "image";
}

function cArrayString(
  name: string,
  data: Uint8Array,
  w: number,
  h: number,
  bpp: number
): string {
  const hex = Array.from(data).map(
    v => `0x${v.toString(16).toUpperCase().padStart(2, "0")}`
  );
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += 16)
    lines.push("  " + hex.slice(i, i + 16).join(", "));
  return [
    `const uint8_t ${name}[] PROGMEM = {`,
    lines.join(",\n"),
    `};`,
    `const uint16_t ${name}_w = ${w};`,
    `const uint16_t ${name}_h = ${h};`,
  ].join("\n");
}
