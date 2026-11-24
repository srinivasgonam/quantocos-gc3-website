/* Reveal diagram / credit-flow sections as they enter view.
   Reveal removes the "armed" class, then a timer pins the final state with inline
   styles. That belt-and-braces matters: a background tab or headless browser may
   never advance a CSS transition, and the elements would sit at opacity 0. */
(function () {
  var secs = [].slice.call(document.querySelectorAll('.dg, .cf'));
  if (!secs.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pin(sec) {
    var nodes = sec.querySelectorAll('.anat__node, .cmap__node, .cf__step');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.transition = 'none';
      nodes[i].style.opacity = '1';
    }
  }
  function show(sec) {
    sec.classList.remove('dg-armed', 'cf-armed');
    sec.classList.add(sec.classList.contains('cf') ? 'cf-in' : 'dg-in');
    setTimeout(function () { pin(sec); }, 900);
  }
  if (reduce) { secs.forEach(function (s) { show(s); pin(s); }); return; }
  secs.forEach(function (s) { s.classList.add(s.classList.contains('cf') ? 'cf-armed' : 'dg-armed'); });

  function check() {
    var vh = window.innerHeight, pending = 0;
    secs.forEach(function (s) {
      if (!s.classList.contains('dg-armed') && !s.classList.contains('cf-armed')) return;
      var r = s.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) show(s); else pending++;
    });
    return pending;
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  var t = setInterval(function () { if (check() === 0) clearInterval(t); }, 250);
  setTimeout(function () { secs.forEach(show); clearInterval(t); }, 4000);
})();
