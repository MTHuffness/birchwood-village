/* Birchwood Village Apartments — site interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Current year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Header shadow on scroll ---------------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile nav ---------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(nav.classList.contains('is-open') === false);
    });
  }

  // Close the mobile menu after tapping a link.
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  // Reset nav state when leaving the mobile breakpoint.
  var mq = window.matchMedia('(min-width: 901px)');
  var onBreakpoint = function (e) { if (e.matches) setNav(false); };
  if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
  else if (mq.addListener) mq.addListener(onBreakpoint);

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el, i) {
      // Stagger siblings slightly so grids cascade instead of popping at once.
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------------- Active section in nav ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Map();
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var bestId = null, bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });

      navLinks.forEach(function (a) {
        a.classList.toggle('is-current', bestId !== null && a.getAttribute('href') === '#' + bestId);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------------- Gallery filtering ---------------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var emptyMsg = document.getElementById('galleryEmpty');

  function visibleShots() {
    return shots.filter(function (s) { return !s.hidden; });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });

      shots.forEach(function (shot) {
        shot.hidden = !(filter === 'all' || shot.dataset.cat === filter);
      });

      if (emptyMsg) emptyMsg.hidden = visibleShots().length > 0;
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');

  var current = [];      // the shots the lightbox can page through
  var index = 0;
  var lastFocused = null;
  var isOpen = false;
  var closeTimer = null;

  function show(i) {
    if (!current.length) return;
    index = (i + current.length) % current.length;

    var shot = current[index];
    var caption = shot.dataset.caption || '';

    lbImg.src = shot.dataset.full;
    lbImg.alt = caption;
    lbCaption.textContent = caption;

    var multiple = current.length > 1;
    lbPrev.hidden = !multiple;
    lbNext.hidden = !multiple;
  }

  function openLightbox(shot) {
    current = visibleShots();
    var start = current.indexOf(shot);
    if (start === -1) { current = [shot]; start = 0; }

    // Cancel a close that is still fading out, so reopening cannot be undone by it.
    if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = null; }

    isOpen = true;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    show(start);

    // Let the browser paint the hidden->visible change before fading in.
    // Guard on isOpen: a very fast close would otherwise be re-opened by this frame.
    requestAnimationFrame(function () { if (isOpen) lightbox.classList.add('is-open'); });
    lbClose.focus();
  }

  function closeLightbox() {
    isOpen = false;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';

    var finish = function () {
      closeTimer = null;
      if (isOpen) return;           // reopened while fading out
      lightbox.hidden = true;
      lbImg.removeAttribute('src');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    if (closeTimer) window.clearTimeout(closeTimer);
    if (reduceMotion) finish();
    else closeTimer = window.setTimeout(finish, 250);
  }

  shots.forEach(function (shot) {
    shot.addEventListener('click', function () { openLightbox(shot); });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { show(index - 1); });
    lbNext.addEventListener('click', function () { show(index + 1); });

    // Click the backdrop (but not the image or controls) to dismiss.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lb-figure')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;

      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { show(index - 1); return; }
      if (e.key === 'ArrowRight') { show(index + 1); return; }

      // Keep focus inside the dialog while it is open.
      if (e.key === 'Tab') {
        var focusable = [lbClose, lbPrev, lbNext].filter(function (el) { return !el.hidden; });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }
})();
