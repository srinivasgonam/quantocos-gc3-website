/* ============================================================================
   gates-timeline.js — the five human gates, scroll-scrubbed.
   Content is from "Global SLA Terms" in the credit matrix v0.2 (G1–G5 and the
   published response windows). No invented steps or timings.
   Mount: any element with [data-gates]
   ========================================================================= */
(function () {
  'use strict';
  var mount = document.querySelector('[data-gates]');
  if (!mount) return;

  var GATES = [
    { g: 'G1', name: 'Brief approval', who: 'Pod lead', text: 'Scope and credit estimate accepted before work starts. Acknowledged within 1 business hour; clarification and estimate within 4.' },
    { g: 'G2', name: 'Direction selection', who: 'Specialist + client', text: 'Options are generated, a direction is chosen. Nothing is produced against an unapproved direction.' },
    { g: 'G3', name: 'Internal QA', who: 'Pod lead / QA', text: 'Brand, accuracy and technical checks run before anything reaches you.' },
    { g: 'G4', name: 'Client review', who: 'Your reviewer', text: '48 business-hour review window. Revisions turn around at 50% of the delivery time, minimum 4 business hours.' },
    { g: 'G5', name: 'Go-live approval', who: 'Pod lead + client', text: 'Required before anything goes live — ads, sites, automations, security changes.' }
  ];

  mount.innerHTML =
    '<div class="gt">' +
      '<div class="gt__rail" aria-hidden="true"><i></i></div>' +
      '<ol class="gt__list">' +
        GATES.map(function (x) {
          return '<li class="gt__item">' +
            '<div class="gt__dot" aria-hidden="true"></div>' +
            '<div class="gt__card">' +
              '<div class="gt__meta"><b>' + x.g + '</b><span>' + x.who + '</span></div>' +
              '<h3>' + x.name + '</h3>' +
              '<p>' + x.text + '</p>' +
            '</div>' +
          '</li>';
        }).join('') +
      '</ol>' +
    '</div>';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (reduced || !gsap || !ST) {
    mount.querySelectorAll('.gt__item').forEach(function (el) { el.classList.add('is-on'); });
    return;
  }

  var rail = mount.querySelector('.gt__rail > i');
  gsap.fromTo(rail, { scaleY: 0 }, {
    scaleY: 1, transformOrigin: 'top center', ease: 'none',
    scrollTrigger: { trigger: mount.querySelector('.gt__list'), start: 'top 75%', end: 'bottom 55%', scrub: 0.4 }
  });
  gsap.utils.toArray('.gt__item').forEach(function (el) {
    gsap.to(el, {
      '--on': 1, duration: 0.01,
      scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 55%', scrub: true,
        onEnter: function () { el.classList.add('is-on'); } }
    });
  });

  /* Safety net: ScrollTrigger never firing (no scroll container, embedded
     webview, a page where Lenis is absent) must not leave the gates dimmed
     for good. After 3s, light whatever is still off. */
  setTimeout(function () {
    var items = mount.querySelectorAll('.gt__item');
    if (mount.querySelectorAll('.gt__item.is-on').length === items.length) return;
    items.forEach(function (el) { el.classList.add('is-on'); });
    if (rail) rail.style.transform = 'scaleY(1)';
  }, 3000);
})();
