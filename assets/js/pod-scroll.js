/* ═══════════════════════════════════════════════════════════════════════
   pod-scroll.js — scroll layer for the "How a pod runs" slide.
   Zero dependencies. Drop this file next to the slide and include with:
       <script src="pod-scroll.js" defer></script>
   Works without the slide too: any element with [data-reveal] gets the
   reveal effect on first scroll into view.
   ───────────────────────────────────────────────────────────────────────
   HOOKS
   .ps-wrap            section being measured (optional)
   [data-reveal]       fades/rises in. Set style="--i:3" to stagger.
   .ps-bar             progress bar inside .ps-rail (width = scroll %)
   .ps-float           subtle parallax on scroll
   --ps-p              custom property, 0→1 progress of the section
                       through the viewport. Use it in your own CSS:
                       transform: translateY(calc(var(--ps-p) * -40px));
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. REVEAL ON ENTER ──────────────────────────────────────────── */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);          // one-shot: never re-hides
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    /* Safety net: a background/hidden tab throttles IntersectionObserver, so
       anything already on screen is revealed on a timer and on re-focus.
       Prevents a slide stuck at opacity:0. */
    function revealInView() {
      items.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 0) && r.bottom > 0) el.classList.add('is-in');
      });
    }
    setTimeout(revealInView, 900);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) revealInView();
    });
  }

  /* ── 2. SCROLL PROGRESS (rAF-throttled, passive) ─────────────────── */
  var wrap = document.querySelector('.ps-wrap') || document.body;
  var bar  = document.querySelector('.ps-bar');
  var root = document.documentElement;
  var ticking = false;
  var lastP = -1;

  function clamp(n, a, b) { return n < a ? a : n > b ? b : n; }
  function round(p) { return Math.round(p * 1000) / 1000; }   // stops jitter churn

  function measure() {
    ticking = false;
    var r = wrap.getBoundingClientRect();
    var vh = window.innerHeight || root.clientHeight;
    // 0 when the section top hits the bottom of the viewport,
    // 1 when its bottom clears the top of the viewport.
    var span = r.height + vh;
    var p = span > 0 ? clamp((vh - r.top) / span, 0, 1) : 0;
    p = round(p);
    if (p === lastP) return;
    lastP = p;
    root.style.setProperty('--ps-p', p);
    if (bar) bar.style.width = (p * 100) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(measure);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  measure();

  /* ── 3. OPTIONAL: advance the slide's tabs on scroll ─────────────────
     Enable with data-stage-scroll on .ps-wrap. Clicks the slide's own
     tab buttons as the stage crosses the middle of the viewport, so the
     existing tab logic still owns all the animation.
     Commented out by default — unhide if you want scroll-driven stages. */
  if (wrap.hasAttribute('data-stage-scroll')) {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('#tabs [role="tab"], #tabs button'));
    if (tabs.length) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var i = Number(e.target.getAttribute('data-stage'));
          if (tabs[i] && !tabs[i].classList.contains('active')) tabs[i].click();
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('[data-stage]'), function (el) {
        io2.observe(el);
      });
    }
  }
})();
