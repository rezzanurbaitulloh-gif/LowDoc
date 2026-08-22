import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lowdoc.css";

export const metadata: Metadata = {
  title: "LowDoc — Universal Document Converter",
  description:
    "Privacy-first document converter. 100% offline in-browser conversion via WebAssembly. Zero database — files erased when the tab closes.",
  manifest: "/manifest.webmanifest",
  applicationName: "LowDoc",
};

const themeInit = `(function(){try{var t=localStorage.getItem("ld-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#16120c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="lowdoc">{children}</body>
    </html>
  );
}
