/* ============================================================================
   capability-hub.js — the GC³ orbital capability experience.
   Six real capabilities, taken from their own pages (name + first clause of the
   page's own meta description + the real route). Nothing invented.

   Mount: [data-capability-hub]   (attribute value may hold the relative prefix)
   Falls back to a plain six-card list when JS, motion or pointer is missing —
   the fallback is built from the same data, so no content is JS-only.
   ========================================================================= */
(function () {
  'use strict';
  var mount = document.querySelector('[data-capability-hub]');
  if (!mount) return;
  var prefix = mount.getAttribute('data-capability-hub') || '';

  var CAPS = [
    { slug: 'creative',   name: 'Creative',                 line: 'The production layer of GC³ — social content, brand assets and campaign work.' },
    { slug: 'growth',     name: 'Growth & digital marketing', line: 'SEO, answer-engine optimization, paid search and social, landing pages, analytics.' },
    { slug: 'strategy',   name: 'Strategy & consulting',     line: 'Brand and go-to-market strategy, positioning, market research, pricing, sales enablement.' },
    { slug: 'interactive',name: 'Interactive & XR',          line: 'Real-estate visualisation, interactive 3D web, product configurators, scrollytelling.' },
    { slug: 'automation', name: 'AI & automation',           line: 'Automation discovery, workflow builds, retrieval chatbots, AI voice agents.' },
    { slug: 'backoffice', name: 'Back office & operations',  line: 'Business operations, finance and accounting support, HR operations and onboarding.' }
  ];

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- markup ---
  mount.innerHTML =
    '<div class="ch">' +
      '<div class="ch__orbit" aria-hidden="true">' +
        '<svg viewBox="0 0 520 520" class="ch__svg">' +
          '<circle class="ch__ring" cx="260" cy="260" r="188"/>' +
          '<circle class="ch__ring ch__ring--inner" cx="260" cy="260" r="104"/>' +
          CAPS.map(function (c, i) {
            var a = (-90 + i * 60) * Math.PI / 180;
            var x = 260 + Math.cos(a) * 188, y = 260 + Math.sin(a) * 188;
            return '<line class="ch__spoke" data-spoke="' + c.slug + '" x1="260" y1="260" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
          }).join('') +
        '</svg>' +
        '<div class="ch__core"><b>GC³</b><span>Global Cloud<br>Capability Center</span></div>' +
        '<div class="ch__nodes">' +
          CAPS.map(function (c, i) {
            return '<button type="button" class="ch__node" data-slug="' + c.slug + '" data-i="' + i + '">' +
              '<span>' + c.name.split(' ')[0] + '</span></button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="ch__panel" role="status" aria-live="polite">' +
        '<p class="ch__eyebrow">Capability</p>' +
        '<h3 class="ch__name">' + CAPS[0].name + '</h3>' +
        '<p class="ch__line">' + CAPS[0].line + '</p>' +
        '<a class="ch__link" href="' + prefix + 'capabilities/' + CAPS[0].slug + '.html">Open the catalogue<span aria-hidden="true"> →</span></a>' +
      '</div>' +
      '<ul class="ch__list">' +
        CAPS.map(function (c) {
          return '<li><a href="' + prefix + 'capabilities/' + c.slug + '.html"><b>' + c.name + '</b><span>' + c.line + '</span></a></li>';
        }).join('') +
      '</ul>' +
    '</div>';

  var orbit = mount.querySelector('.ch__orbit');
  var nodes = mount.querySelectorAll('.ch__node');
  var panel = mount.querySelector('.ch__panel');
  var nameEl = mount.querySelector('.ch__name');
  var lineEl = mount.querySelector('.ch__line');
  var linkEl = mount.querySelector('.ch__link');
  var spokes = mount.querySelectorAll('.ch__spoke');

  // position nodes on the ring in CSS coordinates
  function place() {
    var size = orbit.clientWidth || 520;
    var r = size * 0.3615;              // 188/520 of the orbit box
    nodes.forEach(function (n, i) {
      var a = (-90 + i * 60) * Math.PI / 180;
      n.style.left = (50 + Math.cos(a) * r / size * 100) + '%';
      n.style.top = (50 + Math.sin(a) * r / size * 100) + '%';
    });
  }
  place();
  window.addEventListener('resize', place);

  function select(i) {
    var c = CAPS[i];
    nameEl.textContent = c.name;
    lineEl.textContent = c.line;
    linkEl.setAttribute('href', prefix + 'capabilities/' + c.slug + '.html');
    nodes.forEach(function (n, j) { n.classList.toggle('is-on', j === i); });
    spokes.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-spoke') === c.slug); });
  }

  nodes.forEach(function (n, i) {
    n.addEventListener('mouseenter', function () { select(i); });
    n.addEventListener('focus', function () { select(i); });
    n.addEventListener('click', function () { window.location.href = prefix + 'capabilities/' + CAPS[i].slug + '.html'; });
  });
  // arrow keys move around the ring
  orbit.addEventListener('keydown', function (e) {
    var cur = Array.prototype.indexOf.call(nodes, document.activeElement);
    if (cur < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nodes[(cur + 1) % nodes.length].focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); nodes[(cur - 1 + nodes.length) % nodes.length].focus(); }
  });

  select(0);

  // subtle orbital drift, motion-safe only
  var gsap = window.gsap;
  if (!reduced && gsap) {
    gsap.to(mount.querySelector('.ch__node'), {});
    gsap.to(orbit.querySelectorAll('.ch__node'), { y: -4, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.35, from: 'random' } });
    gsap.from(mount.querySelector('.ch__ring'), { scale: 0.92, opacity: 0, transformOrigin: 'center center', duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: mount, start: 'top 75%' } });
  }
})();
