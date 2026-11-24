/* Pod stage hero — 5 tabs. Content is DATA only; every tab is always clickable. */
(function () {
  'use strict';

  var DATA = [
    { tab: 'Intake', eyebrow: '01 · INTAKE', title: 'Start when you sign.',
      text: 'Tell your manager what the work is. They map it to the right catalog, size it in credits and book your first sprint on the calendar. No scoping call, no proposal.',
      button: 'See how intake works', href: 'onboarding.html', chip: 'Kickoff in days, not weeks',
      label: 'AT INTAKE', steps: ['One manager owns your account', 'Work sized in credits up front', 'First sprint booked on day one'], badge: 'ONBOARDED' },
    { tab: 'Plan', eyebrow: '02 · PLAN', title: 'One calendar, agreed first.',
      text: 'Your manager turns the brief into a weekly calendar: what ships, who owns it and how many credits it uses. You approve the plan, not the hours.',
      button: 'See a sample calendar', href: 'how-a-pod-runs.html', chip: 'Every deliverable has a date',
      label: 'AT PLAN', steps: ['Priorities ranked with your team', 'Credits assigned per deliverable', 'Calendar approved before work starts'], badge: 'APPROVED' },
    { tab: 'Build', eyebrow: '03 · BUILD', title: 'Built in weekly sprints.',
      text: 'The pod builds against the calendar. Creative, growth, strategy or automation work runs in the channel you already use, with AI agents on the repeatable parts.',
      button: 'See the build rhythm', href: 'capabilities.html', chip: 'Weekly demo, not status calls',
      label: 'AT BUILD', steps: ['Work moves in the open', 'AI agents take the repeatable work', 'You approve, not manage'], badge: 'ON TRACK' },
    { tab: 'Measure', eyebrow: '04 · MEASURE', title: 'Evidence, not assertion.',
      text: 'Five gates run before anything ships. Each item is checked and signed off, and the monthly statement shows exactly which credits were spent on what.',
      button: 'See how gates work', href: 'proof.html', chip: 'Show the gate report',
      label: 'AT MEASURE', steps: ['Gates 1-3 signed off', 'Rework logged, never hidden', 'Credit use itemised in the portal'], badge: 'PASSED' },
    { tab: 'Renew', eyebrow: '05 · RENEW', title: 'Review, resize, continue.',
      text: 'Each month closes with a statement and a review. You see what was delivered and where the credits went, then size the next month and the subscription carries on.',
      button: 'See a sample statement', href: 'contracts.html', chip: 'Size the next month in credits',
      label: 'AT RENEW', steps: ['Monthly statement, line by line', 'Credit balance visible in the portal', 'Next calendar planned with your manager'], badge: 'RENEWED' }
  ];

  var root = document.getElementById('pods-hero');
  if (!root) return;
  var list = document.getElementById('ph-tabs');
  var pill = document.getElementById('ph-pill');
  var stage = document.getElementById('ph-stage');
  if (!list || !pill || !stage) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = [], buttons = [], current = 0, busy = false, pending = null, ang = 0, STEP = 72, raf = 0;
  var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#0e6e7e"/></svg>';

  DATA.forEach(function (d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.i = i;
    b.id = 'ph-tab-' + i;
    b.setAttribute('aria-controls', 'ph-slide-' + i);
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.tabIndex = i === 0 ? 0 : -1;
    b.textContent = d.tab;
    list.appendChild(b);
    buttons.push(b);

    var s = document.createElement('section');
    s.className = 'ph-slide' + (i === 0 ? ' active' : '');
    s.id = 'ph-slide-' + i;
    s.dataset.i = i;
    s.setAttribute('role', 'tabpanel');
    s.setAttribute('aria-labelledby', 'ph-tab-' + i);
    var words = d.title.split(' ');
    s.innerHTML =
      '<div class="ph-copy">' +
        '<p class="ph-eyebrow">' + d.eyebrow + '</p>' +
        '<h1>' + words.map(function (w, k) { return '<span class="ph-w" style="--w:' + k + '">' + w + '</span>'; }).join(' ') + '</h1>' +
        '<p class="ph-text">' + d.text + '</p>' +
        '<a class="ph-btn" href="' + d.href + '">' + d.button + ' <span aria-hidden="true">↗</span></a>' +
      '</div>' +
      '<div class="ph-demo">' +
        '<div class="ph-orb" aria-hidden="true">' +
          '<div class="ph-ring" style="--s:min(46vw,620px);--t:70s"><i class="ph-rin" style="--k:1"><b class="ph-dot"></b></i></div>' +
          '<div class="ph-ring r2" style="--s:min(62vw,840px);--t:110s"><i class="ph-rin" style="--k:-1"><b class="ph-dot b"></b></i></div>' +
        '</div>' +
        '<div class="ph-mark in" aria-hidden="true"></div>' +
        '<div class="ph-chip" aria-hidden="true">' + SPARK + '<span>' + d.chip + '</span></div>' +
        '<div class="ph-card">' +
          '<small>' + d.label + '</small>' +
          '<ul>' + d.steps.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
          '<div class="ph-card-head"><span class="ph-badge">' + d.badge + '</span></div>' +
        '</div>' +
      '</div>';
    stage.appendChild(s);
    slides.push(s);
  });

  function placePill(i) {
    var b = buttons[i];
    if (!b) return;
    pill.style.width = b.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (b.offsetLeft - 6) + 'px)';
  }

  function sweep() {
    cancelAnimationFrame(raf);
    if (reduce) return;
    raf = requestAnimationFrame(function () {
      var ul = root.querySelector('.ph-uline');
      if (!ul) return;
      ul.classList.remove('p'); void ul.offsetWidth; ul.classList.add('p');
    });
  }

  function apply(i) {
    var from = slides[current], to = slides[i];
    buttons.forEach(function (b, n) {
      b.setAttribute('aria-selected', n === i ? 'true' : 'false');
      b.tabIndex = n === i ? 0 : -1;
    });
    placePill(i);
    sweep();
    ang += ((i - current + DATA.length) % DATA.length) * STEP;
    to.style.setProperty('--ang', ang + 'deg');
    to.querySelectorAll('.ph-rin').forEach(function (r) { r.style.setProperty('--ang', ang + 'deg'); });
    root.setAttribute('data-i', i);
    var demo = to.querySelector('.ph-demo');
    if (demo && !reduce) {
      var rp = document.createElement('span');
      rp.className = 'ph-ripple';
      rp.setAttribute('aria-hidden', 'true');
      demo.appendChild(rp);
      setTimeout(function () { rp.remove(); }, 1400);
    }
    if (from && from !== to) {
      from.classList.remove('active');
      from.classList.add('leaving');
      setTimeout(function () { from.classList.remove('leaving'); }, 340);
    }
    to.classList.add('active');
    current = i;
    setTimeout(release, 380);          /* the lock always releases */
  }

  function release() {
    busy = false;
    if (pending !== null) {
      var next = pending; pending = null;
      request(next);
    }
  }

  function request(i) {
    i = parseInt(i, 10);
    if (isNaN(i) || i < 0 || i >= DATA.length) return;
    if (busy) { pending = i; return; }
    if (i === current) { busy = false; return; }
    busy = true;
    try { apply(i); } catch (e) { busy = false; pending = null; }
    setTimeout(function () { busy = false; }, 420);
  }

  /* one delegated listener on the tablist — index always from data-i */
  list.addEventListener('click', function (e) {
    var b = e.target.closest('[role="tab"]');
    if (!b || !list.contains(b)) return;
    request(b.dataset.i);
  });

  list.addEventListener('keydown', function (e) {
    var k = e.key, n = null;
    if (k === 'ArrowRight') n = (current + 1) % DATA.length;
    else if (k === 'ArrowLeft') n = (current - 1 + DATA.length) % DATA.length;
    else if (k === 'Home') n = 0;
    else if (k === 'End') n = DATA.length - 1;
    if (n === null) return;
    e.preventDefault();
    request(n);
    buttons[n].focus();
  });

  /* pointer parallax on decoration only */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    root.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect();
      root.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      root.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    }, { passive: true });
    root.addEventListener('pointerleave', function () {
      root.style.setProperty('--mx', '0'); root.style.setProperty('--my', '0');
    });
  }

  placePill(0);
  addEventListener('resize', function () { placePill(current); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placePill(current); });
})();
