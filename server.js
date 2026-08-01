"use strict";

const path = require("path");
const express = require("express");
const content = require("./src/content");

const app = express();
const PORT = Number(process.env.PORT) || 4041;
const HOST = process.env.HOST || "0.0.0.0";

app.disable("x-powered-by");
app.set("etag", "strong");

/* ---------------------------------------------------------------------------
 * Small request log — one line per request, no dependencies.
 * ------------------------------------------------------------------------ */
app.use((req, res, next) => {
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`,
    );
  });
  next();
});

/* ===========================================================================
 * API — the content of Italy.pdf, as JSON
 * ======================================================================== */

const api = express.Router();

api.get("/", (_req, res) => {
  res.json({
    name: "Discover Italy API",
    source: content.meta.sourceDocument,
    endpoints: [
      "/api/content",
      "/api/overview",
      "/api/regions",
      "/api/regions/:name",
      "/api/planning",
      "/api/rome",
      "/api/rome/attractions/:id",
      "/api/vatican",
      "/api/quiz",
      "/api/image/:title",
      "/healthz",
    ],
  });
});

/** Everything in one payload — what the front end actually boots from. */
api.get("/content", (_req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json(content);
});

api.get("/overview", (_req, res) => res.json(content.overview));
api.get("/planning", (_req, res) => res.json(content.planning));
api.get("/vatican", (_req, res) => res.json(content.vatican));
api.get("/quiz", (_req, res) => res.json(content.quiz));

/** The 20 map regions, merged with the PDF's five region → city entries. */
api.get("/regions", (_req, res) => {
  const regions = Object.entries(content.regionInfo).map(([name, info]) => ({
    name,
    ...info,
    guide: content.guideRegions[name] || null,
    inGuide: Boolean(content.guideRegions[name]),
  }));
  res.json({ count: regions.length, regions });
});

api.get("/regions/:name", (req, res) => {
  const wanted = decodeURIComponent(req.params.name).toLowerCase();
  const hit = Object.keys(content.regionInfo).find(
    (n) => n.toLowerCase() === wanted,
  );
  if (!hit)
    return res
      .status(404)
      .json({ error: "Region not found", name: req.params.name });
  res.json({
    name: hit,
    ...content.regionInfo[hit],
    guide: content.guideRegions[hit] || null,
    inGuide: Boolean(content.guideRegions[hit]),
  });
});

api.get("/rome", (_req, res) => res.json(content.rome));

api.get("/rome/attractions/:id", (req, res) => {
  const hit = content.rome.attractions.find((a) => a.id === req.params.id);
  if (!hit)
    return res
      .status(404)
      .json({ error: "Attraction not found", id: req.params.id });
  res.json(hit);
});

/* ---------------------------------------------------------------------------
 * /api/image/:title?w=900
 *
 * Resolves a Wikipedia article title to its lead photograph, at roughly the
 * width the page actually needs, and redirects the browser there. Asking
 * Wikimedia for a sized thumbnail rather than the original matters: several of
 * these originals are 3840px wide, which makes a card grid crawl.
 *
 * Results are cached in memory per (title, width) so each is looked up once per
 * process. If the lookup fails (offline container, rate limit, unknown title)
 * we serve a generated SVG placeholder rather than a broken image.
 * ------------------------------------------------------------------------ */

const imageCache = new Map();
const IMAGE_TTL_MS = 12 * 60 * 60 * 1000;
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const USER_AGENT =
  "DiscoverItaly/1.0 (educational demo; local docker deployment)";
const ALLOWED_WIDTHS = [400, 900, 1600];

/** Snap an arbitrary ?w= to one of a few sizes, so the cache stays small. */
function normalizeWidth(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 900;
  return (
    ALLOWED_WIDTHS.find((w) => n <= w) ||
    ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
  );
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`upstream ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

async function resolveImage(title, width) {
  const key = `${title}@${width}`;
  const cached = imageCache.get(key);
  if (cached && Date.now() - cached.at < IMAGE_TTL_MS) return cached.url;

  let url = null;

  // Preferred: the Action API, which renders a thumbnail at the width we ask for.
  try {
    const params = new URLSearchParams({
      action: "query",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: String(width),
      format: "json",
      redirects: "1",
      titles: title,
    });
    const data = await fetchJson(`${WIKI_API}?${params}`);
    const page = Object.values(data?.query?.pages || {})[0];
    url = page?.thumbnail?.source || null;
  } catch (err) {
    console.warn(`pageimages failed for "${title}": ${err.message}`);
  }

  // Fallback: the REST summary endpoint, which serves the full-size original.
  if (!url) {
    const data = await fetchJson(WIKI_SUMMARY + encodeURIComponent(title));
    url = data?.originalimage?.source || data?.thumbnail?.source || null;
  }

  if (!url) throw new Error("no image on article");
  imageCache.set(key, { url, at: Date.now() });
  return url;
}

function placeholderSvg(label) {
  const safe = String(label).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1B2742"/><stop offset="1" stop-color="#0E1729"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <g fill="none" stroke="#C9A227" stroke-opacity="0.25">
    <circle cx="400" cy="215" r="86"/><circle cx="400" cy="215" r="60"/>
  </g>
  <text x="400" y="228" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#C9A227">IT</text>
  <text x="400" y="340" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="24" fill="#EDE3CF" opacity="0.85">${safe}</text>
  <text x="400" y="374" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="14" fill="#EDE3CF" opacity="0.45">image unavailable offline</text>
</svg>`;
}

/**
 * Every Wikipedia title referenced anywhere in the content, found by walking the
 * tree for `wiki` keys. Used to warm the cache at boot.
 */
function collectWikiTitles(node, found = new Set()) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectWikiTitles(item, found));
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "wiki" && typeof value === "string") found.add(value);
      else collectWikiTitles(value, found);
    }
  }
  return found;
}

/**
 * Warm the cache for a whole set of titles in ONE request.
 *
 * The Action API takes up to 50 titles at a time, which turns ~30 round trips
 * into one and keeps us well clear of Wikipedia's rate limit. It answers with
 * canonical titles, so `normalized` and `redirects` are followed back to map
 * each result onto the title we actually asked for.
 */
async function prewarmBatch(titles, width) {
  const params = new URLSearchParams({
    action: "query",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(width),
    pilimit: "50",
    format: "json",
    redirects: "1",
    titles: titles.join("|"),
  });

  const data = await fetchJson(`${WIKI_API}?${params}`);
  const query = data?.query || {};

  // canonical title -> thumbnail url
  const byTitle = new Map();
  for (const page of Object.values(query.pages || {})) {
    if (page?.thumbnail?.source) byTitle.set(page.title, page.thumbnail.source);
  }

  // requested spelling -> canonical title, in the order Wikipedia applies them
  const rename = new Map();
  for (const step of [
    ...(query.normalized || []),
    ...(query.redirects || []),
  ]) {
    rename.set(step.from, step.to);
  }
  const canonical = (title) => {
    let name = title;
    for (let hops = 0; hops < 4 && rename.has(name); hops += 1)
      name = rename.get(name);
    return name;
  };

  let warmed = 0;
  for (const title of titles) {
    const url =
      byTitle.get(canonical(title)) ||
      byTitle.get(canonical(title.replace(/_/g, " ")));
    if (url) {
      imageCache.set(`${title}@${width}`, { url, at: Date.now() });
      warmed += 1;
    }
  }
  return warmed;
}

/**
 * Resolve every image up front, in the background. Without this the first
 * visitor waits on ~30 Wikipedia lookups while the page renders; with it,
 * their requests hit a warm cache. Failures are ignored — a cache miss simply
 * falls back to the on-demand path, which has its own placeholder.
 */
async function prewarmImages() {
  const titles = [...collectWikiTitles(content)];
  const widths = [900, 400];
  const started = Date.now();
  let warmed = 0;

  for (const width of widths) {
    for (let i = 0; i < titles.length; i += 50) {
      try {
        warmed += await prewarmBatch(titles.slice(i, i + 50), width);
      } catch (err) {
        console.warn(`prewarm batch failed (w=${width}): ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `  images: warmed ${warmed}/${titles.length * widths.length} in ${secs}s`,
  );
}

api.get("/image/:title", async (req, res) => {
  const title = req.params.title;
  const width = normalizeWidth(req.query.w);
  const label = (req.query.label || title.replace(/_/g, " "))
    .toString()
    .slice(0, 80);
  try {
    const url = await resolveImage(title, width);
    res.set("Cache-Control", "public, max-age=86400");
    return res.redirect(302, url);
  } catch (err) {
    console.warn(`image lookup failed for "${title}": ${err.message}`);
    res.set("Cache-Control", "public, max-age=60");
    res.type("image/svg+xml");
    return res.status(200).send(placeholderSvg(label));
  }
});

app.use("/api", api);

/* ===========================================================================
 * Health check (used by Docker HEALTHCHECK)
 * ======================================================================== */

app.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    imagesCached: imageCache.size,
    node: process.version,
  });
});

