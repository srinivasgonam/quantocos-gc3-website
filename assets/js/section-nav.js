/* ============================================================================
   section-nav.js — sticky catalogue switcher for long capability pages.
   Reads the sections that already exist on the page (id + data-label), builds a
   chip row, and marks the section in view. No sections are added, hidden or
   reordered — this only navigates what is already there.
   Mount: [data-section-nav]
   ========================================================================= */
(function () {
  'use strict';
  var nav = document.querySelector('[data-section-nav]');
  if (!nav) return;

  var ids = (nav.getAttribute('data-section-nav') || '').split(',').filter(Boolean);
  var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!sections.length) return;

  // Short labels for the chip row. Full names stay in the section headings.
  var SHORT = { creative: 'Creative', growth: 'Growth', strategy: 'Strategy',
                interactive: 'Interactive', automation: 'AI & automation', backoffice: 'Back office' };
  var items = sections.map(function (s) {
    var label = s.getAttribute('data-label') || SHORT[s.id];
    if (!label) {
      var h = s.querySelector('h2');
      label = h ? h.textContent.trim().split(' ')[0] : s.id;
    }
    return { id: s.id, label: label };
  });

  nav.innerHTML =
    '<nav class="snav" aria-label="Capability sections">' +
      items.map(function (it) {
        return '<a class="snav__chip" href="#' + it.id + '" data-for="' + it.id + '">' + it.label + '</a>';
      }).join('') +
    '</nav>';

  var chips = nav.querySelectorAll('.snav__chip');

  if ('IntersectionObserver' in window) {
    var seen = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen.set(e.target.id, e.isIntersecting); });
      var activeId = null;
      sections.forEach(function (s) { if (!activeId && seen.get(s.id)) activeId = s.id; });
      chips.forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-for') === activeId); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function (e) {
      var target = document.getElementById(c.getAttribute('data-for'));
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', '#' + target.id);
    });
  });
})();
