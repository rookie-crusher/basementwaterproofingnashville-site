/**
 * ADMIN VENDOR FILES
 *
 * Copies the browser libraries the admin panel uses from node_modules into
 * public/admin/vendor/, so they ship with the site (and the panel never loads
 * code from a CDN). The folder is generated, so it is git-ignored.
 *
 * Runs as part of `npm run build` (prebuild).
 */
import { cpSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const OUT = 'public/admin/vendor';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const single = {
  'node_modules/js-yaml/dist/js-yaml.min.js': 'js-yaml.min.js',
  'node_modules/marked/lib/marked.esm.js': 'marked.esm.js',
  'node_modules/turndown/lib/turndown.browser.es.js': 'turndown.browser.es.js',
  'node_modules/turndown-plugin-gfm/lib/turndown-plugin-gfm.browser.es.js': 'turndown-plugin-gfm.browser.es.js',
};
for (const [from, to] of Object.entries(single)) copyFileSync(from, path.join(OUT, to));

// TinyMCE: only the minified runtime files it loads (about 3 MB instead of 11).
const TINY = 'node_modules/tinymce';
let count = 0;
function copyTiny(dir) {
  for (const name of readdirSync(path.join(TINY, dir))) {
    const rel = path.join(dir, name);
    const full = path.join(TINY, rel);
    if (statSync(full).isDirectory()) copyTiny(rel);
    // Plus the help plugin's keyboard-navigation text, which ships unminified.
    else if (/\.min\.(js|css)$/.test(name) || /^license/i.test(name) || rel.replace(/\\/g, '/') === 'plugins/help/js/i18n/keynav/en.js') {
      mkdirSync(path.join(OUT, 'tinymce', dir), { recursive: true });
      cpSync(full, path.join(OUT, 'tinymce', rel));
      count++;
    }
  }
}
copyTiny('');
console.log(`[admin] vendor files copied to ${OUT} (${count} TinyMCE files)`);
