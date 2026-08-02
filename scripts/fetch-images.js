#!/usr/bin/env node
/**
 * fetch-images.js
 * ---------------------------------------------------------------------------
 * Downloads every photograph the guide references so the site works with no
 * outbound network at all.
 *
 * It walks src/content.js for `wiki` keys, asks Wikimedia for the lead
 * photograph of each article at the two widths the page actually uses, saves
 * them under public/img/, and writes a manifest the server reads at boot.
 *
 *   node scripts/fetch-images.js          # fetch anything missing
 *   node scripts/fetch-images.js --force  # re-download everything
 * ---------------------------------------------------------------------------
 */

'use strict';

const fs = require('fs');
const path = require('path');
const content = require('../src/content');

const OUT_DIR = path.join(__dirname, '..', 'public', 'img');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const WIDTHS = [400, 1200];
const BATCH = 40;
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const UA = 'DiscoverItaly/2.0 (educational demo; offline asset build)';
const FORCE = process.argv.includes('--force');

/* --------------------------------------------------------------- helpers */

/** Every `wiki:` value anywhere in the content tree. */
function collectTitles(node, found = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => collectTitles(n, found));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'wiki' && typeof value === 'string') found.add(value);
      else collectTitles(value, found);
    }
  }
  return found;
}

const slug = (title) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

async function getJson(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/**
 * Ask for up to 50 articles at once and map the answer back onto the spelling
 * we asked for — Wikipedia normalises and follows redirects, so the key that
 * comes back is rarely the key that went out.
 */
async function lookupBatch(titles, width) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: String(width),
    pilimit: '50',
    format: 'json',
    redirects: '1',
    titles: titles.join('|'),
  });
  const query = (await getJson(`${WIKI_API}?${params}`)).query || {};

  const byCanonical = new Map();
  for (const page of Object.values(query.pages || {})) {
    if (page?.thumbnail?.source) byCanonical.set(page.title, page.thumbnail.source);
  }

  const rename = new Map();
  for (const step of [...(query.normalized || []), ...(query.redirects || [])]) {
    rename.set(step.from, step.to);
  }
  const canonical = (title) => {
    let name = title;
    for (let hops = 0; hops < 4 && rename.has(name); hops += 1) name = rename.get(name);
    return name;
  };

  const out = new Map();
  for (const title of titles) {
    const url =
      byCanonical.get(canonical(title)) || byCanonical.get(canonical(title.replace(/_/g, ' ')));
    if (url) out.set(title, url);
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wikimedia throttles bursts from a single client, so a straight loop over 200
 * files starts collecting 429s a dozen in. Back off and try again instead.
 */
async function download(url, file, attempt = 1) {
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(file, buffer);
    return buffer.length;
  } catch (err) {
    if (attempt >= 6) throw err;
    await sleep(attempt * 2500);
    return download(url, file, attempt + 1);
  }
}

/* ------------------------------------------------------------------- run */

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = fs.existsSync(MANIFEST) && !FORCE
    ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
    : {};

  const titles = [...collectTitles(content)].sort();
  console.log(`${titles.length} articles · widths ${WIDTHS.join(', ')}\n`);

  let saved = 0;
  let bytes = 0;
  let skipped = 0;
  const missing = new Set();

  for (const width of WIDTHS) {
    for (let i = 0; i < titles.length; i += BATCH) {
      const slice = titles.slice(i, i + BATCH);
      const pending = slice.filter((t) => {
        const hit = manifest[`${t}@${width}`];
        if (hit && fs.existsSync(path.join(OUT_DIR, hit.file))) {
          skipped += 1;
          return false;
        }
        return true;
      });
      if (!pending.length) continue;

      let found;
      try {
        found = await lookupBatch(pending, width);
      } catch (err) {
        console.warn(`  lookup failed (w=${width}): ${err.message}`);
        continue;
      }

      for (const title of pending) {
        const url = found.get(title);
        if (!url) {
          missing.add(title);
          continue;
        }
        const ext = (url.match(/\.(jpe?g|png|webp|gif)$/i) || ['.jpg'])[0].toLowerCase();
        const file = `${slug(title)}-${width}${ext === '.jpeg' ? '.jpg' : ext}`;
        try {
          bytes += await download(url, path.join(OUT_DIR, file));
          manifest[`${title}@${width}`] = { file, source: url };
          saved += 1;
          console.log(`  ${String(saved).padStart(3)} · ${file}`);
        } catch (err) {
          console.warn(`  ✗ ${title} (w=${width}): ${err.message}`);
          missing.add(title);
        }
        await sleep(120);
      }
      fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
      await sleep(250);
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`\n\n  saved   ${saved} files (${(bytes / 1e6).toFixed(1)} MB)`);
  console.log(`  already ${skipped}`);
  if (missing.size) {
    console.log(`  no image found for ${missing.size}:`);
    [...missing].forEach((t) => console.log(`    · ${t}`));
  }
  console.log(`\n  manifest → public/img/manifest.json\n`);
})();
