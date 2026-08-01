/* ===========================================================================
   ui.js — tiny helpers shared by the rest of the front end.
   No framework: just DOM, an image-URL builder, a modal and a reveal observer.
   ======================================================================== */

/* global window, document */

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
   * Image URL. Goes through our own server, which resolves the Wikipedia
   * article to its lead photo at the width we ask for, caches it, and falls
   * back to a generated placeholder if the lookup fails — so this never
   * renders a broken image.
   *
   * width: 400 for thumbnails, 900 for cards, 1600 for the lightbox.
   */
  function img(wikiTitle, label, width = 900) {
    const t = encodeURIComponent(wikiTitle);
    const l = encodeURIComponent(label || String(wikiTitle).replace(/_/g, ' '));
    return `/api/image/${t}?w=${width}&label=${l}`;
  }

  /** <img> markup that fades in once the photo actually arrives. */
  function imgTag(wikiTitle, alt, width = 900) {
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
        ${imgTag(wikiTitle, title, 1600)}
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
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
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

  /* ------------------------------------------------------ Nav & scrollbar */

  function initChrome() {
    const nav = $('#nav');
    const progress = $('#scrollProgress');
    const links = $$('#navLinks a');
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('stuck', y > 40);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

      let current = -1;
      sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
      });
      links.forEach((a, i) => a.classList.toggle('active', i === current));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = $('#navToggle');
    const menu = $('#navLinks');
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /** Smoothly scroll an element into view, accounting for the fixed nav. */
  function scrollToEl(target) {
    const node = typeof target === 'string' ? $(target) : target;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return { $, $$, esc, rich, img, imgTag, openModal, closeModal, openImage, observeReveals, initChrome, scrollToEl };
})();
