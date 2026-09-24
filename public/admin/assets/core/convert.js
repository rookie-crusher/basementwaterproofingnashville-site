// Markdown <-> editor HTML.
//
// Articles stay markdown on disk, because src/lib/blog.ts builds the table of
// contents and the FAQ schema from `##` / `###` headings in the raw body.
// Images are the special case: on disk an image is an `{{image:N}}` marker
// plus a brief in frontmatter (which lets the build emit AVIF/WebP srcsets);
// in the editor it is an ordinary <figure>. Saving turns figures back into
// markers, keeping each image's number and any production notes it had.
//
// Libraries are passed in so this runs in the browser and in Node tests.
import { slotFromUrl } from './model.js';

const escAttr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * Tables built in the editor may have no header row, and a GFM table must
 * have one (otherwise it stays raw HTML). Treat the first row as the header.
 */
function promoteTableHeaders(html) {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    if (/<thead\b|<th\b/i.test(table)) return table;
    return table.replace(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/i, (_r, attrs, cells) =>
      `<tr${attrs}>${cells.replace(/<td\b/gi, '<th').replace(/<\/td>/gi, '</th>')}</tr>`);
  });
}

function insideFigure(node) {
  for (let p = node.parentNode; p; p = p.parentNode) if (p.nodeName === 'FIGURE') return true;
  return false;
}

export function createConverter({ marked, TurndownService, gfm }) {
  const slotOf = (img) => img.getAttribute('data-slot') || slotFromUrl(img.getAttribute('src') || '');

  /** `urlFor(slot)` returns the preview URL of an image (or a placeholder). */
  function toEditorHtml(body, images, urlFor) {
    const html = marked.parse(body ?? '', { gfm: true, breaks: false, async: false });
    return html.replace(/<p>\s*\{\{image:(\d+)\}\}\s*<\/p>/g, (_all, n) => {
      const brief = (images ?? []).find((i) => Number(i.n) === Number(n));
      if (!brief) return '';
      const cap = brief.caption ? `<figcaption>${escText(brief.caption)}</figcaption>` : '';
      return `<figure class="image"><img src="${escAttr(urlFor(brief.slot))}" alt="${escAttr(brief.alt)}" data-slot="${escAttr(brief.slot)}">${cap}</figure>`;
    });
  }

  /** `isSvgSlot(slot)` decides the default brief type for new images. */
  function fromEditorHtml(html, previousImages = [], isSvgSlot = () => false) {
    const bySlot = new Map(previousImages.map((b) => [b.slot, b]));
    const images = [];
    const used = new Set();
    let nextN = Math.max(0, ...previousImages.map((b) => Number(b.n) || 0)) + 1;

    const addBrief = (slot, alt, caption) => {
      const prev = bySlot.get(slot) ?? {};
      // Keep an image's number so a save only changes what was edited.
      const n = prev.n && !used.has(Number(prev.n)) ? Number(prev.n) : nextN++;
      used.add(n);
      const brief = {
        n,
        type: prev.type ?? (isSvgSlot(slot) ? 'diagram' : 'photo'),
        slot,
        alt: (alt ?? '').trim() || prev.alt || '',
        caption: (caption ?? '').replace(/\s+/g, ' ').trim(),
      };
      if (prev.capture) brief.capture = prev.capture;
      if (prev.rationale) brief.rationale = prev.rationale;
      images.push(brief);
      return `\n\n{{image:${n}}}\n\n`;
    };

    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      hr: '---',
    });
    td.use(gfm);
    td.keep(['iframe', 'video', 'sub', 'sup']);

    // "- item" / "1. item" rather than turndown's "-   item".
    td.addRule('listItem', {
      filter: 'li',
      replacement: (content, node) => {
        const parent = node.parentNode;
        let prefix = '- ';
        if (parent.nodeName === 'OL') {
          const start = Number(parent.getAttribute('start')) || 1;
          prefix = `${start + Array.prototype.indexOf.call(parent.children, node)}. `;
        }
        const isParagraph = /\n$/.test(content);
        const body = content.replace(/^\n+|\n+$/g, '') + (isParagraph ? '\n' : '');
        return prefix + body.replace(/\n/g, '\n' + ' '.repeat(prefix.length)) + (node.nextSibling ? '\n' : '');
      },
    });
    // A figure around an external image: keep the image, caption underneath.
    td.addRule('plainFigure', { filter: 'figure', replacement: (content) => `\n\n${content.trim()}\n\n` });
    td.addRule('figcaption', {
      filter: 'figcaption',
      replacement: (content) => (content.trim() ? `\n\n*${content.trim()}*\n\n` : ''),
    });
    // Turndown checks the most recently added rule first, so the image-slot
    // rules come last to win over the generic figure rule.
    td.addRule('slotFigure', {
      filter: (node) => node.nodeName === 'FIGURE' && !!node.querySelector('img') && !!slotOf(node.querySelector('img')),
      replacement: (_c, node) => {
        const img = node.querySelector('img');
        const cap = node.querySelector('figcaption');
        return addBrief(slotOf(img), img.getAttribute('alt'), cap ? cap.textContent : '');
      },
    });
    // Children convert before parents, so an <img> inside a figure is left to
    // the figure rule; otherwise it would be counted twice.
    td.addRule('slotImage', {
      filter: (node) => node.nodeName === 'IMG' && !!slotOf(node) && !insideFigure(node),
      replacement: (_c, node) => addBrief(slotOf(node), node.getAttribute('alt'), ''),
    });

    const md = td
      .turndown(promoteTableHeaders(html ?? ''))
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return { body: md + '\n', images };
  }

  return { toEditorHtml, fromEditorHtml };
}
