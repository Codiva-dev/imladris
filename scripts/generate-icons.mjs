/**
 * Genera PNG de marca a partir del icon SVG (hoja Lucide).
 * Uso: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public/icons/icon.svg"));
const outDir = join(root, "public/icons");
const appDir = join(root, "src/app");

mkdirSync(outDir, { recursive: true });

const targets = [
  { file: join(outDir, "icon-192.png"), size: 192 },
  { file: join(outDir, "icon-512.png"), size: 512 },
  { file: join(outDir, "apple-touch-icon.png"), size: 180 },
  { file: join(outDir, "favicon-32.png"), size: 32 },
  { file: join(outDir, "favicon-16.png"), size: 16 },
  { file: join(appDir, "icon.png"), size: 512 },
  { file: join(appDir, "apple-icon.png"), size: 180 },
];

for (const { file, size } of targets) {
  const buf = await sharp(svg)
    .resize(size, size)
    .ensureAlpha()
    .png()
    .toBuffer();
  writeFileSync(file, buf);
  console.log("wrote", file.replace(root, ""), `(${size}×${size})`);
}

console.log("done");
