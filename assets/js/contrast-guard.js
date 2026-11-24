/* Contrast guard: nothing may render text in the same tone as its own background.
   Runs once after load; only touches elements that would otherwise be invisible. */
(function () {
  function lum(rgb) {
    var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function rgb(str) {
    var m = String(str).match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return [+m[0], +m[1], +m[2]];
  }
  function parseFull(str) {
    var m = String(str).match(/[\d.]+/g);
    return m ? m.map(Number) : null;
  }
  function bgOf(el) {
    var stack = [], n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      var c = parseFull(cs.backgroundColor);
      if (c && c.length >= 3 && (c.length < 4 || c[3] > 0.01)) stack.push(c);
      /* a gradient drawn as an underline (0 wide, or 1-3px tall) is not a surface */
      var underline = /^0(px|%)?\b/.test(cs.backgroundSize) || /\s[0-3]px$/.test(cs.backgroundSize);
      if (!underline && cs.backgroundImage && /gradient/.test(cs.backgroundImage)) {
        var g = cs.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (g) {
          var last = parseFull(g[g.length - 1]);
          if (last && (last.length < 4 || last[3] > 0.05)) stack.push(last);
        }
      }
      n = n.parentElement;
    }
    var base = [13, 14, 17];
    for (var i = stack.length - 1; i >= 0; i--) {
      var c2 = stack[i], a = c2.length > 3 ? c2[3] : 1;
      base = [c2[0] * a + base[0] * (1 - a), c2[1] * a + base[1] * (1 - a), c2[2] * a + base[2] * (1 - a)];
    }
    return base;
  }
  function ratio(a, b) {
    var la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  var nodes = document.querySelectorAll('main p, main h1, main h2, main h3, main h4, main li, main td, main th, main a, main span, main strong, main .acc__btn, footer p, footer a');
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    if (!el.textContent.trim()) continue;
    if (el.classList.contains('sr-only') || el.hidden) continue;
    if (el.children.length && !el.matches('a, span, strong, em, b, small, .acc__btn')) continue;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.45) continue;
    var fg = rgb(cs.color);
    if (!fg) continue;
    var bg = bgOf(el);
    if (ratio(fg, bg) >= (el.matches('a.link-arrow, .acc__btn') ? 4.5 : 3)) continue;

    /* pick the direction that the surface wants */
    var bgL = lum(bg);
    el.style.setProperty('color', bgL > 0.45 ? '#0b1220' : '#f7f6f2', 'important');
    /* an opacity dim from an animation can undo the fix — pin it */
    if (parseFloat(cs.opacity) < 0.9) el.style.setProperty('opacity', '1', 'important');
  }
})();
