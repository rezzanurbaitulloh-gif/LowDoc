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

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="lowdoc">{children}</body>
    </html>
  );
}
