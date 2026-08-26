import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";

export const metadata: Metadata = {
  title: "Open-Source Licenses — LowDoc",
  description:
    "Third-party engines and libraries used by LowDoc — Pandoc, ImageMagick, pdf.js, SheetJS, Mammoth, pdf-lib and more — with their licenses.",
  alternates: { canonical: "/licenses" },
};

const GROUPS: Array<{ heading: string; items: Array<[string, string, string]> }> = [
  {
    heading: "Conversion engines",
    items: [
      ["pandoc-wasm", "GPL-2.0-or-later", "Pandoc compiled to WebAssembly — text and markup conversion"],
      ["@imagemagick/magick-wasm", "Apache-2.0", "ImageMagick for the Web — image conversion"],
      ["pdfjs-dist", "Apache-2.0", "PDF rendering and text extraction (Mozilla pdf.js)"],
      ["pdf-lib", "MIT", "PDF creation and page manipulation"],
      ["xlsx (SheetJS)", "Apache-2.0", "Spreadsheet parsing and generation"],
      ["mammoth", "BSD-2-Clause", "DOCX → HTML semantic conversion"],
      ["dxf-parser", "MIT", "DXF (CAD) parsing"],
      ["fflate", "MIT", "Fast zip/gzip — used for DOCX paper-size patching"],
    ],
  },
  {
    heading: "Application",
    items: [
      ["Next.js", "MIT", "Application framework"],
      ["React / React DOM", "MIT", "UI runtime"],
      ["next-pwa / Workbox", "MIT", "Service worker and offline caching"],
      ["idb", "MIT", "IndexedDB wrapper for local history"],
      ["lucide-react", "ISC", "Interface icons"],
      ["Tailwind CSS", "MIT", "Utility styling"],
    ],
  },
  {
    heading: "Typefaces",
    items: [
      ["Fraunces", "OFL-1.1", "Display serif"],
      ["Archivo", "OFL-1.1", "Interface sans"],
      ["IBM Plex Mono", "OFL-1.1", "Mono for stamps, labels and console"],
    ],
  },
];

export default function LicensesPage() {
  return (
    <SiteShell
      title="Third-Party Licenses"
      subtitle="LowDoc stands on open-source engines. Their notices belong here."
    >
      {GROUPS.map((g) => (
        <Section key={g.heading} heading={g.heading}>
          <ul className="divide-y divide-[var(--ld-border)] rounded border border-[var(--ld-border)] overflow-hidden">
            {g.items.map(([name, license, note]) => (
              <li key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-[var(--ld-panel)] px-4 py-3">
                <span className="font-mono text-xs font-semibold text-[var(--ld-text)]">{name}</span>
                <span className="ld-chip !cursor-default !py-0.5">{license}</span>
                <span className="text-sm text-[var(--ld-muted)] basis-full sm:basis-auto">{note}</span>
              </li>
            ))}
          </ul>
        </Section>
      ))}
      <Section heading="Runtime note">
        <p>
          The optional office helper uses LibreOffice, governed by the Mozilla Public
          License 2.0. LibreOffice runs only on the operator's own server, never in
          your browser.
        </p>
      </Section>
    </SiteShell>
  );
}