/* ===========================================================================
 * Static assets
 * ======================================================================== */

// d3 + topojson served from node_modules, so the page never needs a CDN.
app.use(
  "/vendor/d3.min.js",
  express.static(path.join(__dirname, "node_modules/d3/dist/d3.min.js"), {
    maxAge: "30d",
    immutable: true,
  }),
);
app.use(
  "/vendor/topojson-client.min.js",
  express.static(
    path.join(
      __dirname,
      "node_modules/topojson-client/dist/topojson-client.min.js",
    ),
    {
      maxAge: "30d",
      immutable: true,
    },
  ),
);

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
    extensions: ["html"],
  }),
);

/* ===========================================================================
 * Fallbacks
 * ======================================================================== */

app.use((req, res) => {
  if (req.accepts("html")) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, "public", "404.html"), (err) => {
        if (err) res.status(404).type("txt").send("404 — Not found");
      });
  }
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`\n  🇮🇹  Discover Italy — running on http://localhost:${PORT}`);
  console.log(
    `      source document: ${content.meta.sourceDocument} (${content.meta.pages} pages)`,
  );
  console.log(`      api:             http://localhost:${PORT}/api\n`);

  // Warm the photo cache behind the scenes. Never blocks serving.
  if (process.env.PREWARM_IMAGES !== "0") {
    prewarmImages().catch((err) =>
      console.warn(`prewarm stopped: ${err.message}`),
    );
  }
});

// Docker sends SIGTERM on `docker stop`; shut down cleanly so it doesn't wait 10s.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`\n${signal} received — closing server.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}

module.exports = app;
