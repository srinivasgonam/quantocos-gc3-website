/* motion.js — the single motion layer (Round 4)
   Replaces motion-v2.js, ui-motion.js, premium.js, design-motion.js.
   API, markup only:
     data-reveal            fade + rise 24px, 600ms, once
     data-stagger           children reveal in 80ms steps
     data-count             number count-up (handled in components.js)
     data-parallax          small translate on scroll (transform only)
     data-draw              SVG stroke draw
     data-tilt              subtle hover lift on cards
   Rules: transform/opacity only, nothing hidden without JS, offscreen paused,
   mobile throttled, prefers-reduced-motion and ?motion=off show everything.
*/
(function () {
  'use strict';
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mq.matches || window.MOTION_ENABLED === false || /[?&]motion=off/.test(location.search);
  var html = document.documentElement;

  /* No-JS / reduced motion / explicit opt-out: content is already visible. */
  if (reduced) { html.classList.add('mv-off'); return; }

  var fine = window.matchMedia('(pointer: fine)').matches;
  var wide = window.innerWidth >= 900;

  /* ---------------------------------------------------------------- reveal */
  /* ---------------------------------------------------------------- reveal
     Progressive enhancement: content is visible by default. The hidden state
     only exists while <html> carries .reveal-armed, which this script adds.
     If this file never runs, nothing is hidden. */
  function revealInit() {
    var targets = [].slice.call(document.querySelectorAll('[data-reveal], [data-stagger]'));
    if (!targets.length) return;
    var html = document.documentElement;
    html.classList.add('reveal-armed');

    function show(el) {
      el.classList.add('is-in');
      if (el.hasAttribute('data-stagger')) {
        [].forEach.call(el.children, function (c) { c.classList.add('is-in'); });
      }
    }
    function sweep() {
      var vh = window.innerHeight;
      targets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > -vh) show(el);
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      targets.forEach(function (t) { io.observe(t); });
    }
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    var kick = setInterval(sweep, 600);
    setTimeout(sweep, 300);
    setTimeout(function () { targets.forEach(show); }, 2200);
    setTimeout(function () { targets.forEach(show); html.classList.remove('reveal-armed'); clearInterval(kick); }, 10000);
  }

  /* -------------------------------------------------------------- parallax */
  function parallaxInit() {
    /* parallax disabled: 51 hooked elements cancelled each other out (design pass) */
    return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length || !fine || !wide) return;
    var ticking = false;
    function paint() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var depth = parseFloat(el.getAttribute('data-parallax')) || 0.06;
        var mid = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (mid * depth * -160).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ------------------------------------------------------------------ tilt */
  function tiltInit() {
    if (!fine) return;
    document.querySelectorAll('[data-tilt], .card').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'translate3d(0,' + (-2 + y * -3).toFixed(2) + 'px,0) rotateX(' + (y * -1.2).toFixed(2) + 'deg) rotateY(' + (x * 1.2).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = 'none'; });
    });
  }

  /* ------------------------------------------------------------------ draw */
  function drawInit() {
    var paths = [].slice.call(document.querySelectorAll('[data-draw] path, [data-draw] circle, [data-draw] line'));
    if (!paths.length) return;
    paths.forEach(function (p) {
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) { return; }
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.style.transition = 'stroke-dashoffset 1.1s ' + EASE;
    });
    if (!('IntersectionObserver' in window)) {
      paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
      return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.strokeDashoffset = 0; io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    paths.forEach(function (p) { io.observe(p); });
  }

  /* --------------------------------------------------------- scroll progress */
  function progressInit() {
    var bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return;
    var ticking = false;
    function paint() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ------------------------------------------------------------ entry fade */
  function entryFade() {
    var m = document.querySelector('main');
    if (!m) return;
    m.style.transition = 'opacity .45s ' + EASE;
    m.style.opacity = '0.9';   // never 0: the hero H1 is the LCP element
    requestAnimationFrame(function () { m.style.opacity = '1'; });
  }

  function boot() {
    revealInit();
    parallaxInit();
    tiltInit();
    drawInit();
    progressInit();
    if (!reduced) entryFade();
    mq.addEventListener('change', function (e) { if (e.matches) document.documentElement.classList.add('mv-off'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.__motion = { version: 4, reduced: reduced };
})();
