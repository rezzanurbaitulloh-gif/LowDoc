# LowDoc — Rencana Kerja (Work Plan)

**Proyek:** Konverter universal dokumen (semua format → semua format, 37 target, 1592 pasangan ter-routing).
**Lokasi:** `/home/reja/lowdoc` — Next.js 14 (App Router), WASM engines client-side + LibreOffice server route, PWA offline.

## Tujuan

1. **Perbaikan fungsi** — semua alur konversi berjalan benar tanpa jalur yang gagal/skip diam-diam.
2. **Redesain visual** — tema "universal document converter" dengan Bento Grid, palet & tipografi dari skill `ui-ux-pro-max`.
3. **Verifikasi** — build hijau, server 3004 hidup, API & routing teruji.

---

## Phase 1 — Audit & Perbaikan Fungsi Konversi

| # | Temuan / Pekerjaan | Detail |
|---|--------------------|--------|
| 1.1 | **BUG: `runBatch` tidak pakai multi-hop router** | `engines.ts:569` `runBatch` hanya pakai `pickEngine` (edge langsung). File yang butuh multi-hop (mis. `docx→xlsx` via txt→csv→xlsx) di-skip dengan pesan "unsupported" meski jalur ada. **Fix:** batch memakai `findPath` per file seperti `runConversion`. |
| 1.2 | Verifikasi `runConversion` vs matrix baru | Pastikan `pickEngine` hanya dipakai untuk edge langsung & `findPath` menangani sisanya; pastikan hop engine = office dikirim dengan nama file ber-ekstensi benar. |
| 1.3 | `officeAvailable` di page | Saat ini set `"probed"` bukan versi asli; ambil versi dari health response. |
| 1.4 | Alias ekstensi input | `jpeg` sudah ada; pastikan `jpeg` juga terdaftar di matrix register (MAGICK_PAIRS punya `jpeg` ✓), cek `formats.ts` punya semua ekstensi yang dipakai matrix. |
| 1.5 | Toolkit PDF (merge/split/compress) | Uji `parseRanges` (split) — validasi input tidak valid → error task yang jelas, bukan hang. |
| 1.6 | Preview | Sudah OK (pdf/page, image, docx/xlsx/pptx/odt/ods/odp text) — uji 1x end-to-end setelah rebuild. |
| 1.7 | Console & task state | Pastikan `runBatch` menangani error per-file (task error, tidak menghentikan batch). |

## Phase 2 — Redesain Visual (ui-ux-pro-max)

**Design system (hasil skill):**

- **Style:** Flat Design — 2D, clean, typography-first, icon-heavy. Light + Dark mode.
- **Palet:** Primary `#2563EB`, Accent amber `#D97706`, Background `#F8FAFC` (light) / `#0F172A` (dark), Card `#FFFFFF` / `#1E293B`, Foreground `#0F172A`, Muted `#475569`, Border `#E4ECFC` / `#334155`, Destructive `#DC2626`.
- **Tipografi:** Inter (300–700) heading+body; JetBrains Mono untuk label teknis/console (sudah dipakai).
- **Layout: Bento Grid** — grid 4→2→1 kolom responsif, kartu span bervariasi (1×1, 2×1, 2×2), `border-radius 16–24px`, shadow halus, hover scale 1.02, gap 16px.

**Komposisi bento (halaman utama):**

```
┌────────────────────────────────────────────────────┐
│ Header (spans 4) — brand, status LibreOffice, PWA  │
├───────────────┬────────────────────────────────────┤
│ Mode tabs     │ 100% offline · no uploads badge    │
├───────────────┴───────────────┬────────────────────┤
│ Dropzone / Hero (spans 2×2)   │ Output format      │
│                               │ (spans 1×1)        │
│                               ├────────────────────┤
│                               │ Input formats      │
│                               │ (spans 1×1)        │
├───────────────┬───────────────┴────────────────────┤
│ Convert queue │ Console log (spans 2×1)            │
│ (spans 2×1)   │                                    │
└───────────────┴────────────────────────────────────┘
```

| # | Pekerjaan | Detail |
|---|-----------|--------|
| 2.1 | Token desain di `lowdoc.css` | Palet baru sesuai design system; dua mode (light/dark) via `prefers-color-scheme` + toggle; kurangi border hitam pekat → border halus + shadow lembut; radius 16–24px; transisi 150–200ms. |
| 2.2 | `page.tsx` → bento grid | Restrukturisasi: hero dropzone kartu besar, panel format (output/input), queue, console, toolkit hasil — semua jadi kartu bento dengan span bervariasi. |
| 2.3 | Komponen kartu bento | `BentoCard` wrapper (atau kelas CSS) — background card, radius, hover 1.02, aksesibilitas focus. |
| 2.4 | Header & footer | Brand LowDoc + ikon, status engine (LibreOffice / WASM), badge offline; footer ringkas. |
| 2.5 | Chip format | Tampilkan label format lebih readable (bukan mono kecil semua), kategori dengan warna aksen per kelompok. |
| 2.6 | Mode tab & dropzone | Tab mode jadi segmented control; dropzone visual lebih inviting (ikon upload besar, daftar format didukung). |
| 2.7 | Aksesibilitas | Focus visible, aria-label ikon-only button, contrast ≥4.5:1, `prefers-reduced-motion`, touch target ≥44px. |
| 2.8 | Persist design system | Jalankan `--persist` skill agar `design-system/` tersimpan di repo untuk sesi berikutnya. |

## Phase 3 — Build & Verifikasi

| # | Pekerjaan | Detail |
|---|-----------|--------|
| 3.1 | `next build` | Detached build, poll `/tmp/opencode/build.log` sampai `BUILD_EXIT:0`. |
| 3.2 | Restart server | `next start -p 3004`; cek page 200, manifest 200, health office ok. |
| 3.3 | Uji routing multi-hop live | POST office txt→pdf, pdf→docx (infilter), docx→png, pptx→svg; jalankan matriks completeness (`node /tmp/opencode/check-matrix.ts`) — 0 fail. |
| 3.4 | Uji batch | Verifikasi `runBatch` tidak skip file multi-hop (via console saat user convert). |
| 3.5 | Uji desain | Responsive 375px / 768px / 1024px / 1440px, dark & light mode, reduced-motion. |

## Kriteria Selesai (Done)

- Semua pasangan konversi (1592) dapat dieksekusi — tidak ada skip diam-diam di batch.
- Halaman tampil dalam Bento Grid dengan palet/tipografi design system ui-ux-pro-max; dark+light mode jalan.
- Build `BUILD_EXIT:0`, server 3004 hidup, semua endpoint & konversi sampel 200.