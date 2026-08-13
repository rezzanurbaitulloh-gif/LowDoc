declare module "pandoc-wasm" {
  export interface PandocWasmResult {
    stdout: string;
    stderr: string;
    warnings: unknown[];
    files: Record<string, string | Blob>;
    mediaFiles: Record<string, string | Blob>;
  }

  export function convert(
    options: Record<string, unknown>,
    stdin: string | null,
    files: Record<string, string | Blob>,
  ): Promise<PandocWasmResult>;

  export function query(pandoc: WebAssembly.Module, query: unknown): Promise<unknown>;
  export function pandoc(pandoc: WebAssembly.Module): unknown;
}
