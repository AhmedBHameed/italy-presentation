/* ===========================================================================
   map.js — the clickable atlas of Italy's 20 regions, drawn with d3 + topojson.
   ======================================================================== */

/* global d3, topojson, UI */

const ItalyMap = (() => {
  'use strict';

  const TOPO_URL = '/data/italy-regions.topo.json';

  let topo = null;
  let geo = null;
  let onSelect = null;
  let guideNames = new Set();

  // Rendering state
  let svg, gRoot, layers, projection, path, zoom;
  let width = 0;
  let height = 0;
  let activeName = null;

  /* -------------------------------------------------------------- Loading */

  async function load() {
    if (topo) return geo;
    const resp = await fetch(TOPO_URL);
    if (!resp.ok) throw new Error(`Could not load map data (${resp.status})`);
    topo = await resp.json();
    geo = topojson.feature(topo, topo.objects.regions);
    return geo;
  }

  const nameOf = (feature) => feature.properties.reg_name;
  /** "Trentino-Alto Adige/Südtirol" -> "Trentino-Alto Adige" for display. */
  const shortName = (name) => String(name).split('/')[0];

  /* ------------------------------------------------------ Hero silhouette */

  function drawHeroSilhouette(selector) {
    const node = document.querySelector(selector);
    if (!node || !geo) return;

    const render = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (!w || !h) return;

      const outline = topojson.merge(topo, topo.objects.regions.geometries);
      const narrow = w < 900;
      const box = narrow
        ? [[w * 0.2, h * 0.12], [w * 0.8, h * 0.95]]
        : [[w * 0.56, h * 0.04], [w * 0.99, h * 0.99]];

      const proj = d3.geoMercator().fitExtent(box, outline);
      const p = d3.geoPath(proj);

      const sel = d3.select(node);
      sel.attr('viewBox', `0 0 ${w} ${h}`);
      sel.selectAll('path.sil').data([outline]).join('path').attr('class', 'sil').attr('d', p);
    };

    render();
    if ('ResizeObserver' in window) new ResizeObserver(render).observe(node);
    else window.addEventListener('resize', render);
  }

  /* ------------------------------------------------------------ Main map */

  function init(options) {
    onSelect = options.onSelect;
    guideNames = new Set(options.guideRegions || []);

    const pane = document.querySelector('.map-pane');
    const tooltip = document.getElementById('mapTooltip');

    svg = d3.select('#map');
    gRoot = svg.append('g');
    layers = {
      graticule: gRoot.append('g'),
      regions: gRoot.append('g'),
      markers: gRoot.append('g'),
      labels: gRoot.append('g'),
    };

    /* -------- zoom -------- */
    zoom = d3
      .zoom()
      .scaleExtent([1, 9])
      .on('zoom', (event) => {
        gRoot.attr('transform', event.transform);
        const k = event.transform.k;
        layers.regions.selectAll('path.region').attr('stroke-width', 0.9 / k);
        layers.graticule.selectAll('path').attr('stroke-width', 1 / k);
        layers.markers.selectAll('circle').attr('transform', `scale(${1 / k})`);
        layers.labels.selectAll('text').style('font-size', `${15 / k}px`).style('stroke-width', `${3.5 / k}px`);
      });

    svg.call(zoom).on('click', () => reset());

    /* -------- draw -------- */
    function draw() {
      width = pane.clientWidth;
      height = pane.clientHeight;
      if (!width || !height) return;

      svg.attr('viewBox', `0 0 ${width} ${height}`);
      projection = d3.geoMercator().fitExtent([[34, 34], [width - 34, height - 34]], geo);
      path = d3.geoPath(projection);

      layers.graticule
        .selectAll('path')
        .data([d3.geoGraticule().step([2, 2])()])
        .join('path')
        .attr('class', 'graticule')
        .attr('d', path);

      layers.regions
        .selectAll('path.region')
        .data(geo.features, nameOf)
        .join('path')
        .attr('class', (d) => className(nameOf(d)))
        .attr('d', path)
        .on('click', (event, d) => {
          event.stopPropagation();
          select(nameOf(d));
        })
        .on('mousemove', (event, d) => {
          const [mx, my] = d3.pointer(event, pane);
          const isGuide = guideNames.has(nameOf(d));
          tooltip.innerHTML =
            (isGuide ? '<small>in the guide</small>' : '') + UI.esc(shortName(nameOf(d)));
          tooltip.style.left = `${mx}px`;
          tooltip.style.top = `${my}px`;
          tooltip.classList.add('show');
        })
        .on('mouseleave', () => tooltip.classList.remove('show'));

      // Pulsing gold markers on the five regions the guide names.
      const guideFeatures = geo.features.filter((f) => guideNames.has(nameOf(f)));
      const marker = layers.markers
        .selectAll('g.marker')
        .data(guideFeatures, nameOf)
        .join((enter) => {
          const g = enter.append('g').attr('class', 'marker').style('pointer-events', 'none');
          g.append('circle').attr('class', 'guide-ring').attr('r', 6);
          g.append('circle').attr('class', 'guide-dot').attr('r', 3);
          return g;
        });
      marker.attr('transform', (d) => `translate(${path.centroid(d)})`);

      layers.labels
        .selectAll('text.region-label')
        .data(geo.features, nameOf)
        .join('text')
        .attr('class', (d) => 'region-label' + (nameOf(d) === activeName ? ' visible' : ''))
        .attr('x', (d) => path.centroid(d)[0])
        .attr('y', (d) => path.centroid(d)[1] - 10)
        .text((d) => shortName(nameOf(d)));
    }

    function className(name) {
      return (
        'region' +
        (guideNames.has(name) ? ' in-guide' : '') +
        (name === activeName ? ' active' : '')
      );
    }

    /* -------- zoom helpers -------- */
    function zoomTo(feature) {
      const [[x0, y0], [x1, y1]] = path.bounds(feature);
      const dx = x1 - x0;
      const dy = y1 - y0;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const k = Math.max(1, Math.min(8, 0.78 / Math.max(dx / width, dy / height)));
      svg
        .transition()
        .duration(820)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(width / 2 - k * cx, height / 2 - k * cy).scale(k)
        );
    }

    function select(name) {
      const feature = geo.features.find((f) => nameOf(f) === name);
      if (!feature) return;

      activeName = name;
      layers.regions.selectAll('path.region').attr('class', (d) => className(nameOf(d)));
      layers.labels
        .selectAll('text.region-label')
        .classed('visible', (d) => nameOf(d) === name);

      zoomTo(feature);
      document.getElementById('resetBtn').classList.add('visible');
      if (onSelect) onSelect(name);
    }

    function reset() {
      activeName = null;
      layers.regions.selectAll('path.region').attr('class', (d) => className(nameOf(d)));
      layers.labels.selectAll('text.region-label').classed('visible', false);
      document.getElementById('resetBtn').classList.remove('visible');
      svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity);
      if (onSelect) onSelect(null);
    }

    document.getElementById('resetBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      reset();
    });

    draw();

    const redraw = () => {
      draw();
      if (activeName) {
        const feature = geo.features.find((f) => nameOf(f) === activeName);
        if (feature) zoomTo(feature);
      }
    };
    if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(pane);
    else window.addEventListener('resize', redraw);

    // Expose the imperative bits the page needs.
    ItalyMap.select = select;
    ItalyMap.reset = reset;
  }

  return { load, init, drawHeroSilhouette, shortName };
})();
