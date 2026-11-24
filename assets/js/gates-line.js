/* Five gates, scroll-scrubbed without GSAP: builds the timeline and lights each
   gate as it enters view, drawing the rail with it. Wording follows
   site-facts.json — no turnaround promises. */
(function () {
  var mount = document.querySelector('[data-gates]');
  if (!mount) return;

  var GATES = [
    { g: 'G1', name: 'Brief approval', who: 'Pod lead', text: 'Scope and credit estimate accepted before work starts.' },
    { g: 'G2', name: 'Direction selection', who: 'Specialist + client', text: 'Options are generated, a direction is chosen. Nothing is produced against an unapproved direction.' },
    { g: 'G3', name: 'Internal QA', who: 'Pod lead / QA', text: 'Brand, accuracy and technical checks run before anything reaches you.' },
    { g: 'G4', name: 'Client review', who: 'Your reviewer', text: 'G4 is your 48 business-hour review window, not our delivery promise.' },
    { g: 'G5', name: 'Go-live approval', who: 'Pod lead + client', text: 'Required before anything goes live — ads, sites, automations, security changes.' }
  ];

  mount.innerHTML = '<div class="gt"><div class="gt__rail" aria-hidden="true"><i></i></div><ol class="gt__list">' +
    GATES.map(function (x) {
      return '<li class="gt__item"><div class="gt__dot" aria-hidden="true"></div><div class="gt__card">' +
        '<div class="gt__meta"><b>' + x.g + '</b><span>' + x.who + '</span></div>' +
        '<h3>' + x.name + '</h3><p>' + x.text + '</p></div></li>';
    }).join('') + '</ol></div>';

  var items = [].slice.call(mount.querySelectorAll('.gt__item'));
  var rail = mount.querySelector('.gt__rail > i');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-on'); });
    if (rail) rail.style.transform = 'scaleY(1)';
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-on');
      var lit = items.filter(function (x) { return x.classList.contains('is-on'); }).length;
      if (rail) rail.style.transform = 'scaleY(' + (lit / items.length).toFixed(3) + ')';
      io.unobserve(e.target);
    });
  }, { rootMargin: '-12% 0px -18% 0px', threshold: 0.2 });

  items.forEach(function (el) { io.observe(el); });
})();
