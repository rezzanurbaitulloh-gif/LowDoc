/* Magic-byte format detection — never trust extensions (PRD §40). */

const SIGS: Array<{ fmt: string; test: (b: Uint8Array) => boolean }> = [
  { fmt: "pdf", test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
  { fmt: "zip", test: (b) => b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07) },
  { fmt: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { fmt: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { fmt: "gif", test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  {
    fmt: "webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    fmt: "tiff",
    test: (b) =>
      (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
      (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a),
  },
  { fmt: "bmp", test: (b) => b[0] === 0x42 && b[1] === 0x4d },
  { fmt: "ico", test: (b) => b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00 },
  {
    fmt: "heic",
    test: (b) => {
      const s = String.fromCharCode(...b.slice(4, 12));
      return s.startsWith("ftyp");
    },
  },
  {
    fmt: "dxf",
    test: (b) => {
      const head = String.fromCharCode(...b.slice(0, 64));
      return /^\s*(0\r?\nSECTION|999|\$\$DWG)/.test(head);
    },
  },
  {
    fmt: "xml",
    test: (b) => {
      const head = String.fromCharCode(...b.slice(0, 128)).trimStart();
      return head.startsWith("<?xml");
    },
  },
  {
    fmt: "html",
    test: (b) => {
      const head = String.fromCharCode(...b.slice(0, 256)).toLowerCase();
      return head.includes("<!doctype html") || head.includes("<html");
    },
  },
  {
    fmt: "json",
    test: (b) => {
      const c = String.fromCharCode(b.find((x) => x !== 0x20 && x !== 0x09 && x !== 0x0a && x !== 0x0d) ?? 0);
      return c === "{" || c === "[";
    },
  },
];

/** Formats hidden inside a ZIP container — resolved by extension, not bytes. */
export const ZIP_FAMILY = new Set([
  "docx", "docm", "dotx", "xlsx", "xlsm", "xlsb",
  "ods", "ots", "pptx", "ppsx", "odp", "otp",
  "epub", "odt",
]);

export function detectFormat(bytes: Uint8Array): string | null {
  if (!bytes || bytes.length < 12) return null;
  for (const s of SIGS) {
    try {
      if (s.test(bytes)) return s.fmt;
    } catch {
      /* keep scanning */
    }
  }
  return null;
}

export interface FormatCheck {
  ext: string;
  detected: string | null;
  /** "match" | "zip-family" (container, ext decides) | "mismatch" | "unknown" */
  verdict: "match" | "zip-family" | "mismatch" | "unknown";
}

export function checkFormat(fileName: string, bytes: Uint8Array): FormatCheck {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const detected = detectFormat(bytes);
  if (!detected) return { ext, detected: null, verdict: "unknown" };
  if (detected === "zip") {
    return ZIP_FAMILY.has(ext)
      ? { ext, detected, verdict: "zip-family" }
      : { ext, detected, verdict: "mismatch" };
  }
  const alias: Record<string, string> = { jpeg: "jpg", tif: "tiff" };
  const norm = alias[ext] ?? ext;
  return detected === norm
    ? { ext, detected, verdict: "match" }
    : { ext, detected, verdict: "mismatch" };
}
