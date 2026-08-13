"use client";

interface DxfEntity {
  type?: string;
  vertices?: Array<{ x: number; y: number; z?: number }>;
  start?: { x: number; y: number; z?: number };
  end?: { x: number; y: number; z?: number };
  center?: { x: number; y: number; z?: number };
  radius?: number;
  angle?: number;
  startAngle?: number;
  endAngle?: number;
  isClosed?: boolean;
  colorIndex?: number;
  layer?: string;
  thickness?: number;
  bulge?: number;
  x?: number;
  y?: number;
}

export interface DxfSvgResult {
  svg: string;
  entities: number;
  width: number;
  height: number;
}

export function renderDxfToSvg(dxf: unknown): DxfSvgResult {
  const entities: DxfEntity[] = (dxf as { entities?: DxfEntity[] }).entities ?? [];
  const shapes: string[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const track = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const colorFor = (index?: number): string => {
    const palette: Record<number, string> = {
      0: "#000000", 1: "#ff0000", 2: "#ffff00", 3: "#00ff00", 4: "#00ffff",
      5: "#0000ff", 6: "#ff00ff", 7: "#ffffff", 8: "#808080", 9: "#c0c0c0",
    };
    return palette[index ?? 7] ?? "#cccccc";
  };

  for (const ent of entities) {
    const stroke = colorFor(ent.colorIndex);
    switch (ent.type) {
      case "LINE": {
        if (!ent.start || !ent.end) break;
        track(ent.start.x, ent.start.y);
        track(ent.end.x, ent.end.y);
        shapes.push(
          `<line x1="${ent.start.x}" y1="${ent.start.y}" x2="${ent.end.x}" y2="${ent.end.y}" stroke="${stroke}" stroke-width="1"/>`,
        );
        break;
      }
      case "LWPOLYLINE":
      case "POLYLINE": {
        const vs = ent.vertices ?? [];
        if (vs.length < 2) break;
        for (const v of vs) track(v.x, v.y);
        const closed = ent.isClosed ? "1" : "0";
        const pts = vs.map((v) => `${v.x},${v.y}`).join(" ");
        shapes.push(
          `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`,
        );
        if (closed === "1" && vs.length > 2) {
          shapes.push(
            `<line x1="${vs[vs.length - 1].x}" y1="${vs[vs.length - 1].y}" x2="${vs[0].x}" y2="${vs[0].y}" stroke="${stroke}" stroke-width="1"/>`,
          );
        }
        break;
      }
      case "CIRCLE": {
        if (!ent.center || !ent.radius) break;
        track(ent.center.x - ent.radius, ent.center.y - ent.radius);
        track(ent.center.x + ent.radius, ent.center.y + ent.radius);
        shapes.push(
          `<circle cx="${ent.center.x}" cy="${ent.center.y}" r="${ent.radius}" fill="none" stroke="${stroke}" stroke-width="1"/>`,
        );
        break;
      }
      case "ARC": {
        if (!ent.center || !ent.radius || ent.startAngle === undefined || ent.endAngle === undefined) break;
        const a0 = ((ent.startAngle as number) * Math.PI) / 180;
        const a1 = ((ent.endAngle as number) * Math.PI) / 180;
        const r = ent.radius;
        const x0 = ent.center.x + r * Math.cos(a0);
        const y0 = ent.center.y + r * Math.sin(a0);
        const x1 = ent.center.x + r * Math.cos(a1);
        const y1 = ent.center.y + r * Math.sin(a1);
        track(x0, y0);
        track(x1, y1);
        track(ent.center.x - r, ent.center.y - r);
        track(ent.center.x + r, ent.center.y + r);
        const large = (ent.endAngle - ent.startAngle) % 360 > 180 ? 1 : 0;
        const sweep = 1;
        shapes.push(
          `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}" fill="none" stroke="${stroke}" stroke-width="1"/>`,
        );
        break;
      }
      case "TEXT":
      case "MTEXT": {
        const x = (ent as { x?: number }).x ?? 0;
        const y = (ent as { y?: number }).y ?? 0;
        const text = esc((ent as { text?: string }).text ?? "");
        if (!text) break;
        track(x, y);
        shapes.push(
          `<text x="${x}" y="${y}" fill="${stroke}" font-family="monospace" font-size="12" transform="scale(1,-1)">${text}</text>`,
        );
        break;
      }
      default:
        break;
    }
  }

  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 100;
    maxY = 100;
  }

  const pad = Math.max((maxX - minX) * 0.05, 1);
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;

  // SVG coordinate space: y grows downward; DXF uses y-up — flip via transform.
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - pad} ${-(maxY + pad)} ${width} ${height}">`,
    `<rect x="${minX - pad}" y="${-(maxY + pad)}" width="${width}" height="${height}" fill="#ffffff"/>`,
    `<g transform="translate(0,0) scale(1,-1)" fill="none">`,
    ...shapes,
    `</g></svg>`,
  ].join("");

  return { svg, entities: entities.length, width, height };
}