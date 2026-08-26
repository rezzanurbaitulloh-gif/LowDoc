import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";

export const metadata: Metadata = {
  title: "Terms of Use — LowDoc",
  description:
    "The short terms for using LowDoc: the service is provided as-is, you keep ownership of your files, and third-party engines carry their own licenses.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <SiteShell title="Terms of Use" subtitle="The short, plain version.">
      <Section heading="Using LowDoc">
        <p>
          LowDoc is provided free of charge, as-is, without warranty of any kind. Use
          it for lawful purposes only. Do not use it to process content you are not
          allowed to process, and do not attempt to disrupt the service.
        </p>
      </Section>

      <Section heading="Your files">
        <p>
          You retain full ownership of everything you convert. LowDoc claims no rights
          over your content. Files processed locally never leave your device; files
          processed through the optional office helper are used only for that single
          conversion.
        </p>
      </Section>

      <Section heading="No warranty">
        <p>
          Conversion fidelity depends on the formats and engines involved. LowDoc
          labels each conversion path with an honest fidelity level, but perfect
          preservation cannot be guaranteed. Verify important documents after
          converting.
        </p>
      </Section>

      <Section heading="Third-party software">
        <p>
          LowDoc builds on open-source engines and libraries. Their respective
          licenses and notices are listed on the{" "}
          <a href="/licenses" className="text-[var(--ld-orange)] underline underline-offset-2">
            licenses page
          </a>
          .
        </p>
      </Section>

      <Section heading="Liability">
        <p>
          To the maximum extent permitted by law, the authors are not liable for any
          damages or data loss arising from use of the service. If this terms page
          ever conflicts with the software's actual behavior, the source code — which
          is public — is the source of truth.
        </p>
      </Section>
    </SiteShell>
  );
}
