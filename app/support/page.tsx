import type { Metadata } from "next";
import SiteShell, { Section } from "@/components/lowdoc/site-shell";
import { Coffee, Github, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Support LowDoc — Keep the Free File Tools Running",
  description:
    "LowDoc stays free with no accounts and no limits. If it saves you time, support the project voluntarily — no login required, core tools stay free.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <SiteShell
      title="Support LowDoc"
      subtitle="No subscriptions. No paywalls. Just voluntary support if the tool earns it."
    >
      <Section heading="Why donate">
        <p>
          LowDoc is a free public utility: no accounts, no artificial conversion
          limits, no database, and fidelity-first conversion that runs in your
          browser. Donations cover WebAssembly engine maintenance, new format support,
          and keeping the public deployment online.
        </p>
      </Section>

      <Section heading="Ways to support">
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="https://github.com/sponsors/rezzanurbaitulloh-gif"
            target="_blank"
            rel="noopener noreferrer"
            className="ld-card block"
          >
            <Github size={20} className="text-[var(--ld-orange)]" />
            <div className="mt-2 font-semibold">GitHub Sponsors</div>
            <p className="text-sm text-[var(--ld-muted)] mt-1">
              Sponsor the project directly on GitHub — one-time or monthly.
            </p>
          </a>
          <a
            href="https://www.buymeacoffee.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="ld-card block"
          >
            <Coffee size={20} className="text-[var(--ld-orange)]" />
            <div className="mt-2 font-semibold">Buy Me a Coffee</div>
            <p className="text-sm text-[var(--ld-muted)] mt-1">
              Treat the maintainer to a coffee — every bit helps.
            </p>
          </a>
        </div>
      </Section>

      <Section heading="Other ways to help">
        <ul className="list-disc pl-5 space-y-1">
          <li>Share LowDoc with people who convert documents often.</li>
          <li>Report bugs or request formats — use the suggestion box on the home page.</li>
          <li>Star the repository so others can discover it.</li>
        </ul>
      </Section>

      <Section heading="The promise">
        <p>
          Donations never unlock features. Core functionality stays free for everyone,
          with no login required — now and later.
        </p>
        <p className="flex items-center gap-2 text-[var(--ld-text)]">
          <Heart size={15} className="text-[var(--ld-orange)]" /> Thank you for keeping private file tools alive.
        </p>
      </Section>
    </SiteShell>
  );
}
