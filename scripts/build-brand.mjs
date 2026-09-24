/**
 * BRAND ASSET PIPELINE
 *
 * Regenerates the nav logo and the full favicon set from the source art in
 * assets/brand-src/. Run after replacing a logo file:
 *
 *   npm run brand
 *
 * WHAT IT DOES
 * The supplied logo art is flat navy/grey on an off-white background (#fefefc,
 * not pure white). Two steps matter:
 *
 *  1. Background removal. Alpha is derived from each pixel's distance from the
 *     measured background colour, with a small dead zone so the off-white does
 *     not survive as a 4% haze, and a steep ramp so only true anti-aliased
 *     edge pixels end up semi-transparent. Colours are left untouched, so the
 *     navy stays navy.
 *  2. Tiling for icons. Favicons are composited onto a bone tile rather than
 *     left transparent, because a transparent favicon disappears against dark
 *     browser chrome.
 *
 * NOTE ON FAVICON LEGIBILITY: at 16-32px the shield and droplet detail is
 * mostly lost and the mark reads as "BW". That was compared against a tight
 * crop on just the lettering; the full mark won, because cropping clips the
 * shield into stray artefacts. If you want something sharper at 16px, the
 * answer is a purpose-drawn simplified mark, not a different crop.
 *
 * og-image.png is NOT regenerated here. It has type set in Archivo and IBM
 * Plex Mono, which requires those fonts installed at the OS level; it ships as
 * a committed static asset instead. Re-make it in a design tool if the brand
 * or the phone number changes.
 */
import { mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/brand-src';
const OUT = 'public/brand';
const BONE = { r: 0xf6, g: 0xf4, b: 0xef, alpha: 1 }; // --color-limestone-50

const DEADZONE = 4;    // ignore pixels within this of the background
const FEATHER = 0.10;  // fraction of range over which alpha ramps to opaque

if (!existsSync(SRC)) {
  console.error(`[brand] ${SRC} not found`);
  process.exit(1);
}
await mkdir(OUT, { recursive: true });

/** Measure the background from the top and bottom rows. */
function measureBackground(data, w, h, channels) {
  const maxes = [];
  for (const row of [0, h - 1]) {
    for (let x = 0; x < w; x++) {
      const i = (row * w + x) * channels;
      maxes.push(Math.max(data[i], data[i + 1], data[i + 2]));
    }
  }
  maxes.sort((a, b) => a - b);
  return maxes[Math.floor(maxes.length / 2)]; // median
}

/** Flat art on a flat light background -> RGBA with colours preserved. */
async function keyOut(file) {
  const img = sharp(file).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const bg = measureBackground(data, w, h, channels);

  const out = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const s = p * channels;
    const r = data[s], g = data[s + 1], b = data[s + 2];
    let delta = bg - Math.max(r, g, b);
    if (delta <= DEADZONE) delta = 0;
    const a = Math.min(1, Math.max(0, delta / bg / FEATHER));
    const d = p * 4;
    out[d] = r; out[d + 1] = g; out[d + 2] = b; out[d + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png();
}

/** Trim fully-transparent margins. */
async function trimmed(file) {
  const buf = await (await keyOut(file)).toBuffer();
  return sharp(buf).trim({ threshold: 1 });
}

/** Contain the mark inside a square bone tile with padding. */
async function tile(srcBuf, size, padFrac) {
  const inner = Math.round(size * (1 - 2 * padFrac));
  const fitted = await sharp(srcBuf)
    .resize(inner, inner, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BONE } })
    .composite([{ input: fitted, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const files = await readdir(SRC);
const markFile = files.find((f) => /logo-mark\./i.test(f));
const fullFile = files.find((f) => /logo-full\./i.test(f));
if (!markFile) {
  console.error(`[brand] need a logo-mark.* file in ${SRC}`);
  process.exit(1);
}

// Nav logo: transparent, 3x a 44px display height so it stays crisp on retina
const markBuf = await (await trimmed(path.join(SRC, markFile))).toBuffer();
await sharp(markBuf).resize({ height: 132 }).png({ compressionLevel: 9 })
  .toFile(path.join(OUT, 'logo-mark.png'));
console.log('[brand] logo-mark.png');

// Favicons + apple touch icon
for (const [size, pad] of [[32, 0.06], [48, 0.08], [192, 0.12], [512, 0.12]]) {
  const buf = await tile(markBuf, size, pad);
  await sharp(buf).toFile(path.join(OUT, `icon-${size}.png`));
  console.log(`[brand] icon-${size}.png`);
}
await sharp(await tile(markBuf, 180, 0.14)).toFile(path.join(OUT, 'apple-icon.png'));
console.log('[brand] apple-icon.png');

// Square logo for structured data (Google wants it legible standalone)
if (fullFile) {
  const fullBuf = await (await trimmed(path.join(SRC, fullFile))).toBuffer();
  await sharp(await tile(fullBuf, 512, 0.08)).toFile(path.join(OUT, 'logo.png'));
  console.log('[brand] logo.png');
}
console.log('[brand] done — og-image.png is a committed asset, not regenerated');
