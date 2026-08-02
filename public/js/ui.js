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

  /* --------------------------------------------------- Reading position */

  /**
   * The guide is linear, so the chrome shows where you are rather than offering
   * somewhere else to go: a progress bar, and the chapter you are currently in.
   */
  function initChrome(chapters) {
    const topbar = $('#topbar');
    const progress = $('#scrollProgress');
    const whereN = $('#whereN');
    const whereTitle = $('#whereTitle');

    const marks = [{ n: '00', title: 'Italy', el: $('#cover') }].concat(
      (chapters || []).map((c) => ({ n: c.n, title: c.title, el: document.getElementById(c.id) }))
    ).filter((m) => m.el);

    let shown = null;

    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle('stuck', y > 40);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;

      let current = marks[0];
      marks.forEach((m) => {
        if (m.el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = m;
      });

      if (current !== shown) {
        shown = current;
        whereN.textContent = current.n;
        whereTitle.textContent = current.title;
        $('#topbarWhere').classList.toggle('is-cover', current.n === '00');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /** Smoothly scroll an element into view, accounting for the fixed top bar. */
  function scrollToEl(target) {
    const node = typeof target === 'string' ? $(target) : target;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return {
    $, $$, esc, rich, img, imgTag,
    openModal, closeModal, openImage,
    observeReveals, initTheme, initChrome, scrollToEl,
  };
})();
