/* ============================================================================
   prism-stage.js — PRISM interactivity: scroll-linked stage advance, live state
   on activation, and real destinations for the in-panel actions.

   Replaces prism-stages.js (same pill nav, plus motion). Nothing here fakes
   behaviour: the two in-panel controls are links to the pages that actually
   carry the contract and the gates.
   ========================================================================= */
(function () {
  'use strict';
  var stage = document.querySelector('.story__stage');
  if (!stage) return;
  var panels = [].slice.call(stage.querySelectorAll('.pf[data-panel]'));
  if (!panels.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* ---- pill nav ---------------------------------------------------------- */
  var nav = document.createElement('div');
  nav.className = 'pstage';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Prism screens');

  panels.forEach(function (p, i) {
    var t = p.querySelector('.pf__meta h4');
    var label = t ? t.textContent.trim() : '';
    if (!label) {
      var title = p.querySelector('.pf__title');
      var tv = title ? title.textContent.trim() : '';
      if (tv && tv !== 'Prism') label = tv;
    }
    if (!label) {
      var KINDS = {
        'pui-brief': 'Brief submission', 'pui-ledger': 'Credit ledger',
        'pui-track': 'Deliverable tracking', 'pui-review': 'Review comments',
        'pui-approve': 'Approval', 'pui-approval': 'Approval', 'pui-report': 'Monthly report'
      };
      Object.keys(KINDS).forEach(function (k) {
        if (!label && p.querySelector('.' + k)) label = KINDS[k];
      });
    }
    if (!label) label = 'Stage ' + (i + 1);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pstage__btn' + (i === 0 ? ' is-on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.textContent = label;
    b.addEventListener('click', function () { manualUntil = Date.now() + 4000; activate(i); });
    nav.appendChild(b);
  });
  stage.parentNode.insertBefore(nav, stage);

  var manualUntil = 0;
  var current = -1;

  function activate(i) {
    if (i === current) return;
    current = i;
    panels.forEach(function (p, j) {
      var on = j === i;
      p.classList.toggle('is-on', on);
      p.classList.toggle('is-live', false);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) requestAnimationFrame(function () { p.classList.add('is-live'); });
    });
    [].slice.call(nav.children).forEach(function (b, j) {
      b.classList.toggle('is-on', j === i);
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
  }

  nav.addEventListener('keydown', function (e) {
    var k = [].slice.call(nav.children).indexOf(document.activeElement);
    if (k < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); nav.children[(k + 1) % panels.length].focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); nav.children[(k - 1 + panels.length) % panels.length].focus(); }
  });

  activate(0);

  /* ---- in-panel actions become real links -------------------------------- */
  [].slice.call(stage.querySelectorAll('.vz')).forEach(function (svg) {
    var text = svg.textContent || '';
    var target = /ACCEPT/.test(text) ? 'contracts.html#terms'
               : /SIGN & RELEASE/.test(text) ? 'contracts.html#terms'
               : null;
    if (!target) return;
    var a = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', target);
    a.setAttribute('href', target);
    a.setAttribute('aria-label', 'Open the contract terms');
    var box = svg.querySelectorAll('rect, text');
    [].slice.call(box).forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (t === 'ACCEPT' || t === 'SIGN & RELEASE') {
        var r = el.previousElementSibling;
        a.appendChild(r && r.tagName === 'rect' ? r : el.cloneNode(true));
        a.appendChild(el);
      }
    });
    if (a.childNodes.length) svg.appendChild(a);
    a.style.cursor = 'pointer';
  });

  /* ---- scroll-linked advance -------------------------------------------- */
  /* Geometry is cached: measuring the sticky child on every scroll gave an
     absolute top that moved as the element stuck, which made the stage jump.
     The host section's document offset is read once and on resize only. */
  if (!reduced) {
    var host = stage.closest('.story') || stage.parentElement || stage;
    var base = 0, height = 0;
    function measure() {
      base = host.getBoundingClientRect().top + window.scrollY;
      height = Math.max(320, host.offsetHeight);
    }
    measure();
    window.addEventListener('resize', measure);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (Date.now() < manualUntil) return;
        var start = base - window.innerHeight * 0.65;
        var done = (window.scrollY - start) / Math.max(1, height * 1.15);
        if (done <= 0) return;
        var i = Math.min(panels.length - 1, Math.max(0, Math.floor(done * panels.length)));
        activate(i);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
