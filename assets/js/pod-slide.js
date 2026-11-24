(function(){

/* ═══════════════════════════════════════════════════════════════════════
   1. CONTENT — the only place you edit copy.
   ═══════════════════════════════════════════════════════════════════════ */
const CONTENT = [
{
  "tab": "Intake",
  "initials": "IN",
  "eyebrow": "01 · INTAKE",
  "title": "Start when you sign.",
  "text": "Tell your manager what the work is. They map it to the right track, size it in credits and book your first sprint on the calendar.",
  "button": "See how intake works",
  "href": "onboarding.html",
  "chip": "Kickoff in week one",
  "label": "AT INTAKE",
  "steps": [
    "One manager owns your account",
    "Work sized in credits up front",
    "First sprint booked once access and brand ingestion are done"
  ],
  "badge": "ONBOARDED"
},
{
  "tab": "Plan",
  "initials": "PL",
  "eyebrow": "02 · PLAN",
  "title": "One calendar, agreed first.",
  "text": "Your manager turns the brief into a weekly calendar: what ships, who owns it and how many credits it uses. You approve the plan, not the hours.",
  "button": "See a sample calendar",
  "href": "sample-statement.html",
  "chip": "Every deliverable has a date",
  "label": "AT PLAN",
  "steps": [
    "Priorities ranked with your team",
    "Credits assigned per deliverable",
    "Calendar approved before work starts"
  ],
  "badge": "APPROVED"
},
{
  "tab": "Build",
  "initials": "BU",
  "eyebrow": "03 · BUILD",
  "title": "Built in weekly sprints.",
  "text": "The pod builds against the calendar. Creative, growth, strategy or automation work runs in the channel you already use, with AI agents on the repeatable parts.",
  "button": "See the build rhythm",
  "href": "capabilities.html",
  "chip": "Weekly demo, not status calls",
  "label": "AT BUILD",
  "steps": [
    "Work moves in the open",
    "AI agents take the repeatable work",
    "You approve, not manage"
  ],
  "badge": "ON TRACK"
},
{
  "tab": "Measure",
  "initials": "ME",
  "eyebrow": "04 · MEASURE",
  "title": "Evidence, not assertion.",
  "text": "The portal shows what shipped and where every credit went; your manager walks you through it at the monthly review.",
  "button": "See how credits are tracked",
  "href": "solutions.html#credits",
  "chip": "Show the gate report",
  "label": "AT MEASURE",
  "steps": [
    "Credit use itemised in the portal",
    "Credit balance and burn rate visible",
    "Monthly review with your manager"
  ],
  "badge": "PASSED"
},
{
  "tab": "Renew",
  "initials": "RE",
  "eyebrow": "05 · RENEW",
  "title": "Review, resize, continue.",
  "text": "Each month closes with a statement and a review. You see what was delivered and where the credits went, then size the next month and the subscription carries on.",
  "button": "See a worked credit example",
  "href": "#calculator",
  "chip": "Size the next month in credits",
  "label": "AT RENEW",
  "steps": [
    "Monthly statement, line by line",
    "Credit balance visible in the portal",
    "Next calendar planned with your manager"
  ],
  "badge": "RENEWED"
}
];

/* ── RIBBON PRESETS — one per tab: rotate (deg), scale, hue-shift (deg) ── */
const RIBBONS = [
  { r: -18, s: 1.00, h:   0 },   /* Intake  */
  { r:  26, s: 1.06, h:  22 },   /* Design  */
  { r:  64, s: 0.94, h: -26 },   /* Build   */
  { r: 108, s: 1.10, h:  40 },   /* Measure */
  { r: 150, s: 0.98, h:  12 }    /* Report  */
];

/* ── ROTATION STEP — degrees per tab (index × step, never wrapped) ── */
const ROT_STEP = 72;
/* orbit follow factors: same sign as the disc, different magnitude */
const ORBIT_FACTOR = [1.2, 0.8, 0.5];

/* ═══════════════════════════════════════════════════════════════════════
   2. BUILD
   ═══════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const hero     = $('hero');
const wrap     = $('ribbonWrap');
const ribbon   = $('ribbon');
const underline= $('underline');
const tabsEl   = $('tabs');
const pill     = $('pill');
const colL     = $('colLeft');
const colR     = $('colRight');
const cardsEl  = $('cards');
const chip     = $('chip');
const chipText = $('chipText');
const circleSpin = $('circleSpin');
const face     = $('face');

const orbitTurns = [...document.querySelectorAll('.orbit-turn')];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D  = ms => RM ? 0 : ms;          /* every timing passes through here */

const lefts = [], cards = [], tabs = [], bases = [];

CONTENT.forEach((c, i) => {
  /* ── tab ── */
  const t = document.createElement('button');
  t.className = 'tab';
  t.type = 'button';
  t.setAttribute('role', 'tab');
  t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  t.setAttribute('aria-controls', 'panel-' + i);
  t.dataset.i = i;
  t.textContent = c.tab;
  tabsEl.appendChild(t);
  tabs.push(t);

  /* ── left column ── */
  const l = document.createElement('div');
  l.className = 'slide-l';
  l.id = 'panel-' + i;
  l.setAttribute('role', 'tabpanel');
  l.setAttribute('aria-labelledby', 'tab-' + i);
  t.id = 'tab-' + i;

  const words = c.title.split(' ');
  const h1 = document.createElement('h1');
  h1.className = 's-title';
  words.forEach((w, k) => {
    const s = document.createElement('span');
    s.className = 'rise word';
    s.textContent = w;
    s.style.setProperty('--d', D(k * 70) + 'ms');
    h1.appendChild(s);
    h1.appendChild(document.createTextNode(' '));
  });

  const base = D((words.length - 1) * 70 + 90);   /* element stagger starts after the words */
  bases[i] = base;

  const p = document.createElement('p');
  p.className = 's-text rise';
  p.textContent = c.text;
  p.style.setProperty('--d', base + 'ms');

  const bw = document.createElement('div');
  bw.className = 'btn-wrap rise';
  bw.style.setProperty('--d', base + D(90) + 'ms');
  const btn = document.createElement('a');
  btn.className = 'btn';
  btn.href = '#';
  btn.innerHTML = '<span>' + c.button + '</span><span class="arw" aria-hidden="true">↗</span>';
  bw.appendChild(btn);

  l.append(h1, p, bw);
  colL.appendChild(l);
  lefts.push(l);

  /* ── card column ── */
  const sc = document.createElement('div');
  sc.className = 'slide-c';

  const card = document.createElement('div');
  card.className = 'card rise';
  card.style.setProperty('--d', base + D(270) + 'ms');

  const lab = document.createElement('div');
  lab.className = 'card-label rise';
  lab.textContent = c.label;
  lab.style.setProperty('--d', base + D(330) + 'ms');

  const list = document.createElement('div');
  c.steps.forEach((step, j) => {
    const row = document.createElement('div');
    row.className = 'row rise';
    row.style.setProperty('--d', base + D(400 + j * 90) + 'ms');
    const tick = document.createElement('span');
    tick.className = 'tick';
    const txt = document.createElement('span');
    txt.textContent = step;
    row.append(tick, txt);
    list.appendChild(row);
  });

  const badge = document.createElement('div');
  badge.className = 'badge';
  badge.textContent = '✓ ' + c.badge;

  card.append(lab, list, badge);
  sc.appendChild(card);
  cardsEl.appendChild(sc);
  cards.push(sc);
});

/* ═══════════════════════════════════════════════════════════════════════
   3. STATE
   ═══════════════════════════════════════════════════════════════════════ */
let cur = 0, lock = false, pending = null;
const OUT = RM ? 0 : 450;            /* old slide leaves, then the new one enters */

function movePill(n){
  const b = tabs[n];
  pill.style.width = b.offsetWidth + 'px';
  pill.style.transform = 'translateX(' + b.offsetLeft + 'px)';
}

function spawnRipple(){
  if (RM) return;
  const s = document.createElement('span');
  s.className = 'ripple';
  colR.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}

function sweepUnderline(){
  underline.classList.remove('sweep');
  void underline.offsetWidth;
  if (!RM) underline.classList.add('sweep');
}

function chrome(n){
  tabs.forEach((t, k) => t.setAttribute('aria-selected', k === n ? 'true' : 'false'));
  movePill(n);
  const b = tabs[n];
  /* no scrollIntoView: it scrolled the section itself and shifted the slide */

  /* circle: absolute angle, never modulo — CSS interpolates the real difference,
     so right-hand tabs turn clockwise and left-hand tabs turn counter-clockwise */
  circleSpin.style.transform = 'rotate(' + (n * ROT_STEP) + 'deg)';
  spawnRipple();

  sweepUnderline();

  const rb = RIBBONS[n] || RIBBONS[0];
  ribbon.style.setProperty('--r', rb.r);
  ribbon.style.setProperty('--s', rb.s);
  ribbon.style.setProperty('--h', rb.h);

  orbitTurns.forEach((el, k) => {
    el.style.transform = 'rotate(' + (n * ROT_STEP * ORBIT_FACTOR[k]) + 'deg)';
  });
}

function goTo(n){
  if (n < 0 || n >= CONTENT.length) return;
  if (lock) { pending = n; return; }
  if (n === cur) return;
  lock = true;
  const prev = cur;
  const base = bases[n];

  /* 1 — everything chrome-related starts together */
  chrome(n);
  face.classList.add('swap');           /* initials hand over mid-turn */

  /* 2 — old content fades up and out (0.45s) */
  lefts[prev].classList.add('leaving');
  cards[prev].classList.add('leaving');
  chip.classList.remove('in');
  chip.classList.add('leaving');

  /* 3 — new content enters, staggered */
  setTimeout(() => {
    lefts[prev].classList.remove('active', 'leaving');
    cards[prev].classList.remove('active', 'leaving');
    [lefts[prev], cards[prev]].forEach(el =>
      el.querySelectorAll('.rise').forEach(e => e.classList.remove('in')));

    face.textContent = CONTENT[n].initials;
    face.classList.remove('swap');
    chipText.textContent = CONTENT[n].chip;
    chip.style.setProperty('--d', base + D(180) + 'ms');
    chip.classList.remove('leaving');

    lefts[n].classList.add('active');
    cards[n].classList.add('active');
    void document.body.offsetWidth;      /* flush, so the rise starts from the base state */

    lefts[n].querySelectorAll('.rise').forEach(e => e.classList.add('in'));
    cards[n].querySelectorAll('.rise').forEach(e => e.classList.add('in'));
    chip.classList.add('in');

    if (document.activeElement && document.activeElement.classList.contains('tab')) {
      tabs[n].focus({ preventScroll: true });
    }

    cur = n;
    const total = D(base + 1080);
    setTimeout(() => {
      lock = false;
      if (pending !== null && pending !== cur) { var nx = pending; pending = null; goTo(nx); }
    }, Math.min(total, 1250) + 60);
  }, OUT);
}

/* ═══════════════════════════════════════════════════════════════════════
   4. INPUT
   ═══════════════════════════════════════════════════════════════════════ */
tabsEl.addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (b) goTo(+b.dataset.i);
});

