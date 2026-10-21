import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
async function exists(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}
async function walk(dir) {
  let files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}
const files = await walk(root),
  htmlFiles = files.filter((f) => f.endsWith('.html'));
let links = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${file}: expected one h1`);
  assert.match(html, /<title>[^<]+<\/title>/, `${file}: title missing`);
  assert.match(html, /<html[^>]+lang="en"/, `${file}: language missing`);
  assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, `${file}: expected one main`);
  const main = html.match(/<main\b[^>]*>/)[0];
  assert.match(main, /\bid="main"/, `${file}: skip target missing`);
  assert.match(main, /\btabindex="-1"/, `${file}: skip target must accept focus`);
  let previousHeading = 0;
  for (const heading of html.matchAll(/<h([1-6])(?:\s|>)/g)) {
    const level = Number(heading[1]);
    assert(
      level <= previousHeading + 1,
      `${file}: heading level skips from ${previousHeading} to ${level}`,
    );
    previousHeading = level;
  }
  for (const block of html.matchAll(/<pre\b[^>]*>/g))
    assert.match(block[0], /tabindex="0"/, `${file}: scrolling code must accept keyboard focus`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    let href = m[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    links++;
    if (href.startsWith('#')) {
      assert(ids.has(href.slice(1)), `${file}: missing anchor ${href}`);
      continue;
    }
    const u = new URL(
      href,
      'https://umailserver.com' +
        path
          .relative(root, file)
          .replaceAll('\\', '/')
          .replace(/index.html$/, ''),
    );
    let p = path.join(root, decodeURIComponent(u.pathname));
    if (u.pathname.endsWith('/')) p = path.join(p, 'index.html');
    assert(await exists(p), `${file}: missing local target ${href}`);
  }
}
assert.equal((await readFile(path.join(root, 'CNAME'), 'utf8')).trim(), 'umailserver.com');
assert(await exists(path.join(root, '.nojekyll')));
for (const f of ['robots.txt', 'sitemap.xml', 'og.png', 'social.png', 'apple-touch-icon.png'])
  assert(await exists(path.join(root, f)), `Missing ${f}`);
for (const p of [
  '',
  'docs/',
  'docs/getting-started/',
  'docs/architecture/',
  'docs/deployment/',
  'docs/security/',
  'docs/changelog/',
  'brand/',
]) {
  const html = await readFile(path.join(root, p, 'index.html'), 'utf8');
  assert(html.includes(`href="https://umailserver.com/${p}"`), `Canonical missing: ${p}`);
  assert.match(html, /name="description" content="[^"]+"/);
}
console.log(
  `PASS: ${htmlFiles.length} HTML pages, ${links} internal links/assets; canonical URLs, SEO, CNAME and export files verified.`,
);
