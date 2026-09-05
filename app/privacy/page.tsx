import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — LowDoc Processes Files on Your Device",
  description:
    "How LowDoc handles your data: no accounts, no database, local in-browser processing, an optional self-hosted office helper, and zero document telemetry.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SiteShell title="Privacy Policy" subtitle="Every statement here matches how the product actually works.">
      <Section heading="No account, no database">
        <p>
          LowDoc has no user accounts and no server-side database. There is nothing to
          sign up for and nothing that profiles you. We do not run advertising or
          third-party analytics.
        </p>
      </Section>

      <Section heading="Where your files are processed">
        <p>
          Most conversions — text and markup formats, images, spreadsheets, PDF
          rendering and extraction — run entirely inside your browser using
          WebAssembly. Those files never leave your device.
        </p>
        <p>
          Office-family formats (DOC, DOCX, ODT, PPTX and similar) require a full
          layout engine. Those conversions are sent to an optional helper server that
          the operator of this deployment hosts themselves, running LibreOffice. Files
          sent to the helper are processed for the single conversion and are not
          stored, logged, or shared with any third party. When the helper is
          unavailable, those conversions are shown as unavailable — files are never
          silently sent elsewhere.
        </p>
        <p>
          Every conversion path is labeled in the interface as{" "}
          <strong>100% local</strong> or <strong>server-assisted</strong> before you
          run it.
        </p>
      </Section>

      <Section heading="What stays in your browser">
        <p>
          Optional local history stores conversion metadata only — filename, input and
          output sizes, engine, and timestamp — in your browser's IndexedDB. It never
          leaves your device, never syncs, and can be cleared at any time. Your theme
          preference (light/dark) is stored in localStorage. Cached engines and app
          files are stored by the service worker so the app can work offline.
        </p>
      </Section>

      <Section heading="What we never collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Filenames or document contents</li>
          <li>Extracted text or document metadata</li>
          <li>Conversion payloads or usage telemetry</li>
        </ul>
        <p>
          There is no document analytics of any kind. If anonymous application
          telemetry is ever added, this page will be updated first.
        </p>
      </Section>

      <Section heading="External services">
        <p>
          Interface typefaces (Fraunces, Archivo, IBM Plex Mono) ship with the
          app itself — no font CDN or other third party is contacted. Donations, if you
          choose to make one, are handled by the external donation provider linked on
          the support page; LowDoc never receives documents through it.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          This policy is version-controlled with the source code. If the architecture
          ever changes how files are processed, this page changes with it.
        </p>
      </Section>
    </SiteShell>
  );
}
