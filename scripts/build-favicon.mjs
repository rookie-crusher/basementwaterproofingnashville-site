/**
 * FAVICON
 *
 * Browsers, crawlers and link unfurlers still request /favicon.ico by path,
 * ignoring the <link rel="icon"> PNGs entirely. Under `output: 'export'` there
 * is no server to rewrite that request, so the file has to exist in public/.
 *
 * sharp cannot write .ico, but the ICO container has permitted embedded PNG
 * payloads since Vista, so the format is assembled by hand here: a 6-byte
 * header, one 16-byte directory entry per size, then the PNG bytes.
 *
 * Usage: node scripts/build-favicon.mjs (runs as part of `npm run build`).
 */
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SOURCE = 'public/brand/logo-mark.png';
const OUT = 'public/favicon.ico';
const SIZES = [16, 32, 48];

/** ICO stores 256 as 0 in the single width/height byte. */
const dim = (n) => (n >= 256 ? 0 : n);

async function main() {
  if (!existsSync(SOURCE)) {
    console.log(`[favicon] ${SOURCE} not found; skipped`);
    return;
  }

  const pngs = await Promise.all(
    SIZES.map((size) =>
      sharp(SOURCE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(SIZES.length, 4);

  // Image data starts after the header and the full directory.
  let offset = 6 + 16 * SIZES.length;
  const entries = SIZES.map((size, i) => {
    const png = pngs[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(dim(size), 0); // width
    entry.writeUInt8(dim(size), 1); // height
    entry.writeUInt8(0, 2); // palette size — 0 for true colour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  await writeFile(OUT, Buffer.concat([header, ...entries, ...pngs]));
  console.log(`[favicon] ${OUT} written (${SIZES.join(', ')}px)`);
}

main().catch((err) => {
  console.error('[favicon]', err);
  process.exitCode = 1;
});
