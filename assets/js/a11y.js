/* Accessibility: keep keyboard focus inside the mobile drawer while it is open. */
(function () {
  var drawer = document.getElementById('drawer');
  if (!drawer) return;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (!drawer.classList.contains('is-open')) return;
    var f = drawer.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
