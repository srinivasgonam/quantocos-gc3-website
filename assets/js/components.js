/* components.js — Round 4 interactive components
   1. Five-stage tablist (roving tabindex, arrows/Home/End, no auto-advance)
   2. Count-up numbers ([data-count])
   3. Link enhancer: new tab + accessible hint for links rendered after load
   Everything null-guards: a page missing a hook must not throw.
*/
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                window.MOTION_ENABLED === false ||
                /[?&]motion=off/.test(location.search);

  /* ---------------------------------------------------------- 1. stages */
  function initStages() {
    document.querySelectorAll('[data-stages]').forEach(function (root) {
      var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = [].slice.call(root.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length || !panels.length) return;
      var pill = root.querySelector('.stg__pill');
      var fill = root.querySelector('.stg__fill');
      var ring = root.querySelector('.stg__ring .fill');
      var ringLabel = root.querySelector('.stg__ring b');
      var CIRC = 2 * Math.PI * 17;
      root.classList.add('stg-ready');

      function select(i, focus) {
        tabs.forEach(function (t, n) {
          var on = n === i;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        panels.forEach(function (p, n) {
          p.hidden = n !== i;
          p.classList.toggle('is-in', n === i);
        });
        if (pill) pill.style.transform = 'translateY(' + (i * 60) + 'px)';
        if (fill) fill.style.height = ((i + 1) / tabs.length * 100) + '%';
        if (ring) {
          ring.style.strokeDasharray = CIRC;
          ring.style.strokeDashoffset = CIRC - CIRC * ((i + 1) / tabs.length);
        }
        if (ringLabel) ringLabel.textContent = ((i + 1) * 20) + '%';
        if (focus) tabs[i].focus();
        root.dispatchEvent(new CustomEvent('stagechange', { detail: { index: i } }));
      }

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = null;
          var vertical = window.matchMedia('(min-width: 901px)').matches;
          if ((vertical && k === 'ArrowDown') || (!vertical && k === 'ArrowRight')) n = i + 1;
          else if ((vertical && k === 'ArrowUp') || (!vertical && k === 'ArrowLeft')) n = i - 1;
          else if (k === 'Home') n = 0;
          else if (k === 'End') n = tabs.length - 1;
          if (n === null) return;
          e.preventDefault();
          select((n + tabs.length) % tabs.length, true);
        });
      });
      select(0);
    });
  }

  /* --------------------------------------------------------- 2. count-up */
  function initCount() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(String(el.getAttribute('data-count')).replace(/[^\d.]/g, ''));
      if (!isFinite(target)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = prefix + target + suffix; return; }
      var t0 = null, dur = 900;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: .4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------- 2b. smooth anchors */
  function smoothAnchor() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  }

  /* ----------------------------------------------------- 3. link enhancer
     External links only. Forcing target=_blank on internal links opened a new
     tab for every nav item, killed the back button and made screen readers
     announce "(opens in a new tab)" 180 times a page. Internal links now stay
     in the same tab; only off-site destinations get the new-tab treatment. */
  var SKIP = /^(#|mailto:|tel:|javascript:)/i;
  function isExternal(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return false; }
    return u.origin !== location.origin && /^https?:$/.test(u.protocol);
  }
  function enhance(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (a) {
      if (a.dataset.tabDone === '1') return;                 // idempotent
      var href = a.getAttribute('href') || '';
      if (!href || SKIP.test(href)) return;
      if (a.hasAttribute('download')) return;
      if (!isExternal(href)) return;                         // internal: leave alone
      if (a.getAttribute('target') !== '_blank') a.setAttribute('target', '_blank');
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (r) { if (rel.indexOf(r) < 0) rel.push(r); });
      a.setAttribute('rel', rel.join(' '));
      if (!a.querySelector('.sr-only')) {
        var s = document.createElement('span');
        s.className = 'sr-only';
        s.textContent = ' (opens in a new tab)';
        a.appendChild(s);
      }
      a.dataset.tabDone = '1';
    });
  }

  /* the ported stage widget draws a horizontal pill; on desktop we run a vertical rail */
  function initStageRail() {
    var rail = document.getElementById('ph-tabs');
    var pill = document.getElementById('ph-pill');
    if (!rail || !pill) return;
    function place() {
      var act = rail.querySelector('[aria-selected="true"]');
      if (!act) return;
      var vertical = getComputedStyle(rail).flexDirection === 'column';
      if (vertical) {
        pill.style.transform = 'translateY(' + act.offsetTop + 'px)';
        pill.style.height = act.offsetHeight + 'px';
        pill.style.width = '100%';
        pill.style.left = '0';
      } else {
        pill.style.transform = 'none';
        pill.style.height = '100%';
        pill.style.width = act.offsetWidth + 'px';
        pill.style.left = act.offsetLeft + 'px';
      }
    }
    var mo = new MutationObserver(function () { requestAnimationFrame(place); });
    mo.observe(rail, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    rail.addEventListener('click', function () { requestAnimationFrame(place); });
    window.addEventListener('resize', place, { passive: true });
    requestAnimationFrame(place);
    setTimeout(place, 120);
  }

  /* a reveal that never fires must not leave a heading clipped */
  function unmaskFallback() {
    var els = document.querySelectorAll('.mask-reveal:not(.is-revealed)');
    if (!els.length) return;
    setTimeout(function () {
      document.querySelectorAll('.mask-reveal:not(.is-revealed)').forEach(function (el) {
        el.classList.add('is-revealed');
      });
    }, 400);
  }

  /* some reveal systems add their hidden class a second after load; release it at once */
  function revealGuard() {
    function release(root) {
      (root || document).querySelectorAll('.mask-reveal:not(.is-revealed), .px-reveal:not(.px-in)').forEach(function (el) {
        if (el.closest('.hero') || el.tagName === 'H1' || el.querySelector('h1')) el.classList.add('is-revealed', 'px-in');
      });
      if (!root || root === document) {
        document.querySelectorAll('h1.mask-reveal, h1.px-reveal').forEach(function (el) {
          el.classList.add('is-revealed', 'px-in');
        });
      }
    }
    release();
    [300, 900, 1800, 3000, 5000].forEach(function (t) { setTimeout(release, t); });
    if ('MutationObserver' in window) {
      new MutationObserver(function (m) {
        m.forEach(function (x) { [].forEach.call(x.addedNodes || [], function (n) { if (n.nodeType === 1) release(n); }); });
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  /* one signature animation per page type */
  function pageClass() {
    var file = (location.pathname.split('/').pop() || 'index').replace('.html', '') || 'index';
    var dir = location.pathname.split('/').slice(-2, -1)[0] || '';
    var map = { index:'pg-hero', pricing:'pg-pricing', pilot:'pg-pod', 'how-it-works':'pg-pod',
      proof:'pg-pod', company:'pg-pod', onboarding:'pg-pod', compare:'pg-compare', 'gcc-vs-pod':'pg-compare',
      glossary:'pg-glossary', insights:'pg-glossary', search:'pg-glossary',
      contact:'pg-auth', careers:'pg-auth', security:'pg-auth', contracts:'pg-auth', legal:'pg-auth' };
    var key = map[file] || (dir === 'industries' || dir === 'products' || dir === 'capabilities' ? 'pg-industry'
              : dir === 'solutions' ? 'pg-pod' : 'pg-hero');
    document.documentElement.classList.add('pg', key);
  }

  function boot() {
    pageClass();
    initStages();
    unmaskFallback();
    revealGuard();
    initStageRail();
    initCount();
    smoothAnchor();
    enhance(document);
    // dynamically rendered links (stage widgets, calculators, filters)
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          [].forEach.call(m.addedNodes || [], function (n) {
            if (n.nodeType !== 1) return;
            if (n.tagName === 'A') enhance(n.parentNode || document);
            else if (n.querySelectorAll) enhance(n);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
