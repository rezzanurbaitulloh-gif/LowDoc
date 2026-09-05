import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";

export const metadata: Metadata = {
  title: "LowDoc FAQ — Local Conversion, Paper Sizes, Fidelity",
  description:
    "Answers about LowDoc: is it free, do files get uploaded, why formatting changes, PDF to DOCX difficulty, paper sizes like A4 and F4, and browser support.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "What is LowDoc?",
    a: "A browser-based file toolkit: convert, resize, compress, preview and inspect documents, spreadsheets, presentations, images and PDFs — with fidelity to the original as the top priority.",
  },
  {
    q: "Is LowDoc free?",
    a: "Yes. Core functionality is free with no artificial conversion limits and no account required.",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up, no login, and no email required anywhere in the product.",
  },
  {
    q: "Does LowDoc upload my files?",
    a: "Most conversions run entirely in your browser via WebAssembly — those files never leave your device. Only legacy office formats (DOC, ODT, PPT and similar) require a full layout engine and are sent to an optional self-hosted helper running LibreOffice — and only when such a helper is available. Every conversion path is labeled “100% local” or “server-assisted” before you convert.",
  },
  {
    q: "Are my files stored anywhere?",
    a: "No. There is no database and no cloud storage. Your conversion history, if enabled, is metadata only (filename, sizes, engine, timestamp) stored locally in your browser's IndexedDB and clearable at any time.",
  },
  {
    q: "Why did my formatting change after conversion?",
    a: "Some conversions cannot preserve everything. For example, PDF pages rendered to images lose selectable text, and PDF → DOCX is a structural reconstruction rather than an exact copy. LowDoc labels each conversion path with a fidelity level — High Fidelity, Supported, Limited, or Experimental — so you know what to expect before converting.",
  },
  {
    q: "Why is PDF → DOCX difficult?",
    a: "A PDF stores drawing instructions, not document structure. Rebuilding a DOCX means detecting text blocks, fonts, tables, images and reading order, then reconstructing paragraphs. Simple documents convert well; complex multi-column layouts may shift.",
  },
  {
    q: "What does “Limited” fidelity mean?",
    a: "The conversion works, but some information will change — for example only the text layer survives, or pages become images. The label is shown before conversion so there are no surprises.",
  },
  {
    q: "What happens when a font is missing?",
    a: "A similar available font is substituted. Layout may differ slightly, especially around line breaks and table widths. The output always names the fonts it could not match exactly when detection is possible.",
  },
  {
    q: "What is A4? What is F4?",
    a: "A4 (210 × 297 mm) is the international standard paper size. F4 (210 × 330 mm) is a regional size commonly used for legal and official documents in Indonesia and some other countries — it is A4 width but taller.",
  },
  {
    q: "Can I convert A4 to F4?",
    a: "Yes. Choose PDF output and pick the paper size before converting. LowDoc rewrites the page geometry in the document so the saved file genuinely uses the selected size — the preview is not cosmetic.",
  },
  {
    q: "Can I use custom paper sizes?",
    a: "Yes. Open the paper selector, search by name or dimensions (for example “210x330” or “8.27x11.69”), or enter a custom width and height in millimetres.",
  },
  {
    q: "Which browsers are supported?",
    a: "Current versions of Chrome, Edge, Firefox and Safari, including Android Chrome and iOS Safari. Features degrade gracefully — the diagnostics panel shows what your browser supports.",
  },
  {
    q: "Does LowDoc work offline?",
    a: "The interface and conversion engines are cached for offline use as a Progressive Web App. Local conversions work offline; the server-assisted office helper obviously needs your helper server to be reachable.",
  },
  {
    q: "Why is a conversion slow?",
    a: "Everything runs on your device, so speed depends on your hardware. Large documents, image-heavy PDFs and first-time engine downloads (WebAssembly is cached after first use) are the usual causes.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <SiteShell title="Frequently Asked Questions" subtitle="Short, honest answers about how LowDoc works.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Section heading="General">
        <dl className="space-y-5">
          {FAQS.slice(0, 4).map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </dl>
      </Section>
      <Section heading="Privacy">
        <dl className="space-y-5">
          <FaqItem q={FAQS[4].q} a={FAQS[4].a} />
        </dl>
      </Section>
      <Section heading="Conversion & fidelity">
        <dl className="space-y-5">
          {FAQS.slice(5, 8).map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </dl>
      </Section>
      <Section heading="Paper sizes">
        <dl className="space-y-5">
          {FAQS.slice(8, 11).map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </dl>
      </Section>
      <Section heading="Technical">
        <dl className="space-y-5">
          {FAQS.slice(11).map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </dl>
      </Section>
    </SiteShell>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="font-semibold text-[var(--ld-text)]">{q}</dt>
      <dd className="mt-1">{a}</dd>
    </div>
  );
}
