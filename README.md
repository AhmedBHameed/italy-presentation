# Discover Italy 🇮🇹

An interactive first-time travel guide to Italy — a clickable atlas, a trip planner, and the full
route from Rome to the Amalfi Coast.

## What's in it

| Chapter | What it does |
| --- | --- |
| **01 · A country of twenty stories** | The introduction, with clickable landmark chips. |
| **02 · Twenty regions, five on the route** | A d3 + TopoJSON map of all 20 regions. The five on the route glow gold; clicking one zooms in, drops **city pins onto the map itself**, and opens its dossier with the region → city chain, recommended days, and a jump straight to that chapter. |
| **03 · Planning** | The three core decisions, then the four planning decisions: an interactive season selector wired to a twelve-month strip with crowd/price meters (September folded into the shoulder tab), a 7–10 vs 10–14 day itinerary toggle whose stops fly the map to their region, the budget, and the booking order. |
| **04 · Rome** | Five landmark cards opening full dossiers — including a working Trevi coin toss — plus the walking route with real distances (6.55 km), where to stay, transport, and the food. |
| **05 · Vatican City** | A hand-drawn interactive plan with six clickable hotspots, the nine Genesis scenes on the Sistine ceiling, and the four Michelangelo masterpieces. |
| **06 · The rest of the route** | Florence & Pisa, Venice, Milan, and Naples & the Amalfi Coast — each a full page with attractions, travel options, suggested order, where to stay, transport and food. |

## Run it

### With Docker (recommended)

```bash
docker compose up --build
# or:
docker build -t discover-italy .
docker run --rm -p 4041:4041 discover-italy
```

Then open <http://localhost:4041>.

### Without Docker

```bash
npm install
npm start        # or: npm run dev   (node --watch)
```

## How it is put together

```
server.js                      Express server + JSON API + image resolver
src/content.js                 the entire guide as structured data
public/index.html              page shell — every section is filled in by JS
public/css/styles.css          the whole design system
public/js/ui.js                DOM helpers, modal, reveal-on-scroll, nav
public/js/map.js               the d3 atlas (regions, city pins, hero silhouette)
public/js/app.js               renders every section from /api/content
public/data/*.topo.json        TopoJSON boundaries of the 20 regions
Dockerfile                     multi-stage build, non-root, healthchecked
```

There is no build step and no front-end framework. `d3` and `topojson-client` are served straight
out of `node_modules` at `/vendor/…`, so the page never depends on a CDN.

All content lives in `src/content.js`. Edit that one file and the whole site follows — nothing is
hard-coded in the HTML.

## The API

The guide is available as JSON; the front end boots from `/api/content`.

| Endpoint | What it returns |
| --- | --- |
| `GET /api/content` | everything in one payload |
| `GET /api/overview` | the country introduction |
| `GET /api/regions` | all 20 regions, flagged with `inGuide`, with city pins |
| `GET /api/regions/:name` | one region + its route chain |
| `GET /api/planning` | seasons, budget, trip lengths, booking order |
| `GET /api/rome` | Rome, its attractions, walking route, stays, transport and food |
| `GET /api/rome/attractions/:id` | one attraction (`colosseum`, `trevi`, `pantheon`, `vatican`, `spanish-steps`) |
| `GET /api/vatican` | hotspots, the Sistine ceiling, masterpieces |
| `GET /api/destinations` | the four post-Rome stops |
| `GET /api/destinations/:id` | one stop (`tuscany`, `venice`, `milan`, `naples`) |
| `GET /api/image/:title?w=` | see below |
| `GET /healthz` | liveness, used by the Docker healthcheck |

### `/api/image/:title`

Photographs are not bundled. The server resolves a Wikipedia article title to its lead photograph at
the width the page asked for (`w=400`, `900` or `1600`), caches it, and 302-redirects the browser to
Wikimedia. That keeps the repository small and the images correctly licensed.

Two details make it fast and safe:

- **Warm on boot.** All titles are resolved in a single batched Action-API call per width — 118 image
  variants in about 3 seconds — so the first visitor hits a warm cache instead of waiting on ~60
  round trips.
- **Never broken.** If a lookup fails (no outbound network, rate limit, unknown title) the server
  returns a generated SVG placeholder rather than a broken image, so the site still works fully
  offline apart from the photography.

Set `PREWARM_IMAGES=0` to skip the warm-up.

---

Built by [Ahmed Hameed](https://ahmedhameed.dev).
