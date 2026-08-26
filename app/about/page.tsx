import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";

export const metadata: Metadata = {
  title: "About LowDoc — Private File Tools Built for Your Browser",
  description:
    "Why LowDoc exists: a fidelity-first, local-first file converter that runs in your browser. No accounts, no database, no mandatory uploads.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SiteShell
      title="About LowDoc"
      subtitle="Private file tools. Built for your browser."
    >
      <Section heading="What LowDoc is">
        <p>
          LowDoc is a universal file transformation toolkit: convert, resize, compress,
          preview, and inspect documents, spreadsheets, presentations, images, and PDFs.
          It is built around one promise — <strong>transform your files without losing
          what matters</strong>.
        </p>
      </Section>

      <Section heading="Why it exists">
        <p>
          Most converters compete on the number of formats they claim to support.
          LowDoc competes on fidelity: we care what your file looks like after
          conversion. Layout, page size, orientation, fonts, tables, images — preserved
          whenever technically possible, and honestly flagged when not.
        </p>
      </Section>

      <Section heading="How it works">
        <p>
          Conversions run directly in your browser using WebAssembly engines: Pandoc
          for text and markup formats, ImageMagick for images, SheetJS for
          spreadsheets, pdf.js for PDF rendering and text extraction. Your files stay
          on your device.
        </p>
        <p>
          Office-family formats (DOC, DOCX, ODT, PPTX and similar) need a full layout
          engine, so those conversions use an optional self-hosted helper running
          LibreOffice. When the helper is not available, those routes are clearly
          marked as unavailable — we never pretend a conversion is local when it is
          not. Every conversion path in the interface is labeled{" "}
          <em>100% local</em> or <em>server-assisted</em>.
        </p>
      </Section>

      <Section heading="Principles">
        <ul className="list-disc pl-5 space-y-1">
          <li>Fidelity first — preserve the source whenever technically possible.</li>
          <li>Honest compatibility — unreliable conversions are never presented as reliable.</li>
          <li>Privacy by architecture — no accounts, no database, no cloud storage.</li>
          <li>Free core utility — no artificial conversion limits.</li>
        </ul>
      </Section>

      <Section heading="Limitations">
        <ul className="list-disc pl-5 space-y-1">
          <li>PDF → DOCX is structural reconstruction; complex layouts may shift.</li>
          <li>PDF pages rendered to images lose selectable text.</li>
          <li>HEIC/HEIF is not supported by the in-browser image engine.</li>
          <li>Office formats require the optional self-hosted helper.</li>
        </ul>
      </Section>

      <Section heading="Technology">
        <p>
          Next.js + React + TypeScript on the frontend; Pandoc, ImageMagick, pdf.js,
          SheetJS, Mammoth and pdf-lib compiled to WebAssembly in the browser;
          LibreOffice as an optional self-hosted conversion helper. No database, no
          authentication, no cloud file storage — by design, not by policy.
        </p>
      </Section>
    </SiteShell>
  );
}
