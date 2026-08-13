# LOWDOC

**Universal Privacy-First Document Converter** — PWA 100% offline, zero database. Semua file diproses secara ephemeral di browser via WebAssembly. Data terhapus total saat tab ditutup.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4**
- **PWA**: `app/manifest.ts` + `public/sw.js` custom (Next 16 menggunakan Turbopack sehingga plugin webpack `next-pwa` tidak dipakai — service worker ditulis manual, deterministik, tanpa bundler dependency)
- **Zero-DB**: IndexedDB via `idb` (`lib/db.ts`) — history lokal (max 50 entri) + blob output ephemeral (expire 1 jam) + prefs
- **Client WASM engines**:
  - `pdf-lib` → PDF parse/re-serialize (`lib/engines/pdf.ts`)
  - `@imagemagick/magick-wasm` → image/vector + PDF rasterize (Ghostscript delegate) (`lib/engines/image.ts`), wasm dicopy ke `public/wasm-magick.wasm`
  - `pandoc-wasm` → markup/ebook/text, lazy-load adapter (`lib/engines/pandoc.ts`)
  - `native` → CSV/TSV/JSON dalam browser (`lib/engines/native.ts`)
  - `libreoffice` / `serverless` → fallback untuk format lama (WPD, DWG, PAGES, dll) — di-route pipeline, siap di-hubungkan ke ephemeral runner

## Struktur

```
app/
  layout.tsx            # font Inter + JetBrains Mono, metadata PWA
  page.tsx              # asembli: header, dropzone, control bar, queue, console, history
  manifest.ts           # /manifest.webmanifest
  globals.css           # industrial theme (Tailwind v4 @theme)
components/
  header.tsx            # logo, badge offline/private, status SW, export all
  dropzone.tsx          # hero drag & drop batch, validasi ekstensi
  control-bar.tsx       # filter kategori + search FROM + search TO + grid badge monospace
  queue.tsx             # antrian konversi multi-file, pilih TO, convert/download
  console-log.tsx       # real-time WASM console + IndexedDB status
  history-panel.tsx     # riwayat lokal IndexedDB, re-download, purge
  pwa-installer.tsx     # beforeinstallprompt + register /sw.js
lib/
  formats.ts            # katalog ~80 format × kategori × engine
  types.ts              # tipe bersama (Job, Log, Format)
  db.ts                 # IndexedDB (idb): history, blobs, prefs
  pipeline.ts           # dispatcher client WASM + serverless fallback
  engines/{pdf,image,pandoc,native}.ts
public/
  sw.js                 # service worker: precache shell, cache-first wasm, network-first nav
  wasm-magick.wasm      # engine ImageMagick (~14MB)
  icons/                # icon PWA (generated)
```

## Development

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint
```

## Arsitektur Konversi

```
File drop → Dropzone (validasi ext) → Queue (pilih .to)
  → pipeline.runJob() — UNIVERSAL HUB ROUTER
      READ (apa pun → markdown / rows):
        pandoc-wasm   docx odt html md rst tex rtf txt epub fb2 pptx
        pdf.js        pdf
        sheetjs       xlsx xls xlsm xlsb ods csv tsv json xml
        tesseract-ocr gambar/scan
      WRITE (markdown / rows → apa pun):
        pandoc-wasm   docx odt html epub fb2 pptx rtf txt md rst tex
        jspdf         pdf
        sheetjs       xlsx xls xlsm xlsb ods csv tsv json xml
        magick-wasm   gambar ↔ gambar · gambar→pdf · pdf→gambar
        pdf-lib       pdf → pdf (normalisasi)
      Serverless fallback: doc ppt pages numbers key dwg dxf vsd indd djvu…
  → output blob → IndexedDB (ephemeral 1h) → HistoryPanel re-download
```

Contoh route yang kini jalan: `pdf→docx` (pdf.js→pandoc), `xlsx→pdf` (sheetjs→jspdf),
`png→docx` (OCR→pandoc), `docx→xlsx` (pandoc→tabel→sheetjs), `pdf→epub` (pdf.js→pandoc).
