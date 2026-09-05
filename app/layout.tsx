import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lowdoc.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lowdoc.vercel.app"),
  alternates: { canonical: "/" },
  title: {
    default: "LowDoc — Universal Document Converter",
    template: "%s",
  },
  description:
    "Privacy-first document converter. Local-first in-browser conversion via WebAssembly. Zero database — files erased when the tab closes.",
  manifest: "/manifest.webmanifest",
  applicationName: "LowDoc",
  openGraph: {
    type: "website",
    siteName: "LowDoc",
    url: "https://lowdoc.vercel.app",
    title: "LowDoc — Universal Document Converter",
    description:
      "Convert, resize, compress and preview files privately in your browser. Fidelity-first, no accounts, no database.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "LowDoc — private file tools" }],
  },
  twitter: {
    card: "summary",
    title: "LowDoc — Universal Document Converter",
    description: "Private file tools. Built for your browser.",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "48x48" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "LowDoc",
    statusBarStyle: "default",
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem("ld-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D76A1C" },
    { media: "(prefers-color-scheme: dark)", color: "#1F1610" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="lowdoc">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 bg-[var(--ld-orange)] text-white px-4 py-2 rounded font-mono text-sm">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
