
/* ------------------------------------------------------------- ledger tick --
   The signature motion: credit figures count up once as they enter view.
   Runs only on pages carrying .px-ledger and only on clearly numeric nodes. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  function tick(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^([^0-9]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var pre = m[1], target = parseFloat(m[2].replace(/,/g, "")), post = m[3];
    var dec = (m[2].split(".")[1] || "").length;
    var start = performance.now(), dur = 900;
    function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var out = dec ? v.toFixed(dec) : Math.round(v).toString();
      el.textContent = pre + (dec ? out : out.replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + post;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function go() {
    if (!document.body.classList.contains("px-ledger")) return;
    var sel = ".ledger-mini__t td, .stat b, .vz text, .evidence__v";
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (el) {
      var txt = el.textContent.trim();
      return txt && /^[^0-9]*\d[\d,]*(\.\d+)?[^0-9]*$/.test(txt) && txt.length < 14;
    });
    if (!nodes.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        tick(en.target);
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true });
  else go();
})();

/* ------------------------------------------------------------ ledger system --
   Numbers every section header on pages marked .px-ledger. Injected at runtime
   so the generated HTML stays untouched. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { /* still number it */ }
  function go() {
    if (!document.body.classList.contains("px-ledger")) return;
    /* one number per band: the first real section heading, never a card title */
    var heads = Array.prototype.slice.call(document.querySelectorAll(".band h2, .band h3"))
      .filter(function (h) { return !h.closest(".card, .tile, .acc, .pf, .pf-grid, .stat"); });
    var seen = [], bands = [];
    heads.forEach(function (h) {
      var band = h.closest(".band");
      if (!band || seen.indexOf(band) !== -1) return;
      if (band.querySelector(".ledger-no")) return;
      seen.push(band); bands.push(h);
    });
    if (!bands.length) return;
    var total = bands.length;
    bands.forEach(function (h, i) {
      var n = String(i + 1);
      var no = document.createElement("span");
      no.className = "ledger-no";
      no.setAttribute("aria-hidden", "true");
      no.innerHTML = "<b>" + (n.length < 2 ? "0" + n : n) + "</b> / " +
                     (total < 10 ? "0" + total : total);
      h.parentNode.insertBefore(no, h);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true });
  else go();
})();

