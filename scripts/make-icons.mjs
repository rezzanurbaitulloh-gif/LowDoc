import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// Minimal pure-JS PNG encoder (no deps) — solid slate background with an
// orange "LD" block mark. Produces real RGBA PNGs suitable for PWA icons.

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let off = 0;
  for (let y = 0; y < size; y++) {
    raw[off++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[off++] = r;
      raw[off++] = g;
      raw[off++] = b;
      raw[off++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const idat = deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function draw(size) {
  const bg = [15, 23, 42]; // #0F172A
  const mark = [255, 85, 0]; // #FF5500
  const white = [248, 250, 252];
  const m = Math.round(size * 0.34); // block size
  const ox = Math.round(size * 0.33);
  const oy = Math.round(size * 0.22);
  return encodePng(size, (x, y) => {
    // orange square with a white "L" notch
    const inSquare = x >= ox && x < ox + m && y >= oy && y < oy + m;
    if (!inSquare) return [...bg, 255];
    const lx = x - ox;
    const ly = y - oy;
    const barW = Math.max(2, Math.round(m * 0.2));
    const inL = lx < barW || ly >= m - barW;
    return inL ? [...white, 255] : [...mark, 255];
  });
}

mkdirSync("public/lowdoc", { recursive: true });
writeFileSync("public/lowdoc/icon-192.png", draw(192));
writeFileSync("public/lowdoc/icon-512.png", draw(512));
console.log("icons written");
