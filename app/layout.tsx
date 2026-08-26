import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lowdoc.css";

export const metadata: Metadata = {
  title: "LowDoc — Universal Document Converter",
  description:
    "Privacy-first document converter. Local-first in-browser conversion via WebAssembly. Zero database — files erased when the tab closes.",
  manifest: "/manifest.webmanifest",
  applicationName: "LowDoc",
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
      <body className="lowdoc">{children}</body>
    </html>
  );
}
