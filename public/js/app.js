/* ===========================================================================
   app.js — boots the page from /api/content and renders every section.
   ======================================================================== */

/* global UI, ItalyMap */

(() => {
  'use strict';

  const { $, $$, esc, rich, imgTag } = UI;

  /** Which map region a place name belongs to, for cross-linking. */
  const PLACE_TO_REGION = {
    Rome: 'Lazio',
    Milan: 'Lombardia',
    Naples: 'Campania',
    'Amalfi Coast': 'Campania',
    Positano: 'Campania',
    Amalfi: 'Campania',
    Florence: 'Toscana',
    Pisa: 'Toscana',
    Siena: 'Toscana',
    Tuscany: 'Toscana',
    Venice: 'Veneto',
    Verona: 'Veneto',
  };

  const PLACE_TO_WIKI = {
    Rome: 'Rome',
    Milan: 'Milan',
    Naples: 'Naples',
    'Amalfi Coast': 'Amalfi_Coast',
    Positano: 'Positano',
    Amalfi: 'Amalfi',
    Florence: 'Florence',
    Pisa: 'Leaning_Tower_of_Pisa',
    Siena: 'Siena',
    // The 'Tuscany' article leads with a locator map; this leads with cypress hills.
    Tuscany: "Val_d'Orcia",
    Venice: 'Venice',
    Verona: 'Verona',
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let DATA = null;

  /* ======================================================================
   * Boot
   * =================================================================== */

  async function boot() {
    const bootNote = $('#bootNote');
    try {
      const [content] = await Promise.all([
        fetch('/api/content').then((r) => {
          if (!r.ok) throw new Error(`content ${r.status}`);
          return r.json();
        }),
        ItalyMap.load(),
      ]);
      DATA = content;

      bootNote.textContent = 'drawing the atlas…';

      renderHero();
      renderStory();
      renderAtlas();
      renderAmalfi();
      renderPlanning();
      renderRome();
      renderVatican();
      renderDestinations();
      renderColophon();

      UI.initChrome();
      UI.observeReveals();
      ItalyMap.drawHeroSilhouette('#heroSilhouette');

      requestAnimationFrame(() => $('#boot').classList.add('done'));
    } catch (err) {
      console.error(err);
      bootNote.textContent = `could not load: ${err.message}`;
    }
  }

  /* ======================================================================
   * 1 · Hero + story
   * =================================================================== */

  function renderHero() {
    const o = DATA.overview;
    $('#heroKicker').textContent = DATA.meta.subtitle;
    $('#heroLede').textContent = o.lede;
    $('#heroFigures').innerHTML = o.keyFigures
      .map(
        (f) => `
      <div class="figure">
        <div class="figure-value">${esc(f.value)}</div>
        <div class="figure-label">${esc(f.label)}</div>
        <div class="figure-note">${esc(f.note)}</div>
      </div>`
      )
      .join('');
  }

  function renderStory() {
    const o = DATA.overview;
    $('#storyProse').innerHTML = o.body.map((p) => `<p>${esc(p)}</p>`).join('');

    $('#landmarkChips').innerHTML = o.landmarks
      .map(
        (l) => `
      <button class="landmark-chip" data-wiki="${esc(l.wiki)}" data-name="${esc(l.name)}">
        ${imgTag(l.wiki, l.name, 400)}
        <span>${esc(l.name)}</span>
      </button>`
      )
      .join('');

    $('#landmarkChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.landmark-chip');
      if (chip) UI.openImage(chip.dataset.wiki, chip.dataset.name, 'One of Italy’s most famous landmarks.');
    });
  }

  /* ======================================================================
   * 2 · The atlas
   * =================================================================== */

  function renderAtlas() {
    const guideNames = Object.keys(DATA.guideRegions).sort(
      (a, b) => DATA.guideRegions[a].order - DATA.guideRegions[b].order
    );

    ItalyMap.init({
      guideRegions: guideNames,
      cityPins: DATA.cityPins,
      onSelect: (name) => (name ? showDossier(name) : hideDossier()),
    });

    $('#guideShortcuts').innerHTML =
      '<div class="shortcut-label">The route, in order</div>' +
      guideNames
        .map(
          (n, i) =>
            `<button data-region="${esc(n)}"><i>${i + 1}</i>${esc(DATA.guideRegions[n].displayName)}</button>`
        )
        .join('');

    $('#guideShortcuts').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-region]');
      if (btn) ItalyMap.select(btn.dataset.region);
    });

    $('#dossier').addEventListener('click', (e) => {
      const card = e.target.closest('.city-card');
      if (card) {
        UI.openImage(card.dataset.wiki, card.dataset.name, card.dataset.note);
        return;
      }
      const jump = e.target.closest('[data-jump]');
      if (jump) {
        const { jump: sectionId, dest } = jump.dataset;
        UI.scrollToEl(`#${sectionId}`);
        if (dest) setTimeout(() => selectDestination(dest), 500);
      }
    });
  }

  function showDossier(name) {
    const info = DATA.regionInfo[name];
    if (!info) return;
    const guide = DATA.guideRegions[name] || null;

    const chainHtml = guide
      ? `<div class="city-chain">${guide.chain
          .map(
            (node, i) =>
              (i ? '<span class="arrow">→</span>' : '') +
              `<span class="node${i === 0 ? ' head' : ''}">${esc(node)}</span>`
          )
          .join('')}</div>`
      : '';

    const citiesHtml = guide
      ? `<div class="city-cards">${guide.cities
          .map(
            (c) => `
        <button class="city-card" data-wiki="${esc(c.wiki)}" data-name="${esc(c.name)}" data-note="${esc(c.note)}">
          ${imgTag(c.wiki, c.name, 400)}
          <span>
            <b>${esc(c.name)}</b>
            <small>${esc(c.note)}</small>
          </span>
        </button>`
          )
          .join('')}</div>`
      : '';

    const highlightsHtml =
      guide && guide.highlights?.length
        ? `<div class="dossier-label">What you came for</div>
           <div class="highlight-chips">
             ${guide.highlights.map((h) => `<span>${esc(h)}</span>`).join('')}
           </div>`
        : '';

    const jumpHtml = guide
      ? `<button class="btn btn-primary btn-sm dossier-jump" data-jump="${esc(guide.sectionId)}"
                 ${guide.destinationId ? `data-dest="${esc(guide.destinationId)}"` : ''}>
           Open the chapter →
         </button>`
      : '';

    $('#dossier').innerHTML = `
      <div class="eyebrow">Regione</div>
      ${
        guide
          ? `<div class="badge-row">
               <span class="badge-guide">★ stop ${guide.order} on the route</span>
               <span class="badge-days">${esc(guide.days)}</span>
             </div>`
          : '<div class="badge-row"><span class="badge-off">not on this route</span></div>'
      }
      <h3 class="dossier-name">${esc(ItalyMap.shortName(name))}</h3>
      <div class="dossier-sub">${esc(info.subtitle)}</div>

      ${guide ? `<p class="dossier-summary">${esc(guide.summary)}</p>` : ''}
      ${guide ? `<div class="dossier-label">Where the guide sends you</div>${chainHtml}${citiesHtml}` : ''}
      ${highlightsHtml}

      <div class="dossier-label">Field notes</div>
      <div class="dossier-text">${esc(info.fact)}</div>
      ${jumpHtml}
    `;
    $('#dossier').classList.add('visible');
    $('#infoEmpty').style.display = 'none';
  }

  function hideDossier() {
    $('#dossier').classList.remove('visible');
    $('#infoEmpty').style.display = '';
  }

  function renderAmalfi() {
    const a = DATA.amalfiNote;
    $('#amalfiNote').innerHTML = `
      <div class="amalfi-copy">
        <div class="eyebrow">Note</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.text)}</p>
        <div class="amalfi-badge">🏛 ${esc(a.badge)}</div>
      </div>
      <div class="amalfi-photo" data-wiki="${esc(a.wiki)}">${imgTag(a.wiki, a.title)}</div>
    `;
    $('#amalfiNote').addEventListener('click', (e) => {
      if (e.target.closest('.amalfi-photo')) UI.openImage(a.wiki, a.title, a.text);
    });
  }

  /* ======================================================================
   * 3 · Planning
   * =================================================================== */

  function renderPlanning() {
    const p = DATA.planning;

    $('#planningHeadline').textContent = p.headline;
    $('#planningLede').textContent = p.lede;
    $('#planningBody').textContent = p.body;
    $('#planningQuestion').textContent = p.question;
    $('#planningAnswer').textContent = p.answer;
    $('#seasonQuestion').textContent = p.seasonQuestion;
    $('#seasonIntro').textContent = p.seasonIntro;

    $('#corePoints').innerHTML = p.corePoints
      .map(
        (c) => `
      <div class="core-point">
        <div class="core-icon">${c.icon}</div>
        <b>${esc(c.label)}</b>
        <p>${esc(c.text)}</p>
      </div>`
      )
      .join('');

    $('#decisionGrid').innerHTML = p.decisions
      .map(
        (d) => `
      <div class="decision">
        <div class="decision-icon">${d.icon}</div>
        <b>${esc(d.label)}</b>
        <small>${esc(d.hint)}</small>
      </div>`
      )
      .join('');

    /* ---- Decision 01 · seasons ---- */
    $('#seasonTabs').innerHTML = p.seasons
      .map(
        (s) => `
      <button class="season-tab${s.recommended ? ' active' : ''}" data-season="${esc(s.id)}" role="tab">
        ${s.recommended ? '<span class="rec">best for most</span>' : ''}
        <b>${esc(s.name)}</b>
        <small>${esc(s.months)}</small>
      </button>`
      )
      .join('');

    $('#monthStrip').innerHTML = MONTHS.map(
      (m, i) => `<div class="month" data-month="${i}">${m}</div>`
    ).join('');

    const crowdWord = (n) => ['', 'fewest', 'fewer', 'busy', 'biggest'][n] || '—';
    const priceWord = (n) => ['', 'lowest', 'lower', 'high', 'highest'][n] || '—';

    function selectSeason(id) {
      const s = p.seasons.find((x) => x.id === id);
      if (!s) return;

      $$('.season-tab').forEach((t) => t.classList.toggle('active', t.dataset.season === id));

      const starMonth = s.bestMonth ? MONTHS.indexOf(s.bestMonth.month.slice(0, 3)) : -1;
      $$('.month').forEach((node) => {
        const i = Number(node.dataset.month);
        node.className =
          'month' +
          (s.monthIndices.includes(i) ? ` on ${s.tone}` : '') +
          (i === starMonth ? ' best' : '');
      });

      const best = s.bestMonth
        ? `<div class="best-month">
             <div class="best-month-head">
               <span class="star">★</span>
               <b>${esc(s.bestMonth.claim)}</b>
             </div>
             <ul>${s.bestMonth.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
           </div>`
        : '';

      $('#seasonDetail').innerHTML = `
        <div>
          <div class="season-headline">${esc(s.headline)}</div>
          <p>${esc(s.detail)}</p>
          <ul class="season-points">${s.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
          ${best}
        </div>
        <div class="meters">
          <div>
            <div class="meter-label"><span>Crowds</span><span>${crowdWord(s.crowds)}</span></div>
            <div class="meter-track"><i class="meter-fill" style="width:0"></i></div>
          </div>
          <div>
            <div class="meter-label"><span>Prices</span><span>${priceWord(s.price)}</span></div>
            <div class="meter-track"><i class="meter-fill" style="width:0"></i></div>
          </div>
          <div>
            <div class="meter-label"><span>Months covered</span><span>${s.monthIndices.length} of 12</span></div>
            <div class="meter-track"><i class="meter-fill" style="width:0"></i></div>
          </div>
        </div>`;

      const widths = [(s.crowds / 4) * 100, (s.price / 4) * 100, (s.monthIndices.length / 12) * 100];
      requestAnimationFrame(() => {
        $$('#seasonDetail .meter-fill').forEach((f, i) => (f.style.width = `${widths[i]}%`));
      });
    }

    $('#seasonTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.season-tab');
      if (tab) selectSeason(tab.dataset.season);
    });
    selectSeason((p.seasons.find((s) => s.recommended) || p.seasons[0]).id);

    /* ---- Decision 02 · how long ---- */
    $('#durationQuestion').textContent = p.durationQuestion;
    $('#durationAnswer').textContent = p.durationAnswer;
    $('#durationToggle').innerHTML = p.durations
      .map(
        (o, i) =>
          `<button data-duration="${esc(o.id)}" class="${i === 0 ? 'active' : ''}">${esc(o.days)} days</button>`
      )
      .join('');

    function selectDuration(id) {
      const o = p.durations.find((x) => x.id === id);
      if (!o) return;
      $$('#durationToggle button').forEach((b) => b.classList.toggle('active', b.dataset.duration === id));

      $('#durationDetail').innerHTML = `
        <div class="eyebrow">${esc(o.title)}${o.recommended ? ' · recommended' : ''}</div>
        <p class="summary">${esc(o.summary)}</p>
        <div class="itinerary">
          ${o.itineraries
            .map(
              (it) => `
            <div class="itin-row">
              <div class="itin-label">${esc(it.label)}</div>
              ${it.stops
                .map(
                  (stop, i) =>
                    (i ? '<span class="itin-arrow">→</span>' : '') +
                    `<button class="itin-stop" data-place="${esc(stop)}">
                       ${imgTag(PLACE_TO_WIKI[stop] || stop, stop, 400)}
                       <span>${esc(stop)}</span>
                     </button>`
                )
                .join('')}
            </div>`
            )
            .join('')}
        </div>`;
    }

    $('#durationToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-duration]');
      if (btn) selectDuration(btn.dataset.duration);
    });
    selectDuration(p.durations[0].id);

    // Clicking a stop flies the map to its region.
    $('#durationDetail').addEventListener('click', (e) => {
      const stop = e.target.closest('.itin-stop');
      if (!stop) return;
      const region = PLACE_TO_REGION[stop.dataset.place];
      if (!region) return;
      UI.scrollToEl('#regions');
      setTimeout(() => ItalyMap.select(region), 550);
    });

    /* ---- Cost ---- */
    $('#costPanel').innerHTML = `
      <div class="eyebrow">Decision 03</div>
      <h3>${esc(p.costQuestion)}</h3>
      <div class="cost-figure">${esc(p.cost.display)}</div>
      <p class="muted">${esc(p.cost.note)}</p>
      <div class="cost-bar">
        <span style="left:0">${p.cost.currency}0</span>
        <i></i>
        <span style="right:0">${p.cost.currency}4k</span>
      </div>`;
    requestAnimationFrame(() => {
      const bar = $('#costPanel .cost-bar i');
      if (bar) {
        bar.style.left = `${(p.cost.low / 4000) * 100}%`;
        bar.style.width = `${((p.cost.high - p.cost.low) / 4000) * 100}%`;
      }
    });

    /* ---- Booking order ---- */
    $('#bookingPanel').innerHTML = `
      <div class="eyebrow">Decision 04</div>
      <h3>${esc(p.bookingQuestion)}</h3>
      <p class="muted">${esc(p.bookingAnswer)}</p>
      <ol class="booking-steps">
        ${p.bookingSteps
          .map(
            (s) => `
          <li>
            <span class="step-n">${s.n}</span>
            <span class="step-icon">${s.icon}</span>
            <span><b>${esc(s.label)}</b><small>${esc(s.text)}</small></span>
          </li>`
          )
          .join('')}
      </ol>`;
  }

  /* ======================================================================
   * 4 · Rome
   * =================================================================== */

  function renderRome() {
    const r = DATA.rome;
    $('#romeTitle').textContent = r.title;
    $('#romeRegion').textContent = r.region;
    $('#romeDays').textContent = r.days;
    $('#romeIntro').textContent = r.intro;

    $('#attractionGrid').innerHTML = r.attractions
      .map(
        (a) => `
      <button class="card reveal" data-attraction="${esc(a.id)}">
        <div class="card-media">
          <span class="card-number">${a.number}</span>
          ${a.quickStat ? `<span class="card-stat"><b>${esc(a.quickStat.value)}</b><small>${esc(a.quickStat.label)}</small></span>` : ''}
          ${imgTag(a.hero.wiki, a.name)}
        </div>
        <div class="card-body">
          <div class="card-italian">${esc(a.italian)}</div>
          <div class="card-title">${esc(a.name)}</div>
          <div class="card-tagline">${esc(a.tagline)}</div>
          <span class="card-cta">Open</span>
        </div>
      </button>`
      )
      .join('');

    $('#attractionGrid').addEventListener('click', (e) => {
      const card = e.target.closest('[data-attraction]');
      if (card) openAttraction(card.dataset.attraction);
    });

    /* ---- Walking route ---- */
    $('#walkTitle').textContent = r.walkTitle;
    $('#walkIntro').textContent = r.walkIntro;
    $('#walkTotal').innerHTML = `
      <b>${r.walkTotal.km} km</b>
      <small>${esc(r.walkTotal.minutes)} min walking</small>`;

    $('#walkRoute').innerHTML = r.walkingRoute
      .map((node) =>
        node.leg
          ? `<div class="walk-leg">
               <span class="walk-line"></span>
               <span class="walk-leg-text">${node.leg.km} km · ${esc(node.leg.time)}</span>
             </div>`
          : `<button class="walk-stop" data-wiki="${esc(node.wiki)}" data-name="${esc(node.name)}">
               ${imgTag(node.wiki, node.name, 400)}
               <span>${esc(node.name)}</span>
             </button>`
      )
      .join('');

    $('#walkRoute').addEventListener('click', (e) => {
      const stop = e.target.closest('.walk-stop');
      if (stop) UI.openImage(stop.dataset.wiki, stop.dataset.name, '');
    });

    /* ---- Where to stay ---- */
    $('#stayTitle').textContent = r.stayTitle;
    $('#stayGrid').innerHTML = renderStayCards(r.stayAreas);
    $('#stayGrid').addEventListener('click', (e) => {
      const card = e.target.closest('[data-wiki]');
      if (card) UI.openImage(card.dataset.wiki, card.dataset.name, '');
    });

    /* ---- Transport ---- */
    $('#transportTitle').textContent = r.transportTitle;
    $('#transportIntro').textContent = r.transportIntro;
    $('#transportList').innerHTML = renderTransport(r.transport);

    /* ---- Food ---- */
    $('#foodTitle').textContent = r.foodTitle;
    $('#foodIntro').textContent = r.foodIntro;
    $('#foodGrid').innerHTML = r.food
      .map(
        (f) => `
      <button class="food-item" data-wiki="${esc(f.wiki)}" data-name="${esc(f.name)}">
        <div class="food-media">${imgTag(f.wiki, f.name, 400)}</div>
        <span>${esc(f.name)}</span>
      </button>`
      )
      .join('');
    $('#foodGrid').addEventListener('click', (e) => {
      const item = e.target.closest('.food-item');
      if (item) UI.openImage(item.dataset.wiki, item.dataset.name, '');
    });
  }

  function renderStayCards(areas) {
    return areas
      .map(
        (s) => `
      <div class="stay-card" data-wiki="${esc(s.wiki)}" data-name="${esc(s.name)}">
        <div class="stay-media">${imgTag(s.wiki, s.name, 400)}</div>
        <div class="stay-copy">
          ${s.badge ? `<span class="stay-badge">${esc(s.badge)}</span>` : ''}
          <b>${esc(s.name)}</b>
          ${s.subtitle ? `<small class="stay-sub">${esc(s.subtitle)}</small>` : ''}
          <p>${esc(s.text)}</p>
          ${s.hotel ? `<div class="stay-hotel">🏨 ${esc(s.hotel)}</div>` : ''}
        </div>
      </div>`
      )
      .join('');
  }

  function renderTransport(list) {
    return list
      .map(
        (t) => `
      <div class="transport-item">
        <span class="t-icon">${t.icon}</span>
        <span><b>${esc(t.name)}</b><small>${esc(t.text)}</small></span>
      </div>`
      )
      .join('');
  }

  function openAttraction(id) {
    const a = DATA.rome.attractions.find((x) => x.id === id);
    if (!a) return;

    const facts = a.facts?.length
      ? `<div class="modal-sub">Interesting facts</div>
         <ul class="fact-list">
           ${a.facts.map((f) => `<li><span class="ficon">${f.icon}</span><span>${rich(f.text)}</span></li>`).join('')}
         </ul>`
      : '';

    const legend = a.legend
      ? `<div class="coin-game">
           <h4>${esc(a.legendTitle)}</h4>
           <p class="muted">Choose how many coins to throw.</p>
           <div class="coin-buttons">
             ${a.legend
               .map(
                 (l) => `<button class="coin-btn" data-coins="${l.coins}">${l.icon} ${l.coins} coin${l.coins > 1 ? 's' : ''}</button>`
               )
               .join('')}
           </div>
           <div class="coin-outcome" id="coinOutcome"></div>
         </div>`
      : '';

    const gallery = a.gallery?.length
      ? `<div class="modal-sub">Gallery — click to enlarge</div>
         <div class="modal-gallery">
           ${a.gallery
             .map(
               (g) => `<figure data-wiki="${esc(g.wiki)}" data-caption="${esc(g.caption)}">
                         ${imgTag(g.wiki, g.caption, 400)}
                         <figcaption>${esc(g.caption)}</figcaption>
                       </figure>`
             )
             .join('')}
         </div>`
      : '';

    const deepDive = a.hasDeepDive
      ? `<p style="margin-top:26px"><a class="btn btn-ghost btn-sm" href="#vatican" data-close>Explore the Vatican plan →</a></p>`
      : '';

    UI.openModal(`
      <div class="modal-hero">
        ${imgTag(a.hero.wiki, a.hero.caption, 1600)}
        <div class="modal-hero-cap">
          <div class="modal-italian">${esc(a.italian)}</div>
          <h2>${esc(a.name)}</h2>
        </div>
      </div>
      <div class="modal-content">
        <p class="modal-lead">${esc(a.description)}</p>
        ${legend}
        ${facts}
        ${gallery}
        ${deepDive}
      </div>
    `);

    $$('#modalBody .modal-gallery figure').forEach((fig) => {
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', () => UI.openImage(fig.dataset.wiki, a.name, fig.dataset.caption));
    });

    const outcome = $('#coinOutcome');
    if (outcome) {
      $$('#modalBody .coin-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = Number(btn.dataset.coins);
          const entry = a.legend.find((l) => l.coins === n);
          $$('#modalBody .coin-btn').forEach((b) => b.classList.toggle('active', b === btn));
          outcome.classList.remove('show');
          outcome.innerHTML = `<span class="coins">${entry.icon}</span><span>${rich(entry.text)}</span>`;
          requestAnimationFrame(() => outcome.classList.add('show'));
        });
      });
    }
  }

  /* ======================================================================
   * 5 · Vatican City
   * =================================================================== */

  function renderVatican() {
    const v = DATA.vatican;
    $('#vaticanTitle').textContent = v.title;
    $('#vaticanIntro').textContent = v.intro;

    $('#planHotspots').innerHTML = v.hotspots
      .map((h) => {
        const lab = h.label || { anchor: 'middle', dx: 0, dy: 5.6 };
        return `
        <g class="hotspot" data-hotspot="${esc(h.id)}" role="button" tabindex="0" aria-label="${esc(h.name)}">
          <circle class="hs-halo" cx="${h.x}" cy="${h.y}" r="4.2"/>
          <circle class="hs-dot"  cx="${h.x}" cy="${h.y}" r="1.5"/>
          <text x="${h.x + lab.dx}" y="${h.y + lab.dy}" text-anchor="${esc(lab.anchor)}">${esc(h.name)}</text>
        </g>`;
      })
      .join('');

    function showHotspot(id) {
      const h = v.hotspots.find((x) => x.id === id);
      if (!h) return;

      $$('.hotspot').forEach((g) => g.classList.toggle('active', g.dataset.hotspot === id));

      $('#planInfo').innerHTML = `
        <div class="eyebrow">Vatican City</div>
        <h3>${esc(h.name)}</h3>
        <div class="italian">${esc(h.italian)}</div>
        <p>${esc(h.blurb)}</p>
        <div class="plan-gallery">
          ${h.gallery
            .map(
              (g) => `<button data-wiki="${esc(g.wiki)}" data-caption="${esc(g.caption)}" title="${esc(g.caption)}">
                        ${imgTag(g.wiki, g.caption, 400)}
                        <figcaption>${esc(g.caption)}</figcaption>
                      </button>`
            )
            .join('')}
        </div>`;
    }

    $('#vaticanPlan').addEventListener('click', (e) => {
      const spot = e.target.closest('.hotspot');
      if (spot) showHotspot(spot.dataset.hotspot);
    });
    $('#vaticanPlan').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const spot = e.target.closest('.hotspot');
      if (spot) {
        e.preventDefault();
        showHotspot(spot.dataset.hotspot);
      }
    });

    $('#planInfo').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-wiki]');
      if (btn) UI.openImage(btn.dataset.wiki, btn.dataset.caption, '');
    });

    showHotspot('basilica');

    /* ---- The Sistine ceiling: nine scenes ---- */
    const c = v.ceiling;
    $('#ceilingPanel').innerHTML = `
      <div class="ceiling-copy">
        <div class="eyebrow">Nine scenes from Genesis</div>
        <h3>${esc(c.title)}</h3>
        <p class="muted">${esc(c.intro)}</p>
        <ol class="scene-list">
          ${c.scenes
            .map(
              (s, i) =>
                `<li class="${i === c.famousIndex ? 'famous' : ''}"><span class="scene-n">${String(i + 1).padStart(2, '0')}</span>${esc(s)}${
                  i === c.famousIndex ? '<span class="scene-tag">most famous</span>' : ''
                }</li>`
            )
            .join('')}
        </ol>
        <p class="ceiling-outro">${esc(c.outro)}</p>
      </div>
      <button class="ceiling-photo" data-wiki="${esc(c.wiki)}">
        ${imgTag(c.wiki, c.title)}
      </button>`;

    $('#ceilingPanel').addEventListener('click', (e) => {
      if (e.target.closest('.ceiling-photo')) UI.openImage(c.wiki, c.title, c.intro);
    });

    /* ---- Masterpieces ---- */
    $('#masterpieceRow').innerHTML = v.masterpieces
      .map(
        (m) => `
      <button class="masterpiece" data-id="${esc(m.id)}">
        ${imgTag(m.wiki, m.title)}
        <span class="masterpiece-cap">
          <b>${esc(m.title)}</b>
          <small>${esc(m.where)}${m.dates && m.artist ? ` · ${esc(m.dates)}` : ''}</small>
        </span>
      </button>`
      )
      .join('');

    $('#masterpieceRow').addEventListener('click', (e) => {
      const btn = e.target.closest('.masterpiece');
      if (!btn) return;
      const m = v.masterpieces.find((x) => x.id === btn.dataset.id);
      if (!m) return;
      UI.openModal(`
        <div class="modal-hero">
          ${imgTag(m.wiki, m.title, 1600)}
          <div class="modal-hero-cap">
            <div class="modal-italian">${esc(m.where)}</div>
            <h2>${esc(m.title)}</h2>
          </div>
        </div>
        <div class="modal-content">
          ${
            m.artist
              ? `<div class="attribution"><b>${esc(m.artist)}</b>${m.dates ? `<span>${esc(m.dates)}</span>` : ''}</div>`
              : ''
          }
          <p class="modal-lead">${esc(m.note)}</p>
        </div>`);
    });
  }

  /* ======================================================================
   * 6 · The rest of the route
   * =================================================================== */

  function renderDestinations() {
    const list = DATA.destinations;

    $('#destTabs').innerHTML = list
      .map(
        (d, i) => `
      <button class="dest-tab${i === 0 ? ' active' : ''}" data-dest="${esc(d.id)}" role="tab">
        <span class="dest-tab-media">${imgTag(d.hero.wiki, d.name, 400)}</span>
        <span class="dest-tab-copy">
          <b>${esc(d.name)}</b>
          <small>${esc(d.region)} · ${esc(d.days)}</small>
        </span>
      </button>`
      )
      .join('');

    $('#destTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.dest-tab');
      if (tab) selectDestination(tab.dataset.dest);
    });

    // Bound once on the container, not per render — the panel's innerHTML is
    // replaced on every tab switch, so re-binding here would stack listeners.
    $('#destPanel').addEventListener('click', (e) => {
      const t = e.target.closest('[data-wiki]');
      if (t) UI.openImage(t.dataset.wiki, t.dataset.name || '', '');
    });

    selectDestination(list[0].id);
  }

  function selectDestination(id) {
    const d = DATA.destinations.find((x) => x.id === id);
    if (!d) return;

    $$('.dest-tab').forEach((t) => t.classList.toggle('active', t.dataset.dest === id));

    const section = (title, body, cls = '') =>
      body ? `<div class="dest-block ${cls}"><div class="eyebrow">${esc(title)}</div>${body}</div>` : '';

    /* -- attractions -- */
    const attractions = d.attractions?.length
      ? `<div class="dest-attractions">
          ${d.attractions
            .map(
              (a, i) => `
            <article class="dest-attraction">
              <button class="dest-att-media" data-wiki="${esc(a.wiki)}" data-name="${esc(a.name)}">
                ${imgTag(a.wiki, a.name)}
                <span class="dest-att-n">${a.number || i + 1}</span>
              </button>
              <div class="dest-att-copy">
                <h4 class="dest-att-title">${esc(a.name)}</h4>
                ${a.italian ? `<div class="dest-att-it">${esc(a.italian)}</div>` : ''}
                <p>${esc(a.text)}</p>
                ${
                  a.subItems
                    ? `<div class="sub-items">${a.subItems
                        .map(
                          (s) => `
                      <button class="sub-item" data-wiki="${esc(s.wiki)}" data-name="${esc(s.name)}">
                        ${imgTag(s.wiki, s.name, 400)}
                        <span><b>${esc(s.name)}</b><small>${esc(s.text)}</small></span>
                      </button>`
                        )
                        .join('')}</div>`
                    : ''
                }
                ${
                  a.tradition
                    ? `<div class="tradition"><span>${a.tradition.icon}</span><div><b>${esc(
                        a.tradition.title
                      )}</b><p>${rich(a.tradition.text)}</p></div></div>`
                    : ''
                }
                ${
                  a.why
                    ? `<ul class="why-list">${a.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`
                    : ''
                }
                ${
                  a.story
                    ? `<div class="story-box"><b>${esc(a.story.question)}</b><p>${esc(a.story.text)}</p></div>`
                    : ''
                }
                ${
                  a.legend
                    ? `<div class="legend-box">
                         <div class="legend-head">💛 ${esc(a.legend.title)}</div>
                         <p>${esc(a.legend.text)}</p>
                         ${a.legend.note ? `<small>${esc(a.legend.note)}</small>` : ''}
                       </div>`
                    : ''
                }
              </div>
            </article>`
            )
            .join('')}
         </div>`
      : '';

    /* -- travel options -- */
    const travel = d.travel
      ? `<div class="dest-block">
           <div class="eyebrow">${esc(d.travel.title)}</div>
           ${d.travel.intro ? `<p class="muted">${esc(d.travel.intro)}</p>` : ''}
           <div class="travel-grid">
             ${d.travel.options
               .map(
                 (o) => `
               <div class="travel-option${o.best ? ' best' : ''}">
                 ${o.best ? '<span class="travel-best">fastest</span>' : ''}
                 <div class="travel-icon">${o.icon}</div>
                 <b>${esc(o.name)}</b>
                 <div class="travel-time">${esc(o.time)}</div>
                 <small>${esc(o.text)}</small>
               </div>`
               )
               .join('')}
           </div>
         </div>`
      : '';

    /* -- suggested order -- */
    const route = d.route
      ? `<div class="dest-block">
           <div class="eyebrow">Suggested order</div>
           <div class="walk-route">
             ${d.route
               .map((node) =>
                 node.leg
                   ? `<div class="walk-leg">
                        <span class="walk-line"></span>
                        ${node.leg.time ? `<span class="walk-leg-text">${esc(node.leg.time)}</span>` : ''}
                      </div>`
                   : `<button class="walk-stop" data-wiki="${esc(node.wiki)}" data-name="${esc(node.name)}">
                        ${imgTag(node.wiki, node.name, 400)}
                        <span>${esc(node.name)}</span>
                      </button>`
               )
               .join('')}
           </div>
         </div>`
      : '';

    const stay = d.stay?.length
      ? `<div class="dest-block"><div class="eyebrow">Where to stay</div>
           <div class="stay-grid">${renderStayCards(d.stay)}</div></div>`
      : '';

    const transport = d.transport?.length
      ? `<div class="dest-block"><div class="eyebrow">${esc(d.transportTitle || 'Transportation')}</div>
           ${d.transportIntro ? `<p class="muted">${esc(d.transportIntro)}</p>` : ''}
           <div class="transport-list">${renderTransport(d.transport)}</div></div>`
      : '';

    const food = d.food
      ? `<div class="dest-block"><div class="eyebrow">${esc(d.food.intro)}</div>
           <div class="food-grid">
             ${d.food.items
               .map(
                 (f) => `
               <button class="food-item" data-wiki="${esc(f.wiki)}" data-name="${esc(f.name)}">
                 <div class="food-media">${imgTag(f.wiki, f.name, 400)}</div>
                 <span>${esc(f.name)}</span>
                 ${f.text ? `<em>${esc(f.text)}</em>` : ''}
               </button>`
               )
               .join('')}
           </div></div>`
      : '';

    const experience = d.experience
      ? `<div class="dest-block experience">
           <button class="experience-photo" data-wiki="${esc(d.experience.wiki)}" data-name="${esc(d.experience.title)}">
             ${imgTag(d.experience.wiki, d.experience.title)}
           </button>
           <div>
             <div class="eyebrow">Don't miss</div>
             <h4>${esc(d.experience.title)}</h4>
             <p>${esc(d.experience.text)}</p>
           </div>
         </div>`
      : '';

    const sport = d.sport
      ? `<div class="dest-block experience">
           <button class="experience-photo" data-wiki="${esc(d.sport.wiki)}" data-name="${esc(d.sport.title)}">
             ${imgTag(d.sport.wiki, d.sport.title)}
           </button>
           <div>
             <div class="eyebrow">⚽ Sport</div>
             <h4>${esc(d.sport.title)}</h4>
             <p>${esc(d.sport.text)}</p>
           </div>
         </div>`
      : '';

    $('#destPanel').innerHTML = `
      <article class="dest-article">
        <div class="dest-hero">
          ${imgTag(d.hero.wiki, d.hero.caption, 1600)}
          <div class="dest-hero-cap">
            <div class="dest-hero-meta">${esc(d.region)} · ${esc(d.days)}</div>
            <h3>${esc(d.city)}</h3>
          </div>
        </div>

        <div class="dest-body">
          <p class="dest-lead">${esc(d.intro)}</p>
          ${d.whyVisit ? section(d.whyVisit.title, `<p class="why-text">${esc(d.whyVisit.text)}</p>`, 'why') : ''}
          ${sport}
          ${travel}
          ${d.orderTitle ? `<div class="dest-block"><div class="eyebrow">${esc(d.orderTitle)}</div>${
            d.orderIntro ? `<p class="muted">${esc(d.orderIntro)}</p>` : ''
          }</div>` : ''}
          ${attractions}
          ${d.myth ? `<div class="myth-box"><b>⚠ ${esc(d.myth.title)}</b><p>${rich(d.myth.text)}</p></div>` : ''}
          ${
            d.note
              ? `<div class="unesco-box"><span class="amalfi-badge">🏛 ${esc(d.note.badge)}</span><p>${esc(d.note.text)}</p></div>`
              : ''
          }
          ${route}
          ${experience}
          ${stay}
          <div class="two-up">${transport}${food}</div>
        </div>
      </article>`;

    UI.observeReveals($('#destPanel'));
  }

  /* ======================================================================
   * 7 · Colophon
   * =================================================================== */

  function renderColophon() {
    const a = DATA.author;
    $('#colophon').innerHTML = `
      <a class="fingerprint" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">
        <span class="fp-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M20 5c-8 0-14 6-14 14v6"/>
            <path d="M20 10c-5 0-9 4-9 9v8"/>
            <path d="M20 15c-2.5 0-4 2-4 4v10"/>
            <path d="M20 15c2.5 0 4 2 4 4v6"/>
            <path d="M20 10c5 0 9 4 9 9v4"/>
            <path d="M20 5c8 0 14 6 14 14v2"/>
          </svg>
        </span>
        <span class="fp-copy">
          <small>${esc(a.role)}</small>
          <b>${esc(a.name)}</b>
          <em>${esc(a.url.replace(/^https?:\/\//, ''))}</em>
        </span>
        <span class="fp-arrow">↗</span>
      </a>`;
  }

  /* ------------------------------------------------------------------ go */

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
