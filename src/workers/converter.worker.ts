/// <reference lib="webworker" />
import { runPipeline } from "../core/pipeline";
import type { ConvertRequest, ConvertResult } from "../core/types";

self.onmessage = async (ev: MessageEvent) => {
  const req = ev.data as ConvertRequest;

  try {
    const result: ConvertResult = await runPipeline(req);

    const transfers: Transferable[] = [];
    if (result.buffer?.buffer) {
      transfers.push(result.buffer.buffer as ArrayBuffer);
    }
    if (
      result.preview?.data?.buffer &&
      result.preview.data.buffer !== (result.buffer as any)?.buffer
    ) {
      transfers.push(result.preview.data.buffer as ArrayBuffer);
    }

    (self as DedicatedWorkerGlobalScope).postMessage(result, transfers);
  } catch (e: any) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      error: e?.message ?? String(e),
    });
  }
};

export {};
