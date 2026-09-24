/**
 * SHOT LIST
 *
 * Pulls every image brief out of the article frontmatter into one document for
 * whoever is taking the photos. Run: npm run shotlist
 *
 * The briefs live in frontmatter rather than in the article body because a
 * published page should not show production notes to readers. The body carries
 * an {{image:N}} marker; the renderer turns it into a real figure once the file
 * exists in assets/images-src.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DIR = 'content/blog';
const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));

let out = `# Photo and graphic shot list\n\nEvery visual the published guides are waiting on. File names are exact: save\neach one as \`<name>.jpg\` into \`assets/images-src/\`, then run \`npm run images\`.\nThe article picks it up automatically on the next build.\n\nPhotograph your own jobs. Stock photos of someone else's basement are the\nfastest way to undercut the first-hand experience these articles are built on,\nand they carry licensing risk that real photos do not.\n\n`;

let total = 0;
for (const f of files.sort()) {
  const { data } = matter(await readFile(path.join(DIR, f), 'utf8'));
  const images = data.images ?? [];
  out += `---\n\n## ${data.title}\n\nSlug: \`/blog/${f.replace(/\.md$/, '')}/\`\n\n`;
  for (const im of images) {
    total++;
    out += `### ${im.n}. \`${im.slot}.jpg\` (${im.type})\n\n`;
    // Images added through the admin panel carry only alt and caption.
    if (im.capture) out += `**Capture:** ${im.capture}\n\n`;
    if (im.caption) out += `**Caption:** ${im.caption}\n\n`;
    if (im.alt) out += `**Alt text:** ${im.alt}\n\n`;
    if (im.rationale) out += `**Why it earns its place:** ${im.rationale}\n\n`;
  }
}
out += `---\n\n**Total: ${total} visuals across ${files.length} guides.**\n`;

await writeFile('SHOT-LIST.md', out);
console.log(`[shotlist] SHOT-LIST.md written: ${total} briefs across ${files.length} articles`);
