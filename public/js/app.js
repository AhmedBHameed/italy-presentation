/* ===========================================================================
   app.js — boots the page from /api/content and renders every section.
   ======================================================================== */

/* global UI, ItalyMap */

(() => {
  'use strict';

  const { $, esc, rich, imgTag } = UI;

  /** Which map region a place name belongs to, for cross-linking. */
  const PLACE_TO_REGION = {
    Rome: 'Lazio',
    Milan: 'Lombardia',
    Naples: 'Campania',
    'Amalfi Coast': 'Campania',
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
    Florence: 'Florence',
    Pisa: 'Pisa',
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
      bootNote.textContent = 'reading Italy.pdf…';
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
      renderQuiz();
      renderFooter();

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
    $('#heroSource').textContent = DATA.meta.sourceDocument;
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
      if (chip) UI.openImage(chip.dataset.wiki, chip.dataset.name, 'Named in the guide as one of Italy’s famous landmarks.');
    });
  }

  /* ======================================================================
   * 2 · The atlas
   * =================================================================== */

  function renderAtlas() {
    const guideNames = Object.keys(DATA.guideRegions);

    ItalyMap.init({
      guideRegions: guideNames,
      onSelect: (name) => (name ? showDossier(name) : hideDossier()),
    });

    // Shortcut buttons for the five regions named in the guide.
    $('#guideShortcuts').innerHTML =
      `<div style="width:100%;font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:2px">In the guide</div>` +
      guideNames
        .map((n) => `<button data-region="${esc(n)}">${esc(DATA.guideRegions[n].displayName)}</button>`)
        .join('');

    $('#guideShortcuts').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-region]');
      if (btn) ItalyMap.select(btn.dataset.region);
    });

    // City cards inside the dossier open a picture.
    $('#dossier').addEventListener('click', (e) => {
      const card = e.target.closest('.city-card');
      if (card) UI.openImage(card.dataset.wiki, card.dataset.name, card.dataset.note);
    });
  }

  function showDossier(name) {
    const info = DATA.regionInfo[name];
    if (!info) return;
    const guide = DATA.guideRegions[name] || null;
    const density = Math.round(info.population / info.areaKm2);

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
            <small>${esc(c.note || 'Named in the guide.')}</small>
          </span>
        </button>`
          )
          .join('')}</div>`
      : '';

    $('#dossier').innerHTML = `
      <div class="eyebrow">Regione</div>
      ${guide ? '<div class="badge-guide">★ in the guide</div>' : ''}
      <h3 class="dossier-name">${esc(ItalyMap.shortName(name))}</h3>
      <div class="dossier-sub">${esc(info.subtitle)}</div>

      <div class="stat-row">
        <div class="stat"><label>Capital</label><div class="value">${esc(info.capital)}</div></div>
        <div class="stat"><label>Population</label><div class="value">${info.population.toLocaleString('en-US')}</div></div>
        <div class="stat"><label>Area</label><div class="value">${info.areaKm2.toLocaleString('en-US')} km²</div></div>
        <div class="stat"><label>Density</label><div class="value">${density}/km²</div></div>
      </div>

      ${guide ? `<div class="dossier-label">Where the guide sends you</div>${chainHtml}${citiesHtml}` : ''}

      <div class="dossier-label">Field notes</div>
      <div class="dossier-text">${esc(info.fact)}</div>

      <span class="source-tag">${
        guide ? esc(guide.source) : 'Population and area are rounded teaching figures, not from Italy.pdf.'
      }</span>
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
        <div class="eyebrow">Note · ${esc(a.source)}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.text)}</p>
        <div class="amalfi-badge">🏛 ${esc(a.badge)}</div>
      </div>
      <div class="amalfi-photo" data-wiki="${esc(a.wiki)}">${imgTag(a.wiki, a.title)}</div>
    `;
    $('#amalfiNote').addEventListener('click', (e) => {
      const photo = e.target.closest('.amalfi-photo');
      if (photo) UI.openImage(a.wiki, a.title, a.text);
    });
  }

  /* ======================================================================
   * 3 · Planning
   * =================================================================== */

  function renderPlanning() {
    const p = DATA.planning;

    $('#planningQuestion').textContent = p.question;
    $('#planningAnswer').textContent = p.answer;
    $('#seasonIntro').textContent = p.seasonIntro;

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

    /* ---- seasons ---- */
    $('#seasonTabs').innerHTML = p.seasons
      .map(
        (s, i) => `
      <button class="season-tab${i === 2 ? ' active' : ''}" data-season="${esc(s.id)}" role="tab">
        ${s.recommended ? '<span class="rec">best for most</span>' : ''}
        <b>${esc(s.name)}</b>
        <small>${esc(s.months)}</small>
      </button>`
      )
      .join('');

    $('#monthStrip').innerHTML = MONTHS.map(
      (m, i) => `<div class="month${i === 8 ? ' best' : ''}" data-month="${i}">${m}</div>`
    ).join('');

    function selectSeason(id) {
      const s = p.seasons.find((x) => x.id === id);
      if (!s) return;

      UI.$$('.season-tab').forEach((t) => t.classList.toggle('active', t.dataset.season === id));

      UI.$$('.month').forEach((node) => {
        const i = Number(node.dataset.month);
        node.className = 'month' + (i === 8 ? ' best' : '') + (s.monthIndices.includes(i) ? ` on ${s.tone}` : '');
      });

      $('#seasonDetail').innerHTML = `
        <div>
          <div class="season-headline">${esc(s.headline)}</div>
          <p>${esc(s.detail)}</p>
          <ul class="season-points">${s.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
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
        UI.$$('#seasonDetail .meter-fill').forEach((f, i) => (f.style.width = `${widths[i]}%`));
      });
    }

    const crowdWord = (n) => ['', 'fewest', 'fewer', 'busy', 'biggest'][n] || '—';
    const priceWord = (n) => ['', 'lowest', 'lower', 'high', 'highest'][n] || '—';

    $('#seasonTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.season-tab');
      if (tab) selectSeason(tab.dataset.season);
    });
    selectSeason('shoulder');

    /* ---- September spotlight ---- */
    const b = p.bestMonth;
    $('#septemberSpotlight').innerHTML = `
      <div class="spotlight-photo">
        <div class="spotlight-temp"><b>${b.temperature.c}°C</b><small>${b.temperature.f}°F</small></div>
        ${imgTag("Val_d'Orcia", 'The Val d’Orcia, Tuscany, in September')}
      </div>
      <div class="spotlight-copy">
        <div class="eyebrow">The verdict · ${esc(b.source)}</div>
        <h3>${esc(b.claim)}</h3>
        <ul class="reason-list">
          ${b.reasons.map((r) => `<li><span class="ricon">${r.icon}</span><span>${esc(r.text)}</span></li>`).join('')}
        </ul>
      </div>`;

    /* ---- durations ---- */
    const d = p.durations;
    $('#durationQuestion').textContent = d.question;
    $('#durationToggle').innerHTML = d.options
      .map((o, i) => `<button data-duration="${esc(o.id)}" class="${i === 0 ? 'active' : ''}">${o.days} days</button>`)
      .join('');

    function selectDuration(id) {
      const o = d.options.find((x) => x.id === id);
      if (!o) return;
      UI.$$('#durationToggle button').forEach((b2) => b2.classList.toggle('active', b2.dataset.duration === id));

      $('#durationDetail').innerHTML = `
        <div class="eyebrow">${esc(o.title)}</div>
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
        </div>
        <span class="source-tag">${esc(d.source)}</span>`;
    }

    $('#durationToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-duration]');
      if (btn) selectDuration(btn.dataset.duration);
    });
    selectDuration(d.options[0].id);

    // Clicking a stop flies the map to its region.
    $('#durationDetail').addEventListener('click', (e) => {
      const stop = e.target.closest('.itin-stop');
      if (!stop) return;
      const region = PLACE_TO_REGION[stop.dataset.place];
      if (!region) return;
      UI.scrollToEl('#regions');
      setTimeout(() => ItalyMap.select(region), 550);
    });
  }

  /* ======================================================================
   * 4 · Rome
   * =================================================================== */

  function renderRome() {
    const r = DATA.rome;
    $('#romeTitle').textContent = r.title;
    $('#romeNickname').textContent = r.nickname;
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
          <span class="card-cta">Open the file</span>
        </div>
      </button>`
      )
      .join('');

    $('#attractionGrid').addEventListener('click', (e) => {
      const card = e.target.closest('[data-attraction]');
      if (card) openAttraction(card.dataset.attraction);
    });
  }

  function openAttraction(id) {
    const a = DATA.rome.attractions.find((x) => x.id === id);
    if (!a) return;

    const facts = a.facts?.length
      ? `<div class="modal-sub">What the guide records</div>
         <ul class="fact-list">
           ${a.facts.map((f) => `<li><span class="ficon">${f.icon}</span><span>${rich(f.text)}</span></li>`).join('')}
         </ul>`
      : '';

    const legend = a.legend
      ? `<div class="coin-game">
           <h4>${esc(a.legendTitle || 'The legend')}</h4>
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
        <div class="modal-source">Source · ${esc(a.source)}</div>
      </div>
    `);

    // Gallery thumbnails
    UI.$$('#modalBody .modal-gallery figure').forEach((fig) => {
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', () => UI.openImage(fig.dataset.wiki, a.name, fig.dataset.caption));
    });

    // Trevi coin toss
    const outcome = $('#coinOutcome');
    if (outcome) {
      UI.$$('#modalBody .coin-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = Number(btn.dataset.coins);
          const entry = a.legend.find((l) => l.coins === n);
          UI.$$('#modalBody .coin-btn').forEach((b) => b.classList.toggle('active', b === btn));
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

      UI.$$('.hotspot').forEach((g) => g.classList.toggle('active', g.dataset.hotspot === id));

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

    /* ---- masterpieces ---- */
    $('#masterpieceRow').innerHTML = v.masterpieces
      .map(
        (m) => `
      <button class="masterpiece" data-wiki="${esc(m.wiki)}" data-title="${esc(m.title)}" data-note="${esc(m.note)}">
        ${imgTag(m.wiki, m.title)}
        <span class="masterpiece-cap">
          <b>${esc(m.title)}</b>
          <small>${esc(m.where)}</small>
        </span>
      </button>`
      )
      .join('');

    $('#masterpieceRow').addEventListener('click', (e) => {
      const btn = e.target.closest('.masterpiece');
      if (btn) UI.openImage(btn.dataset.wiki, btn.dataset.title, btn.dataset.note);
    });
  }

  /* ======================================================================
   * 6 · Quiz
   * =================================================================== */

  function renderQuiz() {
    const questions = DATA.quiz;
    const answered = new Map();
    const LETTERS = ['A', 'B', 'C', 'D'];

    $('#quizTotal').textContent = questions.length;

    $('#quizList').innerHTML = questions
      .map(
        (q, i) => `
      <div class="q reveal" data-q="${esc(q.id)}">
        <div class="q-num">Question ${String(i + 1).padStart(2, '0')}</div>
        <div class="q-text">${esc(q.question)}</div>
        <div class="q-options">
          ${q.options
            .map(
              (opt, oi) =>
                `<button class="q-opt" data-index="${oi}"><span class="key">${LETTERS[oi]}</span><span>${esc(opt)}</span></button>`
            )
            .join('')}
        </div>
        <div class="q-feedback"></div>
      </div>`
      )
      .join('');

    function updateScore() {
      const correct = Array.from(answered.values()).filter(Boolean).length;
      $('#quizScore').textContent = correct;
      $('#quizTrackFill').style.width = `${(answered.size / questions.length) * 100}%`;

      const result = $('#quizResult');
      if (answered.size === questions.length) {
        const pct = Math.round((correct / questions.length) * 100);
        const verdict =
          pct === 100 ? 'Perfetto! Every answer right.'
          : pct >= 70 ? 'Bravo — you know your Italy.'
          : pct >= 40 ? 'Not bad. Scroll back up and reread a chapter or two.'
          : 'Worth another read — every answer is on this page.';
        result.innerHTML = `
          <h3>${correct} out of ${questions.length}</h3>
          <p>${esc(verdict)}</p>`;
        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        result.classList.remove('show');
      }
    }

    $('#quizList').addEventListener('click', (e) => {
      const btn = e.target.closest('.q-opt');
      if (!btn) return;
      const card = btn.closest('.q');
      const q = questions.find((x) => x.id === card.dataset.q);
      if (!q || answered.has(q.id)) return;

      const picked = Number(btn.dataset.index);
      const isRight = picked === q.answer;
      answered.set(q.id, isRight);

      UI.$$('.q-opt', card).forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === picked) b.classList.add('incorrect');
      });

      card.classList.add('answered', isRight ? 'right' : 'wrong');
      UI.$('.q-feedback', card).innerHTML = `
        <b>${isRight ? '✓ Correct.' : '✕ Not quite.'}</b> ${esc(q.because)}
        <span class="src">${esc(q.source)}</span>`;

      updateScore();
    });

    $('#quizReset').addEventListener('click', () => {
      answered.clear();
      UI.$$('.q').forEach((card) => {
        card.classList.remove('answered', 'right', 'wrong');
        UI.$('.q-feedback', card).innerHTML = '';
        UI.$$('.q-opt', card).forEach((b) => {
          b.disabled = false;
          b.classList.remove('correct', 'incorrect');
        });
      });
      $('#quizResult').classList.remove('show');
      updateScore();
      UI.scrollToEl('#quiz');
    });

    updateScore();
  }

  function renderFooter() {
    $('#footerDisclaimer').textContent = DATA.meta.disclaimer;
  }

  /* ------------------------------------------------------------------ go */

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
