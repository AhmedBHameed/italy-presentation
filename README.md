# Discover Italy 🇮🇹

An interactive first-time travel guide to Italy, rebuilt to follow the source document from cover to
last page. It is read **top to bottom** — nine chapters, each one handing over to the next. There is
no menu and there are no jump links, so the guide plays like a presentation rather than a website you
have to navigate.

## The nine chapters

| # | Chapter | What is in it |
| --- | --- | --- |
| **cover** | **Italy** | The country drawn as its own flag, the lede, and the four numbers that frame the trip. |
| **01** | **Twenty regions, five on the route** | The country introduction, then a d3 + TopoJSON atlas of all 20 regions. The five on the route glow gold; clicking one zooms in, drops **city pins onto the map itself**, and opens its dossier — region → city chain, recommended days, and which chapter it turns up in. |
| **02** | **Planning the trip** | The three core decisions, then the four planning decisions: a season selector wired to a twelve-month strip with crowd/price meters (September folded into the shoulder tab), a 7–10 vs 10–14 day itinerary toggle, the budget, and the booking order. |
| **03** | **Rome, the Eternal City** | The five landmarks in the document's own order — Colosseum, Trevi, Pantheon, Vatican City, Spanish Steps — each opening a full dossier, including a working Trevi coin toss. |
| **04** | **Inside Vatican City** | A hand-drawn interactive plan with six clickable hotspots, the nine Genesis scenes on the Sistine ceiling, and the four Michelangelo masterpieces. |
| **05** | **Rome on foot** | The walking route with real distances (6.55 km end to end), where to stay, how to get around, and the food. |
| **06** | **Florence & Pisa** | Tuscany: how to travel from Rome, the Duomo, the Uffizi, Piazza dei Miracoli, and where to stay. |
| **07** | **Venice** | The best order to see it, the Bridge of Sighs and its two legends, the Grand Canal, the Rialto, and how to move without roads. |
| **08** | **Milan** | The Duomo, the Galleria and its bull mosaic, The Last Supper, La Scala, San Siro — and the four ways to reach Naples. |
| **09** | **Naples & the Amalfi Coast** | Where the route ends: Naples, Positano, Amalfi, and the food. |

Both a **dark** and a **light** theme ship with the site. The switch sits in the top bar, the choice is
remembered, and an unvisited reader gets whichever their system prefers.

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

## Offline by default

Every photograph and every typeface is stored in the repository, so the guide runs with **no outbound
network at all** — verified by loading it with every non-local request blocked.

```bash
npm run images          # fetch anything missing into public/img/
npm run images:force    # re-download everything
npm run fonts           # re-fetch the three typefaces into public/fonts/
```

`scripts/fetch-images.js` walks `src/content.js` for `wiki:` keys, asks Wikimedia for each article's
lead photograph at the two widths the page uses (400 px thumbnails, 1200 px everything else), saves
them under `public/img/`, and writes `public/img/manifest.json`.

At request time `/api/image/:title` resolves in three tiers:

1. the downloaded file, redirected to an immutable `/img/…` URL — the normal path;
2. a live Wikipedia lookup, cached in memory, for anything the download missed;
3. a generated SVG placeholder, so a missing photo is never a broken image.

Set `PREWARM_IMAGES=0` to skip the boot-time warm-up of tier 2.

`scripts/fetch-fonts.js` does the same job for Fraunces, Inter and JetBrains Mono: it pulls the woff2
subsets and writes `public/fonts/fonts.css`, which the page links instead of Google Fonts.

## How it is put together

```
server.js                      Express server + JSON API + three-tier image resolver
src/content.js                 the entire guide as structured data, chapters included
scripts/fetch-images.js        downloads every photograph for offline use
scripts/fetch-fonts.js         downloads the typefaces for offline use
public/index.html              page shell — every section is filled in by JS
public/css/styles.css          the design system, as two themes over one token set
public/js/ui.js                DOM helpers, modal, reveal-on-scroll, theme switch, reading position
public/js/map.js               the d3 atlas (regions, city pins, flag-filled cover map)
public/js/app.js               renders the chapters from /api/content
public/data/*.topo.json        TopoJSON boundaries of the 20 regions
public/img/                    the photographs + manifest.json
public/fonts/                  the typefaces + generated @font-face sheet
Dockerfile                     multi-stage build, non-root, healthchecked
```

There is no build step and no front-end framework. `d3` and `topojson-client` are served straight out
of `node_modules` at `/vendor/…`, so the page never depends on a CDN.

All content lives in `src/content.js` — including the `chapters` array that defines the reading order.
Edit that one file and the whole site follows; nothing is hard-coded in the HTML.

## The API

The guide is available as JSON; the front end boots from `/api/content`.

| Endpoint | What it returns |
| --- | --- |
| `GET /api/content` | everything in one payload |
| `GET /api/chapters` | the reading order |
| `GET /api/overview` | the country introduction |
| `GET /api/regions` | all 20 regions, flagged with `inGuide`, with city pins |
| `GET /api/regions/:name` | one region + its route chain |
| `GET /api/planning` | seasons, budget, trip lengths, booking order |
| `GET /api/rome` | Rome, its attractions, walking route, stays, transport and food |
| `GET /api/rome/attractions/:id` | one attraction (`colosseum`, `trevi`, `pantheon`, `vatican`, `spanish-steps`) |
| `GET /api/vatican` | hotspots, the Sistine ceiling, masterpieces |
| `GET /api/destinations` | the four stops after Rome |
| `GET /api/destinations/:id` | one stop (`tuscany`, `venice`, `milan`, `naples`) |
| `GET /api/image/:title?w=` | see above |
| `GET /healthz` | liveness, used by the Docker healthcheck |

---

Built by [Ahmed Hameed](https://ahmedhameed.dev).
