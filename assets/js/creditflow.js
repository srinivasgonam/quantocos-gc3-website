/* Credit flow: arm on load, play when the section enters the viewport.
   Scroll-position check rather than IntersectionObserver — the observer was
   unreliable here, and a rect test is a dozen lines with no failure mode.
   If JS never runs, the CSS leaves the four steps visible. */
(function () {
  var sec = document.getElementById('creditflow');
  if (!sec) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { sec.classList.add('cf-in'); return; }

  sec.classList.add('cf-armed');
  var played = false, queued = false;

  function check() {
    queued = false;
    if (played) return;
    var r = sec.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.88 && r.bottom > 0) {
      played = true;
      sec.classList.add('cf-in');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', check);
  check();
})();
