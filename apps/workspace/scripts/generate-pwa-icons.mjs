#!/usr/bin/env node
// Regenerates public/icons/* from the brand mark. Run: node scripts/generate-pwa-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// sharp ships as an optional dependency of next; resolve it from there.
const sharp = createRequire(require.resolve("next/package.json"))("sharp");

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public/icons");

const GLYPH = `
  <path d="M9.5 8.5h10.5M9.5 16h8.5M9.5 23.5h10.5M9.5 8.5v15" stroke="#fff" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M21.2 12.2c1.15 1.15 1.85 2.7 1.85 4.3s-.7 3.15-1.85 4.3" stroke="#fff" stroke-width="1.85" stroke-linecap="round" fill="none" opacity=".95"/>
  <path d="M24.1 10c1.85 1.85 2.95 4.3 2.95 6.95S25.95 21.1 24.1 23" stroke="#fff" stroke-width="1.85" stroke-linecap="round" fill="none" opacity=".55"/>`;

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#4F46E5"/>${GLYPH}</svg>`;
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#4F46E5"/>${GLYPH}</svg>`;
// Maskable icons must keep the glyph inside the central 80% safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 40 40"><rect x="-4" y="-4" width="40" height="40" fill="#4F46E5"/>${GLYPH}</svg>`;

const targets = [
  { file: "icon-192.png", svg: rounded, size: 192 },
  { file: "icon-512.png", svg: rounded, size: 512 },
  { file: "icon-maskable-512.png", svg: maskable, size: 512 },
  { file: "apple-touch-icon.png", svg: fullBleed, size: 180 },
];

await mkdir(outDir, { recursive: true });
for (const { file, svg, size } of targets) {
  const png = await sharp(Buffer.from(svg), { density: 72 * (size / 32) }).resize(size, size).png().toBuffer();
  await writeFile(path.join(outDir, file), png);
  console.log(`public/icons/${file} (${size}x${size})`);
}
