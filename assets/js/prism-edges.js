/* Marks cards and buttons for the prism gradient edge (prism-edges.css). */
(function () {
  var BTN = '.btn, .acc__cta, .mobile-cta a, .mobile-cta button, .hdr .search-btn, main button, main a[class*="btn"], main a[class*="cta"], .ftr button, .ftr a[class*="btn"]';
  var SKIP = '.hdr, .drawer, .ftr, footer, .hero__media, .pbg, svg, canvas, table, .hfit, .q-cookie, .orbits';
  var TAGS = { DIV: 1, ARTICLE: 1, LI: 1, A: 1, ASIDE: 1, SECTION: 1, FORM: 1, DETAILS: 1, FIGURE: 1, DL: 1, BLOCKQUOTE: 1 };

  function solid(c) {
    var m = String(c).match(/[\d.]+/g);
    return !!m && (m.length < 4 || +m[3] > 0.02);
  }
  function free(el, p) {
    var c = getComputedStyle(el, p).content;
    return c === 'none' || c === 'normal' || c === '';
  }
  function mark(el, isBtn) {
    if (el.classList.contains('prism')) return;
    var cs = getComputedStyle(el);
    if (cs.position === 'static') el.classList.add('prism-rel');
    if (free(el, '::after')) el.classList.add('prism-a');
    else if (free(el, '::before')) el.classList.add('prism-b');
    else {
      var i = document.createElement('i');
      i.className = 'prism-i';
      i.setAttribute('aria-hidden', 'true');
      el.appendChild(i);
    }
    el.classList.add('prism');
    if (isBtn) el.classList.add('prism--btn');
  }
  function isBox(cs) {
    var bw = parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderBottomWidth) > 0 &&
      parseFloat(cs.borderLeftWidth) > 0 && parseFloat(cs.borderRightWidth) > 0 && cs.borderTopStyle !== 'none' && solid(cs.borderTopColor);
    var fill = solid(cs.backgroundColor) || /gradient|url/.test(cs.backgroundImage) || cs.boxShadow !== 'none';
    return bw || fill;
  }
  function run() {
    document.querySelectorAll(BTN).forEach(function (el) {
      if (el.classList.contains('prism') || el.closest('.prism--btn')) return;
      var cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (r.width && (r.width < 56 || r.height < 24)) return;
      if (cs.display === 'inline' || parseFloat(cs.borderTopLeftRadius) < 2 || !isBox(cs)) return;
      mark(el, true);
    });
    var all = document.querySelectorAll('main *');
    for (var k = 0; k < all.length; k++) {
      var el = all[k];
      if (!TAGS[el.tagName] || el.classList.contains('prism') || el.classList.contains('hero')) continue;
      if (el.closest(SKIP) || el.closest('.prism--btn')) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 130 || r.height < 70 || r.width > 1320) continue;
      var cs = getComputedStyle(el);
      var rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (rad < 6 || /%/.test(cs.borderTopLeftRadius) || rad >= Math.min(r.width, r.height) / 2) continue;
      if (cs.display === 'inline' || cs.display === 'contents') continue;
      if (!isBox(cs)) continue;
      /* a full-size wrapper inside a card would draw the same edge twice */
      var up = el.parentElement && el.parentElement.closest('.prism');
      if (up) {
        var u = up.getBoundingClientRect();
        if (Math.abs(u.width - r.width) < 12 && Math.abs(u.height - r.height) < 12) continue;
      }
      mark(el, false);
    }
  }
  var t;
  function soon() { clearTimeout(t); t = setTimeout(run, 250); }
  run();
  if (document.readyState !== 'complete') window.addEventListener('load', run);
  window.addEventListener('load', function () { setTimeout(run, 1800); });
  window.addEventListener('resize', soon);
  document.addEventListener('click', soon);
  var last = 0;
  window.addEventListener('scroll', function () { var n = Date.now(); if (n - last > 600) { last = n; soon(); } }, { passive: true });
})();
