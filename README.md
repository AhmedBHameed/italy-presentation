# Discover Italy 🇮🇹

An interactive learning website built from **Italy.pdf**. Every fact on the page is
transcribed from that document, and every block carries the page it came from.

- A clickable **atlas of all 20 Italian regions** (d3 + TopoJSON) — zoom into any region for
  its dossier. The five regions the PDF names glow gold and open the guide's
  region → city chains.
- A **trip planner** — the three travel seasons mapped onto a twelve-month strip, with
  crowd/price meters, the September verdict, and the 7-day vs 10-day itineraries. Clicking
  an itinerary stop flies the map to that region.
- **Rome's five landmarks** as clickable photo cards, each opening a dossier of the exact
  facts the PDF records. The Trevi Fountain card includes a working coin-toss.
- An **interactive plan of Vatican City** with six clickable hotspots, plus the four
  Michelangelo masterpieces the PDF shows.
- A **ten-question quiz**, every answer checkable against a cited PDF page.

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
src/content.js                 Italy.pdf transcribed into structured data
public/index.html              page shell — sections are filled in by JS
public/css/styles.css          the whole design system
public/js/ui.js                DOM helpers, modal, reveal-on-scroll, nav
public/js/map.js               the d3 atlas (regions + hero silhouette)
public/js/app.js               renders every section from /api/content
public/data/*.topo.json        TopoJSON boundaries of the 20 regions
Dockerfile                     multi-stage build, non-root, healthchecked
```

There is no build step and no front-end framework. `d3` and `topojson-client` are served
straight out of `node_modules` at `/vendor/…`, so the page never depends on a CDN.

## The API

The whole document is available as JSON — the front end boots from `/api/content`.

| Endpoint                        | What it returns                                                               |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `GET /api/content`              | everything in one payload                                                     |
| `GET /api/overview`             | the country introduction (PDF p.1)                                            |
| `GET /api/regions`              | all 20 regions, flagged with `inGuide`                                        |
| `GET /api/regions/:name`        | one region + its guide chain                                                  |
| `GET /api/planning`             | seasons, best month, trip lengths (PDF pp.1–2)                                |
| `GET /api/rome`                 | Rome and its five attractions                                                 |
| `GET /api/rome/attractions/:id` | one attraction (`colosseum`, `trevi`, `pantheon`, `vatican`, `spanish-steps`) |
| `GET /api/vatican`              | hotspots and masterpieces (PDF pp.6–17)                                       |
| `GET /api/quiz`                 | the ten questions                                                             |
| `GET /api/image/:title?w=`      | see below                                                                     |
| `GET /healthz`                  | liveness, used by the Docker healthcheck                                      |

### `/api/image/:title`

Photographs are not bundled. The server resolves a Wikipedia article title to its lead
photograph at the width the page actually asked for (`w=400`, `900` or `1600`), caches the
result in memory, and 302-redirects the browser to Wikimedia.

That keeps the repository small and the images correctly licensed. It also degrades
gracefully: **if the lookup fails — no outbound network, rate limit, unknown title — the
server returns a generated SVG placeholder** rather than a broken image, so the site still
works fully offline apart from the photography.

## Notes on the data

Every fact is from `Italy.pdf` **except** the population and area figures in the region
dossiers. Those are rounded approximations included so the map has something to show for
all 20 regions; they are labelled as such in the dossier and in `meta.disclaimer`.
