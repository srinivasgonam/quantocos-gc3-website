/* ============================================================================
   page-extras.js — small functional upgrades that apply across the site.
     1. Deep-linkable calculator state (?pod=strategy&used=180)
     2. "/" focuses the site search, Esc closes overlays
     3. Sticky section switcher on any long page that has 4+ major headings
   All three degrade to nothing when the markup is not present.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------- 1. calculator state */
  var calc = document.querySelector('[data-pod-calculator]');
  if (calc) {
    var params = new URLSearchParams(location.search);
    var podName = (params.get('pod') || '').toLowerCase();
    var used = parseInt(params.get('used'), 10);
    var tiers = [].slice.call(calc.querySelectorAll('.pc__tier'));
    if (podName && tiers.length) {
      var idx = ['creative', 'digital', 'strategy'].indexOf(podName);
      if (idx >= 0 && tiers[idx]) tiers[idx].click();
    }
    var range = calc.querySelector('.pc__range');
    if (range && !isNaN(used)) {
      range.value = Math.min(used, +range.max || used);
      range.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // keep the URL in step with the state so a quote can be linked directly
    var sync = function () {
      var on = tiers.filter(function (t) { return t.classList.contains('is-on'); })[0];
      var i = tiers.indexOf(on);
      var p = new URLSearchParams(location.search);
      p.set('pod', ['creative', 'digital', 'strategy'][i] || 'creative');
      if (range) p.set('used', range.value);
      history.replaceState(null, '', location.pathname + '?' + p.toString() + location.hash);
    };
    calc.addEventListener('click', function (e) { if (e.target.closest('.pc__tier')) sync(); });
    calc.addEventListener('input', function (e) { if (e.target === range) sync(); });
  }

  /* --------------------------------------------------------- 2. keyboard --- */
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
                 document.activeElement.isContentEditable;
    if (e.key === '/' && !typing) {
      var field = document.querySelector('input[aria-label*="earch"], [aria-label*="Search"]');
      if (field) { e.preventDefault(); field.focus(); field.click(); }
    }
    if (e.key === 'Escape') {
      var open = document.querySelector('.search-out.is-open, .qsearch.is-open, .drawer.is-open');
      if (open) { open.classList.remove('is-open'); }
    }
  });

  /* Auto section switcher removed: it injected a pill row built from H2 text on
     every page with four or more anchors, which read as an unfinished ticker and
     duplicated the hand-authored switcher on /capabilities. That page keeps its
     own nav; every other page relies on the in-page headings. */
})();
