/* "How a pod runs" — data, render, tab logic. Self-contained: no globals leak. */
(function () {
  var root = document.getElementById('pods-hero');
  if (!root) return;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CONTENT = [
    { tab:'Intake', stage:'INTAKE', title:'Start when you sign.', btn:'See how intake works', href:'onboarding.html',
      text:'Tell your manager what the work is. They map it to the right catalog, size it in credits and book your first sprint on the calendar.',
      chip:'Kickoff in days, not weeks', steps:['One manager owns your account','Work sized in credits up front','First sprint booked on day one'], badge:'ONBOARDED' },
    { tab:'Plan', stage:'PLAN', title:'One calendar, agreed first.', btn:'See a sample calendar', href:'sample-statement.html',
      text:'Your manager turns the brief into a weekly calendar: what ships, who owns it and how many credits it uses. You approve the plan, not the hours.',
      chip:'Every deliverable has a date', steps:['Priorities ranked with your team','Credits assigned per deliverable','Calendar approved before work starts'], badge:'APPROVED' },
    { tab:'Build', stage:'BUILD', title:'Built in weekly sprints.', btn:'See the build rhythm', href:'capabilities.html',
      text:'The pod builds against the calendar. Creative, growth, strategy or automation work runs in the channel you already use, with AI agents on the repeatable parts.',
      chip:'Weekly demo, not status calls', steps:['Work moves in the open','AI agents take the repeatable work','You approve, not manage'], badge:'ON TRACK' },
    { tab:'Measure', stage:'MEASURE', title:'Evidence, not assertion.', btn:'See how gates work', href:'proof.html',
      text:'Five gates run before anything ships. Each item is checked and signed off, and the monthly statement shows exactly which credits were spent on what.',
      chip:'Show the gate report', steps:['Gates 1-3 signed off','Rework logged, never hidden','Credit use itemised in the portal'], badge:'PASSED' },
    { tab:'Renew', stage:'RENEW', title:'Review, resize, continue.', btn:'See a sample statement', href:'sample-statement.html',
      text:'Each month closes with a statement and a review. You see what was delivered and where the credits went, then size the next month and the subscription carries on.',
      chip:'Size the next month in credits', steps:['Monthly statement, line by line','Credit balance visible in the portal','Next calendar planned with your manager'], badge:'RENEWED' }
  ];

  var tabs = root.querySelector('.tabs');
  var stage = root.querySelector('.stage');
  var slides = root.querySelector('.slides');
  var pill = root.querySelector('.pill');
  if (!pill) { pill = document.createElement('span'); pill.className = 'pill'; pill.setAttribute('aria-hidden','true'); root.querySelector('.tabs').appendChild(pill); }
  var mark = root.querySelector('.mark');
  var ripple = root.querySelector('.ripple');

  // buttons
  CONTENT.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role','tab'); b.id = 'podtab-' + i;
    b.setAttribute('aria-controls','podpanel-' + i);
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.setAttribute('data-i', i); b.textContent = c.tab;
    tabs.appendChild(b);
  });

  // slides
  CONTENT.forEach(function (c, i) {
    var words = c.title.split(' ').map(function (w, k) {
      return '<span style="animation-delay:' + (k * 70) + 'ms">' + w + '</span>';
    }).join(' ');
    var slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.id = 'podpanel-' + i; slide.setAttribute('role','tabpanel');
    slide.setAttribute('aria-labelledby','podtab-' + i);
    slide.innerHTML =
      '<div class="copy">' +
        '<p class="eyebrow">0' + (i + 1) + ' · ' + c.stage + '</p>' +
        '<h1>' + words + '</h1>' +
        '<p>' + c.text + '</p>' +
        '<a class="btn" href="' + c.href + '">' + c.btn + ' <span aria-hidden="true">↗</span></a>' +
      '</div>' +
      '<div class="demo">' +
        '<div class="chip"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.2 6.1L20 10l-5.8 1.9L12 18l-2.2-6.1L4 10l5.8-1.9z" stroke="#0b2a3a" stroke-width="1.6" stroke-linejoin="round"/></svg><span>' + c.chip + '</span></div>' +
        '<div class="card"><small>AT ' + c.stage + '</small><ul>' +
          c.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
        '</ul><span class="badge">✓ ' + c.badge + '</span></div>' +
      '</div>';
    slides.appendChild(slide);
  });

  var btns = [].slice.call(tabs.querySelectorAll('[role="tab"]'));
  var panels = [].slice.call(slides.querySelectorAll('.slide'));
  var cur = 0, lock = false, pending = null;

  function placePill(i) {
    var b = btns[i];
    pill.style.width = b.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (b.offsetLeft - 6) + 'px)';
  }
  function settle() {
    lock = false;
    if (pending !== null && pending !== cur) { var n = pending; pending = null; goTo(n); }
  }
  function pulse() {
    if (RM || !ripple) return;
    ripple.style.left = mark.offsetLeft + 'px';
    ripple.style.top = mark.offsetTop + 'px';
    ripple.animate([{ transform:'scale(1)', opacity:.9 }, { transform:'scale(2.1)', opacity:0 }],
      { duration:1300, easing:'cubic-bezier(.22,.8,.24,1)' });
  }
  function goTo(i) {
    if (i < 0 || i >= CONTENT.length) return;
    if (lock) { pending = i; return; }
    if (i === cur) return;
    lock = true;
    var prev = cur; cur = i;
    root.setAttribute('data-i', i);
    root.style.setProperty('--ang', (i * 72) + 'deg');
    btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    placePill(i); pulse();
    panels[prev].classList.remove('active');
    setTimeout(function () {
      panels[i].classList.add('active');
      setTimeout(settle, RM ? 0 : 520);
    }, RM ? 0 : 240);
  }

  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[role="tab"]');
    if (!b) return;
    goTo(parseInt(b.dataset.i, 10));
  });
  tabs.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight') { e.preventDefault(); goTo(Math.min(cur + 1, 4)); }
    else if (k === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(cur - 1, 0)); }
    else if (k === 'Home') { e.preventDefault(); goTo(0); }
    else if (k === 'End') { e.preventDefault(); goTo(4); }
  });

  function sync() { placePill(cur); }
  sync();
  window.addEventListener('resize', sync);
  window.addEventListener('load', sync);
  root.setAttribute('data-i', 0);
  root.style.setProperty('--ang', '0deg');
})();
