// Responsive image variants — the static-hosting replacement for next/image.
//
// For every public/images/<slug>.webp this writes narrower copies to
// public/images/w/<slug>-<width>.webp and a manifest at
// src/generated/images.json ({ slug: { width, height, widths } }) that
// src/components/Img.tsx turns into srcset. The original file is always the
// widest candidate. Both outputs are gitignored and rebuilt on demand; a
// variant newer than its source is reused, so repeat runs take milliseconds.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/images');
const OUT = path.join(SRC, 'w');
const MANIFEST = path.join(ROOT, 'src/generated/images.json');
const WIDTHS = [480, 828, 1200, 1600];
const QUALITY = 78;

const mtime = (p) => stat(p).then((s) => s.mtimeMs, () => 0);

await mkdir(OUT, { recursive: true });
await mkdir(path.dirname(MANIFEST), { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.webp')).sort();
const manifest = {};
let written = 0;

await Promise.all(
  files.map(async (file) => {
    const slug = file.replace(/\.webp$/, '');
    const src = path.join(SRC, file);
    const { width, height } = await sharp(src).metadata();
    if (!width || !height) throw new Error(`images: cannot read size of ${file}`);
    const widths = WIDTHS.filter((w) => w < width);
    const srcTime = await mtime(src);
    for (const w of widths) {
      const out = path.join(OUT, `${slug}-${w}.webp`);
      if ((await mtime(out)) > srcTime) continue;
      await sharp(src).resize({ width: w }).webp({ quality: QUALITY }).toFile(out);
      written++;
    }
    manifest[slug] = { width, height, widths: [...widths, width] };
  }),
);

const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
console.log(`images: ${files.length} sources, ${written} variant(s) written`);
