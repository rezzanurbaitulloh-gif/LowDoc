import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "Converter" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/licenses", label: "Licenses" },
  { href: "/support", label: "Support" },
];

export default function SiteShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--ld-border)] bg-[var(--ld-panel)]">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <img src="/brand/icon-64.png" alt="LowDoc logo" width={34} height={34} />
            <span style={{ fontFamily: "var(--ld-display)" }} className="font-bold text-lg leading-none">
              LowDoc<span style={{ color: "var(--ld-orange)" }}>.</span>
            </span>
          </Link>
          <nav aria-label="Site" className="ml-auto hidden sm:flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider">
            {NAV.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="text-[var(--ld-muted)] hover:text-[var(--ld-orange)]">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <h1 style={{ fontFamily: "var(--ld-display)" }} className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[var(--ld-muted)]">{subtitle}</p>}
        <div className="mt-8 space-y-8 leading-relaxed">{children}</div>
      </main>

      <footer className="border-t border-[var(--ld-border)] bg-[var(--ld-panel)]">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-wider">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-[var(--ld-dim)] hover:text-[var(--ld-orange)]">
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="mt-3 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
            LowDoc · Private file tools. Built for your browser. · No account · No database · No mandatory upload
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "var(--ld-display)" }} className="text-xl font-semibold mb-3">
        {heading}
      </h2>
      <div className="space-y-3 text-[var(--ld-muted)]">{children}</div>
    </section>
  );
}
