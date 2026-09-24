/**
 * BUILD-TIME IMAGE OPTIMISATION
 *
 * `output: 'export'` has no server, so the next/image optimizer is
 * unavailable. This replaces it. Every source image in assets/images-src is
 * converted to AVIF + WebP at four widths, compressed, and recorded in
 * src/data/image-manifest.json together with its intrinsic dimensions, so
 * <SmartImage> can emit width/height and srcset. Explicit dimensions are what
 * keep CLS at zero — the layout-shift half of Core Web Vitals.
 *
 * Sources live OUTSIDE public/ on purpose: anything in public/ is copied
 * verbatim into the export, and shipping multi-megabyte originals alongside
 * the optimized derivatives would defeat the point.
 *
 * Usage: drop originals into assets/images-src/, then `npm run images`
 * (also runs automatically as part of `npm run build`).
 */
import { mkdir, readdir, writeFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/images-src';
const OUT = 'public/images';
const MANIFEST = 'src/data/image-manifest.json';
const WIDTHS = [480, 768, 1200, 1600];

/**
 * Collect SVG graphics from public/images/ and add them as direct-URL
 * entries. optimize-images only converts raster sources, but the diagram /
 * chart / annotated slots are hand-authored SVGs that live in public/ so
 * they are copied verbatim into the export. Registering them here keeps the
 * manifest complete after every build.
 */
async function collectSvgs() {
  const svgDir = 'public/images';
  if (!existsSync(svgDir)) return {};
  const entries = {};
  for (const f of await readdir(svgDir)) {
    if (!/\.svg$/i.test(f)) continue;
    const name = f.replace(/\.svg$/i, '');
    try {
      await stat(path.join(svgDir, f));
      entries[name] = { width: 800, height: 500, src: `/images/${f}` };
    } catch {
      /* skip unreadable */
    }
  }
  return entries;
}

async function writeEmpty(reason) {
  await writeFile(MANIFEST, '{}\n');
  console.log(`[images] ${reason}; wrote empty manifest`);
}

/**
 * Remove only the generated raster derivatives from public/images, leaving
 * hand-authored SVGs (diagrams, charts, annotations) untouched. Previously
 * the whole directory was deleted, which wiped the SVGs on every build.
 */
async function cleanRasterOutput() {
  if (!existsSync(OUT)) {
    await mkdir(OUT, { recursive: true });
    return;
  }
  const files = await readdir(OUT);
  for (const f of files) {
    if (/\.(webp|avif)$/i.test(f)) {
      await rm(path.join(OUT, f), { force: true });
    }
  }
}

if (!existsSync(SRC)) {
  await writeEmpty('no assets/images-src directory');
  process.exit(0);
}

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f));

if (files.length === 0) {
  await writeEmpty('no source images found');
  process.exit(0);
}

await cleanRasterOutput();

const manifest = {};

for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);

  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    console.warn(`[images] skipping ${file} — could not read dimensions`);
    continue;
  }

  const ratio = meta.height / meta.width;
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (widths.length === 0) widths.push(meta.width);

  const entry = { width: meta.width, height: meta.height, webp: [], avif: [] };

  for (const w of widths) {
    const h = Math.round(w * ratio);

    await sharp(input)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
    entry.webp.push({ w, h, src: `/images/${name}-${w}.webp` });

    await sharp(input)
      .resize(w, null, { withoutEnlargement: true })
      .avif({ quality: 58, effort: 4 })
      .toFile(path.join(OUT, `${name}-${w}.avif`));
    entry.avif.push({ w, h, src: `/images/${name}-${w}.avif` });
  }

  manifest[name] = entry;
  console.log(`[images] ${file} -> ${widths.length} widths (avif + webp)`);
}

const svgEntries = await collectSvgs();
const fullManifest = { ...manifest, ...svgEntries };

await writeFile(MANIFEST, JSON.stringify(fullManifest, null, 2) + '\n');
console.log(
  `[images] manifest written: ${Object.keys(fullManifest).length} image(s) ` +
    `(${Object.keys(manifest).length} raster + ${Object.keys(svgEntries).length} svg)`,
);