window.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if (e.key === 'ArrowRight'){ e.preventDefault(); goTo(Math.min(cur + 1, CONTENT.length - 1)); }
  else if (e.key === 'ArrowLeft'){ e.preventDefault(); goTo(Math.max(cur - 1, 0)); }
});

/* mouse drift on the ribbon */
if (!RM && hero) {
  let raf = 0, tx = 0, ty = 0;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5) * 2;
    ty = ((e.clientY - r.top) / r.height - .5) * 2;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      wrap.style.setProperty('--mx', (tx * 20).toFixed(1) + 'px');
      wrap.style.setProperty('--my', (ty * 14).toFixed(1) + 'px');
    });
  });
}

window.addEventListener('resize', () => movePill(cur));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(cur));

/* ═══════════════════════════════════════════════════════════════════════
   5. MOUNT
   ═══════════════════════════════════════════════════════════════════════ */
lefts[0].classList.add('active');
cards[0].classList.add('active');
face.textContent = CONTENT[0].initials;
chipText.textContent = CONTENT[0].chip;
chip.style.setProperty('--d', bases[0] + D(180) + 'ms');

chrome(0);
requestAnimationFrame(() => requestAnimationFrame(() => {
  lefts[0].querySelectorAll('.rise').forEach(e => e.classList.add('in'));
  cards[0].querySelectorAll('.rise').forEach(e => e.classList.add('in'));
  chip.classList.add('in');
}));

})();