import { NextResponse } from "next/server";

const ICON_192 = "/lowdoc/icon-192.png";
const ICON_512 = "/lowdoc/icon-512.png";

export function GET() {
  const manifest = {
    name: "LowDoc — Universal Document Converter",
    short_name: "LowDoc",
    description:
      "Privacy-first document converter. 100% offline in-browser conversion via WebAssembly. Zero database — files erased when the tab closes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    lang: "en",
    dir: "ltr",
    icons: [
      { src: ICON_192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: ICON_512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: ICON_512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Convert Documents",
        url: "/?tab=convert",
        description: "Convert documents between formats",
      },
      {
        name: "PDF Tools",
        url: "/?tab=tools",
        description: "Merge, split, and compress PDFs",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store",
    },
  });
}
