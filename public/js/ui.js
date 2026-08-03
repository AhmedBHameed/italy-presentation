/* ===========================================================================
   ui.js — tiny helpers shared by the rest of the front end.
   No framework: DOM helpers, an image-URL builder, a modal, a reveal observer,
   the theme switch, and the reading-position chrome.
   ======================================================================== */

/* global window, document, localStorage */

const UI = (() => {
  'use strict';

  /* ------------------------------------------------------------------ DOM */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escape text destined for innerHTML. */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  /** Escape, then turn **bold** into <strong> and wrap it in a highlight. */
  function rich(text) {
    return esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong><mark>$1</mark></strong>');
  }

  /**
   * Image URL. Goes through our own server, which serves the photograph from
   * public/img when it has been downloaded (the normal case — see
   * `npm run images`), falls back to resolving it live from Wikipedia, and
   * falls back again to a generated placeholder. It never renders broken.
   *
   * width: 400 for thumbnails, 1200 for anything larger.
   */
  function img(wikiTitle, label, width = 1200) {
    const t = encodeURIComponent(wikiTitle);
    const l = encodeURIComponent(label || String(wikiTitle).replace(/_/g, ' '));
    return `/api/image/${t}?w=${width}&label=${l}`;
  }

  /** <img> markup that fades in once the photo actually arrives. */
  function imgTag(wikiTitle, alt, width = 1200) {
    return (
      `<img class="ph" src="${esc(img(wikiTitle, alt, width))}" alt="${esc(alt || wikiTitle)}" ` +
      `loading="lazy" decoding="async" onload="this.classList.add('ready')">`
    );
  }

  /* ---------------------------------------------------------------- Modal */

  const modal = $('#modal');
  const modalBody = $('#modalBody');
  const modalPanel = $('#modalPanel');
  let lastFocused = null;

  function openModal(html) {
    lastFocused = document.activeElement;
    modalBody.innerHTML = html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    modalPanel.scrollTop = 0;
    modalPanel.focus({ preventScroll: true });
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    modalBody.innerHTML = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /** Full-bleed single image, used by the little gallery thumbnails. */
  function openImage(wikiTitle, title, caption) {
    openModal(`
      <figure class="lightbox-figure">
        ${imgTag(wikiTitle, title, 1200)}
        <figcaption>
          <b>${esc(title)}</b>
          ${caption ? esc(caption) : ''}
        </figcaption>
      </figure>
    `);
  }

  /* --------------------------------------------------------------- Reveal */

  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        )
      : null;

  /** Register any .reveal elements added since the last call. */
  function observeReveals(root = document) {
    $$('.reveal', root).forEach((node) => {
      if (node.classList.contains('in')) return;
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add('in');
    });
  }

  /* ---------------------------------------------------------------- Theme */

  const THEME_KEY = 'italy-theme';

  function setTheme(name) {
    document.documentElement.dataset.theme = name;
    try {
      localStorage.setItem(THEME_KEY, name);
    } catch {
      /* private mode — the choice just won't survive a reload */
    }
    const btn = $('#themeToggle');
    if (btn) btn.setAttribute('aria-label', `Switch to ${name === 'dark' ? 'light' : 'dark'} theme`);
  }

  function initTheme() {
    const btn = $('#themeToggle');
    if (!btn) return;
    setTheme(document.documentElement.dataset.theme || 'dark');
    btn.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ------------------------------------------------ Nav, progress, to-top */

  /**
   * The top bar: a progress rule, one link per chapter that highlights as you
   * pass through it, a hamburger for narrow screens, and the back-to-top
   * button that appears once you have left the cover.
   */
  function initChrome() {
    const topbar = $('#topbar');
    const progress = $('#scrollProgress');
    const toTop = $('#toTop');
    const menu = $('#navLinks');
    const toggle = $('#navToggle');

    const links = $$('#navLinks a');
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle('stuck', y > 40);
      toTop.classList.toggle('visible', y > window.innerHeight * 0.9);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;

      let current = -1;
      sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) current = i;
      });
      links.forEach((a, i) => a.classList.toggle('active', i === current));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    // Handled here rather than by the browser so the landing position gets the
    // correction pass in scrollToEl — and so the menu closes behind you.
    menu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      e.preventDefault();
      menu.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      scrollToEl(link.getAttribute('href'));
    });
  }

  /**
   * Smoothly scroll an element into view, accounting for the fixed top bar.
   *
   * The correction pass is not optional: photographs between here and the
   * target are lazy, and each one that resolves its height while we are
   * travelling pushes the target further down — a plain anchor jump lands
   * several hundred pixels short. So once the scroll has settled, re-measure
   * and close whatever gap opened up.
   */
  function scrollToEl(target) {
    const node = typeof target === 'string' ? $(target) : target;
    if (!node) return;

    const topOf = () => node.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: topOf(), behavior: 'smooth' });

    let rounds = 0;
    const settle = () => {
      let last = null;
      let still = 0;
      const tick = () => {
        const y = Math.round(window.scrollY);
        still = y === last ? still + 1 : 0;
        last = y;
        if (still < 3) return requestAnimationFrame(tick);

        const gap = topOf() - window.scrollY;
        if (Math.abs(gap) > 8 && rounds < 4) {
          rounds += 1;
          window.scrollTo({ top: topOf(), behavior: 'smooth' });
          requestAnimationFrame(settle);
        }
        return undefined;
      };
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(settle);
  }

  return {
    $, $$, esc, rich, img, imgTag,
    openModal, closeModal, openImage,
    observeReveals, initTheme, initChrome, scrollToEl,
  };
})();
