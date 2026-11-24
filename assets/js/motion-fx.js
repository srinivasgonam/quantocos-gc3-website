/* Motion system: scroll progress, scrubbed headline words, one reveal pass,
   pointer tilt, counters. Transform/opacity only, one rAF loop, one observer,
   off under prefers-reduced-motion. Nothing here hides content without an
   immediate fallback. */
(function () {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM) return;

  /* ---------- 1. scroll progress bar ---------- */
  var bar = document.querySelector('.fx-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  /* ---------- 2. split headings into words ---------- */
  var heads = [].slice.call(document.querySelectorAll('h1, .band h2'))
    .filter(function (h) {
      if (h.closest('.pod') || !h.innerText.trim()) return false;
      /* never split gradient text: spans would not inherit background-clip and turn invisible */
      var cs = getComputedStyle(h);
      if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.color === 'rgba(0, 0, 0, 0)') return false;
      /* gradient headlines live in <em> with background-clip:text — spans inside break the fill */
      var em = h.querySelector('em, .grad');
      if (em) {
        var ecs = getComputedStyle(em);
        if (ecs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || /gradient/.test(ecs.backgroundImage)) return false;
      }
      return true;
    });

  heads.forEach(function (h) {
    var words = [];
    var walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (n) {
      var parts = n.textContent.split(/(\s+)/);
      if (!parts.join('').trim()) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span');
        s.className = 'fx-w';
        s.textContent = p;
        frag.appendChild(s);
        words.push(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    if (words.length) {
      h.classList.add('fx-words');
      h._fxWords = words;
      /* headings already on screen at load stay fully lit — never dim the first view */
      h._fxInstant = h.getBoundingClientRect().top < window.innerHeight * 0.95;
    }
  });

  /* ---------- 3. counters ---------- */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));

  /* ---------- 4. tilt ---------- */
  var tiltCards = [].slice.call(document.querySelectorAll('.card')).slice(0, 40);
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) {
    tiltCards.forEach(function (c) {
      c.classList.add('fx-tiltable');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg)';
        c.style.setProperty('--lx', ((px + .5) * 100).toFixed(1) + '%');
        c.style.setProperty('--ly', ((py + .5) * 100).toFixed(1) + '%');
      }, { passive: true });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------- 5. one rAF loop ---------- */
  var ticking = false, counted = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    var doc = document.documentElement;

    var max = doc.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';

    heads.forEach(function (h) {
      if (!h._fxWords) return;
      var r = h.getBoundingClientRect();
      if (r.top > vh || r.bottom < -200) return;
      if (h._fxInstant) { h._fxWords.forEach(function (w) { w.style.opacity = '1'; }); return; }
      var p = (vh * 0.92 - r.top) / (vh * 0.5);
      p = Math.max(0, Math.min(1, p));
      var n = h._fxWords.length;
      h._fxWords.forEach(function (w, i) {
        var t = Math.max(0, Math.min(1, (p - (i / (n + 1.5))) * 2.6));
        w.style.opacity = (0.15 + 0.85 * t).toFixed(3);
      });
    });

    stackFrame();

    if (!counted && counters.length) {
      var c0 = counters[0].getBoundingClientRect();
      if (c0.top < vh * 0.9) counted = true;
    }
  }
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(frame); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);


  /* ---------- 9. internal links open in a new tab ---------- */
  (function newTab(){
    var here = location.pathname.split('/').pop() || 'index.html';
    [].slice.call(document.querySelectorAll('a[href]')).forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(h)) return;
      if (!/\.html/i.test(h)) return;
      if (h.split('#')[0].split('/').pop() === here) return;
      a.target = '_blank';
      a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener';
      if (!a.querySelector('.sr-only')) {
        var s = document.createElement('span');
        s.className = 'sr-only';
        s.textContent = ' (opens in a new tab)';
        a.appendChild(s);
      }
    });
  })();

  /* ---------- 6. loop budget: max 2 infinite animations per viewport ---------- */
  var loops = [].slice.call(document.querySelectorAll('*')).filter(function (el) {
    if (el.closest('#pods-hero')) return false;
    var cs = getComputedStyle(el);
    return cs.animationIterationCount === 'infinite' && cs.animationName !== 'none';
  });
  var killed = 0;
  loops.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width * r.height < 400) return;                /* micro glows are cheap, leave them */
    if (killed >= 5) return;
    el.style.animation = 'none'; killed++;
  });

  /* ---------- 7. counters ---------- */
  var done = new WeakSet();
  function runCount(el) {
    if (done.has(el)) return; done.add(el);
    var target = parseFloat(el.getAttribute('data-count')) || parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    if (!isFinite(target)) return;
    var pre = el.getAttribute('data-prefix') || '';
    var t0 = null, dur = 700;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v;
      if (p < 1) requestAnimationFrame(step);
    });
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.15 });
    counters.forEach(function (c) { co.observe(c); });
  }


  /* ---------- 8. sticky stack (gates) + draw-on-scroll ---------- */
  var stack = [].slice.call(document.querySelectorAll('#gates .gt2__step'));
  var cf = document.getElementById('creditflow');
  function stackFrame() {
    if (stack.length && window.innerWidth >= 820) {
      stack.forEach(function (el, i) {
        var next = stack[i + 1];
        if (!next) { el.style.transform = ''; el.style.opacity = ''; return; }
        var r = el.getBoundingClientRect(), n = next.getBoundingClientRect();
        var cover = Math.max(0, Math.min(1, (r.bottom - n.top) / r.height));
        el.style.transform = 'scale(' + (1 - cover * 0.06).toFixed(3) + ')';
        el.style.opacity = (1 - cover * 0.35).toFixed(3);
      });
    }
  }
  if (cf && 'IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cf.classList.add('cf-draw'); dio.disconnect(); } });
    }, { threshold: 0.2 });
    dio.observe(cf);
  }

  frame();
})();
