declare module "pandoc-wasm" {
  export interface PandocResult {
    stdout: string;
    stderr: string;
    warnings: unknown[];
    files: Record<string, Blob>;
    mediaFiles: Record<string, Blob>;
  }
  export interface PandocInstance {
    convert(
      options: Record<string, unknown>,
      stdin: string | null,
      files: Record<string, string | Blob>,
    ): Promise<PandocResult>;
    query(options: Record<string, unknown>): Promise<{
      inputFormats: string[];
      outputFormats: string[];
    }>;
    pandoc(
      args: string,
      inData: string | Blob | null,
      resources?: { filename: string; contents: string | Blob }[],
    ): Promise<{ out: string | Blob; mediaFiles: Map<string, string | Blob> }>;
  }
}

declare module "pandoc-wasm/src/core.js" {
  import type { PandocInstance } from "pandoc-wasm";
  export function createPandocInstance(
    wasmBinary: ArrayBuffer | Uint8Array,
  ): Promise<PandocInstance>;
}