/* ============================================================================
   site-2026.js — universal motion layer for every page.
   Composes with the existing .mv-block reveal instead of fighting it: it splits
   text INSIDE those blocks, and it skips any element another library has
   already animated (measured by computed opacity/transform at init).
   No-ops under prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  function splitWords(el, out) {
    var before = out.length;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
        var w = document.createElement("span");
        w.className = "px-word";
        var i = document.createElement("i");
        i.textContent = chunk;
        w.appendChild(i);
        frag.appendChild(w);
        out.push(i);
      });
      el.replaceChild(frag, node);
    });
    /* headline text may sit inside a wrapping span, not a bare text node */
    if (out.length === before) {
      Array.prototype.slice.call(el.children).forEach(function (c) {
        if (c.tagName !== "EM" && c.tagName !== "SVG") splitWords(c, out);
      });
    }
  }

  ready(function () {
    try {
    var gsap = window.gsap;
    var hero = document.querySelector(".hero--panel, .ind-hero, .prod-hero, .page-hero, .hero");
    if (!hero) { var firstH1 = document.querySelector("h1"); hero = firstH1 && firstH1.closest("section, header, main"); }
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------------------------------------------------------- progress --- */
    var bar = document.createElement("div");
    bar.id = "px-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, h.scrollTop / max) : 0) + ")";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ------------------------------------------------------- hero intro --- */
    if (hero) {
      var h1 = (hero && hero.querySelector("h1")) || document.querySelector("h1");
    if (!hero && h1) hero = h1.closest("section, header, main") || h1.parentElement;
      var em = h1 && h1.querySelector("em");
      var sub = hero.querySelector(".hero__sub, .ind-hero__sub, .lead");
      var cta = hero.querySelector(".hero__cta, .ind-hero__cta, .cta-row");
      var ev = Array.prototype.slice.call(hero.querySelectorAll(".evidence__item, .hero-pills li"));
      var words = [];

      function splitTitle() {
        if (!h1) return;
        var blocks = h1.querySelectorAll(".mv-block");
        if (blocks.length) {
          Array.prototype.forEach.call(blocks, function (b) {
            if (b.tagName !== "EM") splitWords(b, words);
          });
        } else {
          Array.prototype.slice.call(h1.childNodes).forEach(function (n) {
            if (n.nodeType === 3) splitWords(h1, words);
          });
        }
        if (em) words.push(em);
      }

      function animate() {
        if (!gsap || !words.length) return;
        gsap.set(words, { yPercent: 112, opacity: 0, rotate: 2 });
        /* A missing hero sub-line, CTA or evidence strip used to be pushed into
           the tween as null, which made GSAP throw "Cannot set properties of
           undefined (setting 'translate')" 40-80 times per inner page. Only
           existing nodes are tweened now. */
        var extras = [];
        if (sub) extras.push(sub);
        if (cta) extras.push(cta);
        if (ev && ev.length) extras.push(ev);
        if (extras.length) gsap.set(extras, { y: 20, opacity: 0 });
        var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(words, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.15, stagger: 0.05, ease: "expo.out" }, 0.05);
        if (sub) tl.to(sub, { y: 0, opacity: 1, duration: .9, ease: "power3.out" }, "-=0.7");
        if (cta) tl.to(cta, { y: 0, opacity: 1, duration: .75 }, "-=0.62");
        if (ev && ev.length) tl.to(ev, { y: 0, opacity: 1, duration: .65, stagger: .07 }, "-=0.55");
      }

      var tries = 0;
      (function wait() {
        if (!h1 || h1.querySelector(".mv-block") || tries > 40) { splitTitle(); animate(); return; }
        tries++;
        requestAnimationFrame(wait);
      })();

      if (fine) {
        var tilt = hero.querySelector(".hero-diagram, .ind-hero__figure, .hero__media");
        hero.addEventListener("pointermove", function (e) {
          var r = hero.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          hero.style.setProperty("--hp-mx", (px * 100).toFixed(2) + "%");
          hero.style.setProperty("--hp-my", (py * 100).toFixed(2) + "%");
          hero.classList.add("px-lit");
          if (tilt && gsap) {
            gsap.to(tilt, { rotateX: (0.5 - py) * 4, rotateY: (px - 0.5) * 6,
              transformPerspective: 1000, duration: .7, ease: "power2.out", overwrite: "auto" });
          }
        }, { passive: true });
        hero.addEventListener("pointerleave", function () {
          hero.classList.remove("px-lit");
          if (tilt && gsap) gsap.to(tilt, { rotateX: 0, rotateY: 0, duration: .9, ease: "power3.out", overwrite: "auto" });
        });
      }
    }

    /* --------------------------------------------- reveal below the fold --- */
    var sel = ".band > .wrap > .stack > *, .band .tiles > *, .band .pf-grid > *, " +
              ".band .grid > *, .band .cards > *, .band .steps > *, .band .acc, " +
              "section > .wrap > .stack > h2, section > .wrap > .stack > .lead, " +
              ".trust-strip > *, .faq > *, .cta-band > .wrap > *";
    var cands = Array.prototype.slice.call(document.querySelectorAll(sel));
    var obs = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("px-in"); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }) : null;

    var i = 0;
    /* LEGACY REVEAL DISABLED (Phase A): motion.js owns reveal; this block
       re-added hidden states after load and could strand headings. */
    cands.length = 0;
    cands.forEach(function (el) {
      if (el.closest("#px-progress") || el.classList.contains("px-word")) return;
      var cs = window.getComputedStyle(el);
      /* another library already owns this element — leave it alone */
      if (parseFloat(cs.opacity) < 0.99 || (cs.transform && cs.transform !== "none")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.classList.add("px-reveal");
      el.style.transitionDelay = ((i++ % 5) * 60) + "ms";
      if (obs) obs.observe(el);
      else el.classList.add("px-in");
    });
  } catch (e) { /* a failed reveal must never block the rest of the page */ }
  });
})();
