/* ============================================================================
   prism-ui.js — PRISM stages become real interfaces with working controls.

   Every button below changes state that is visible on screen. All state is local
   to the page (no backend, no network) and the panel says so — nothing here
   pretends to be a live tenant. The numbers are the published ones: $25/credit,
   120/240/360 credit pools, the credit values of four real services from the
   matrix (17.25 / 28.75 / 58.5 / 34).
   ========================================================================= */
(function () {
  'use strict';
  var stage = document.querySelector('.story__stage');
  if (!stage) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var pool = { Creative: 120, Digital: 240, Strategy: 360 };

  /* -------------------------------------------------------------- helpers */
  function pill(text, kind) {
    return '<span class="pui-pill pui-pill--' + (kind || 'mute') + '">' + text + '</span>';
  }
  function countTo(el, to, dur, fmt) {
    var format = fmt || function (v) { return (Math.round(v * 100) / 100).toString(); };
    if (reduced) { el.textContent = format(to); return; }
    var from = parseFloat(el.textContent.replace(/[^\d.]/g, '')) || 0, t0 = performance.now();
    (function tick(t) {
      var p = Math.min(1, (t - t0) / (dur || 500));
      var v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = format(v);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ------------------------------------------------------------ 1. BRIEF -- */
  function brief(body) {
    body.innerHTML =
      '<div class="pui pui-brief">' +
        '<div class="pui-col">' +
          '<div class="pui-row"><span class="pui-lab">Brief</span><span class="pui-val">B-2411 · brand refresh</span></div>' +
          '<div class="pui-row"><span class="pui-lab">Pod</span>' +
            '<span class="pui-seg" data-seg>' +
              ['Creative', 'Digital', 'Strategy'].map(function (p, i) {
                return '<button type="button" class="pui-seg__b' + (i === 0 ? ' is-on' : '') + '" data-pod="' + p + '">' + p + '</button>';
              }).join('') +
            '</span>' +
          '</div>' +
          '<div class="pui-row"><span class="pui-lab">Credits</span>' +
            '<input class="pui-range" type="range" min="0" max="360" step="0.25" value="46" aria-label="Credits to reserve"></div>' +
          '<div class="pui-row"><span class="pui-lab">Deadline</span><span class="pui-val">Thu 12 Mar · 09:00 GMT</span></div>' +
          '<div class="pui-calc"><b class="pui-num" data-cr>46</b><span>credits</span><i>=</i><b class="pui-money" data-usd>$1,150</b>' +
            '<span class="pui-note">at $25/credit</span></div>' +
          '<div class="pui-actions">' +
            '<button type="button" class="pui-btn pui-btn--gold" data-accept>Accept estimate</button>' +
            '<button type="button" class="pui-btn" data-reset>Reset</button>' +
            '<span class="pui-state" data-state>' + pill('draft', 'mute') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="pui-col pui-col--side">' +
          '<div class="pui-h">Pod capacity</div>' +
          ['Creative', 'Growth', 'Strategy'].map(function (p, i) {
            var used = [72, 58, 34][i];
            return '<div class="pui-bar"><span>' + p + '</span><i><b style="width:' + (used / 120 * 100) + '%"></b></i><em>' + used + '/120</em></div>';
          }).join('') +
          '<div class="pui-h">Gates</div>' +
          '<ol class="pui-gates">' +
            ['Brief approved', 'Direction chosen', 'Internal QA', 'Your review', 'Go-live'].map(function (g, i) {
              return '<li class="' + (i === 0 ? 'is-on' : '') + '"><b>G' + (i + 1) + '</b>' + g + '</li>';
            }).join('') +
          '</ol>' +
          '<p class="pui-foot">Local demonstration · no tenant attached</p>' +
        '</div>' +
      '</div>';

    var range = $('.pui-range', body), cr = $('[data-cr]', body), usd = $('[data-usd]', body);
    var state = $('[data-state]', body), gates = body.querySelectorAll('.pui-gates li');
    var accepted = false;

    function paint() {
      var v = parseFloat(range.value);
      countTo(cr, v);
      countTo(usd, v * 25, 420, money);
      if (!accepted) {
        state.innerHTML = pill('draft · ' + v + ' cr', 'mute');
        gates[0].classList.remove('is-on');
      }
    }
    range.addEventListener('input', paint);
    body.addEventListener('click', function (e) {
      var seg = e.target.closest('.pui-seg__b');
      if (seg) {
        body.querySelectorAll('.pui-seg__b').forEach(function (b) { b.classList.toggle('is-on', b === seg); });
        var p = seg.getAttribute('data-pod');
        range.max = pool[p];
        if (+range.value > pool[p]) range.value = pool[p];
        paint();
        return;
      }
      if (e.target.closest('[data-accept]')) {
        accepted = true;
        state.innerHTML = pill('accepted · G1 signed', 'ok');
        gates[0].classList.add('is-on');
        var b = e.target.closest('[data-accept]');
        b.classList.add('is-done');
        b.textContent = 'Accepted ✓';
        b.disabled = true;
      }
      if (e.target.closest('[data-reset]')) {
        accepted = false;
        range.value = 46;
        body.querySelectorAll('.pui-seg__b').forEach(function (b, i) { b.classList.toggle('is-on', i === 0); });
        var acc = $('[data-accept]', body);
        acc.disabled = false; acc.classList.remove('is-done'); acc.textContent = 'Accept estimate';
        paint();
      }
    });
    paint();
  }

  /* ----------------------------------------------------------- 2. LEDGER -- */
  function ledger(body) {
    var rows = [
      { id: 1, pod: 'Creative', service: 'Logo design', cr: 17.25, state: 'billed' },
      { id: 2, pod: 'Creative', service: 'Brand guidelines', cr: 28.75, state: 'billed' },
      { id: 3, pod: 'Growth', service: 'Landing page build', cr: 58.5, state: 'reserved' },
      { id: 4, pod: 'Strategy', service: 'Positioning memo', cr: 34, state: 'reserved' }
    ];
    var filter = 'All';

    body.innerHTML =
      '<div class="pui pui-ledger">' +
        '<div class="pui-head">' +
          '<div><span class="pui-kicker">Credit ledger · November</span>' +
            '<div class="pui-sum"><b data-drawn>0</b><span>drawn of</span><b data-pool>240</b><em data-pct>0%</em></div></div>' +
          '<div class="pui-chips">' + ['All', 'Creative', 'Growth', 'Strategy'].map(function (f, i) {
            return '<button type="button" class="pui-chip' + (i === 0 ? ' is-on' : '') + '" data-filter="' + f + '">' + f + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="pui-progress"><i data-bar></i></div>' +
        '<table class="pui-table"><thead><tr><th>Pod</th><th>Service</th><th>Credits</th><th>USD</th><th>State</th><th></th></tr></thead><tbody data-rows></tbody></table>' +
        '<p class="pui-foot">Local demonstration · 1 credit = $25 · unused credits do not roll over</p>' +
      '</div>';

    var tbody = $('[data-rows]', body), drawn = $('[data-drawn]', body), pct = $('[data-pct]', body), bar = $('[data-bar]', body);

    function paint(animate) {
      var list = rows.filter(function (r) { return filter === 'All' || r.pod === filter; });
      tbody.innerHTML = list.map(function (r) {
        return '<tr data-id="' + r.id + '"><td>' + r.pod + '</td><td>' + r.service + '</td>' +
          '<td class="pui-n">' + r.cr + '</td><td class="pui-n">' + money(r.cr * 25) + '</td>' +
          '<td>' + pill(r.state, r.state === 'billed' ? 'ok' : 'warn') + '</td>' +
          '<td><button type="button" class="pui-btn pui-btn--xs" data-toggle="' + r.id + '">' +
          (r.state === 'billed' ? 'Reopen' : 'Mark billed') + '</button></td></tr>';
      }).join('');
      var total = rows.reduce(function (a, r) { return a + r.cr; }, 0);
      var shown = list.reduce(function (a, r) { return a + r.cr; }, 0);
      if (animate) countTo(drawn, shown); else drawn.textContent = shown;
      $('[data-pool]', body).textContent = 240;
      var p = Math.round(total / 240 * 100);
      pct.textContent = p + '%';
      bar.style.width = Math.min(100, p) + '%';
    }

    body.addEventListener('click', function (e) {
      var f = e.target.closest('[data-filter]');
      if (f) {
        filter = f.getAttribute('data-filter');
        body.querySelectorAll('.pui-chip').forEach(function (c) { c.classList.toggle('is-on', c === f); });
        paint(true);
        return;
      }
      var t = e.target.closest('[data-toggle]');
      if (t) {
        var id = +t.getAttribute('data-toggle');
        rows.forEach(function (r) { if (r.id === id) r.state = r.state === 'billed' ? 'reserved' : 'billed'; });
        paint(true);
      }
    });
    paint(true);
  }

  /* --------------------------------------------------------- 3. TRACKING -- */
  function tracking(body) {
    var cols = ['Briefed', 'In build', 'In review', 'Released'];
    var items = [
      { name: 'Q1 social set', cr: 46, s: 0 },
      { name: 'Launch film', cr: 38, s: 0 },
      { name: 'Landing page', cr: 58.5, s: 1 },
      { name: 'Sales deck', cr: 22, s: 1 },
      { name: 'Brand refresh', cr: 28.75, s: 2 },
      { name: 'Ad variants', cr: 34, s: 3 }
    ];
    body.innerHTML =
      '<div class="pui pui-track"><div class="pui-board" data-board></div>' +
      '<p class="pui-foot">Click a card to advance its state · local demonstration</p></div>';

    function paint() {
      var board = $('[data-board]', body);
      board.innerHTML = cols.map(function (c, ci) {
        var list = items.map(function (it, i) { return { it: it, i: i }; }).filter(function (o) { return o.it.s === ci; });
        return '<div class="pui-lane"><div class="pui-lane__h">' + c + ' <b>' + list.length + '</b></div>' +
          list.map(function (o) {
            return '<button type="button" class="pui-card" data-adv="' + o.i + '">' +
              '<b>' + o.it.name + '</b><span>' + o.it.cr + ' cr</span>' +
              '<i style="width:' + ((o.it.s + 1) / 4 * 100) + '%"></i></button>';
          }).join('') + '</div>';
      }).join('');
    }
    body.addEventListener('click', function (e) {
      var c = e.target.closest('[data-adv]');
      if (!c) return;
      var i = +c.getAttribute('data-adv');
      items[i].s = Math.min(3, items[i].s + 1);
      paint();
    });
    paint();
  }

  /* ----------------------------------------------------------- 4. REVIEW -- */
  function review(body) {
    var thread = [
      { who: 'Pod lead', t: 'Pull the headline up 8px so it clears the safe area.', state: 'open' }
    ];
    var pins = 3;
    body.innerHTML =
      '<div class="pui pui-review">' +
        '<div class="pui-art"><span>Social frame 04 / 12</span>' +
          '<div class="pui-art__pins">' + [1, 2, 3].map(function (i) {
            return '<i class="pui-pin' + (i === 3 ? ' is-off' : '') + '" data-pin="' + i + '">' + i + '</i>';
          }).join('') + '</div>' +
          '<span class="pui-art__meta" data-pinmeta>2 open · 1 resolved</span>' +
        '</div>' +
        '<div class="pui-thread"><div class="pui-h">Thread</div><div data-thread></div>' +
          '<div class="pui-actions">' +
            '<button type="button" class="pui-btn pui-btn--gold" data-approve>Approve frame</button>' +
            '<button type="button" class="pui-btn" data-request>Request change</button>' +
          '</div>' +
          '<p class="pui-foot">Feedback stays attached to the asset · local demonstration</p>' +
        '</div>' +
      '</div>';

    function paintThread() {
      $('[data-thread]', body).innerHTML = thread.map(function (m) {
        return '<div class="pui-msg"><b>' + m.who + '</b>' + pill(m.state, m.state === 'resolved' ? 'ok' : 'mute') +
          '<p>' + m.t + '</p></div>';
      }).join('');
      var off = body.querySelectorAll('.pui-pin.is-off').length;
      $('[data-pinmeta]', body).textContent = (pins - off) + ' open · ' + off + ' resolved';
    }
    body.addEventListener('click', function (e) {
      if (e.target.closest('[data-approve]')) {
        thread.unshift({ who: 'Client reviewer', t: 'Approved as is. Release on the next cycle.', state: 'resolved' });
        body.querySelectorAll('.pui-pin').forEach(function (p) { p.classList.add('is-off'); });
        paintThread();
      }
      if (e.target.closest('[data-request]')) {
        thread.unshift({ who: 'Client reviewer', t: 'Second frame reads better in the feed crop — swap frame 04 for 09.', state: 'open' });
        paintThread();
      }
      var pin = e.target.closest('[data-pin]');
      if (pin) { pin.classList.toggle('is-off'); paintThread(); }
    });
    paintThread();
  }

  /* --------------------------------------------------------- 5. APPROVAL -- */
  function approval(body) {
    var signed = { pod: false, client: false };
    body.innerHTML =
      '<div class="pui pui-approve">' +
        '<ol class="pui-gates pui-gates--lg">' +
          ['Brief approved', 'Direction chosen', 'Internal QA', 'Your review', 'Go-live'].map(function (g, i) {
            return '<li class="' + (i < 4 ? 'is-on' : '') + '" data-g="' + i + '"><b>G' + (i + 1) + '</b>' + g + '</li>';
          }).join('') +
        '</ol>' +
        '<div class="pui-doc">' +
          '<div class="pui-doc__h">Release authorisation · G5</div>' +
          '<div class="pui-sig" data-sig-pod><span>Pod lead</span><b>—</b><button type="button" class="pui-btn pui-btn--xs" data-sign="pod">Sign</button></div>' +
          '<div class="pui-sig" data-sig-client><span>Client</span><b>—</b><button type="button" class="pui-btn pui-btn--xs" data-sign="client">Sign</button></div>' +
          '<div class="pui-stamp" data-stamp>NOT RELEASED</div>' +
          '<div class="pui-actions">' +
            '<button type="button" class="pui-btn pui-btn--gold" data-release disabled>Release</button>' +
            '<span class="pui-state" data-rstate>' + pill('awaiting 2 signatures', 'mute') + '</span>' +
          '</div>' +
          '<p class="pui-foot">Both signatures are required · local demonstration</p>' +
        '</div>' +
      '</div>';

    function paint() {
      var both = signed.pod && signed.client;
      $('[data-sig-pod] b', body).textContent = signed.pod ? 'R. Teja · signed' : '—';
      $('[data-sig-client] b', body).textContent = signed.client ? 'Client · signed' : '—';
      var stamp = $('[data-stamp]', body);
      stamp.textContent = both ? 'RELEASED' : 'NOT RELEASED';
      stamp.classList.toggle('is-live', both);
      $('[data-release]', body).disabled = !both;
      $('[data-rstate]', body).innerHTML = both ? pill('ready to release', 'ok') : pill('awaiting ' + (2 - (signed.pod + signed.client)) + ' signature(s)', 'mute');
      body.querySelectorAll('[data-sign]').forEach(function (b) {
        var k = b.getAttribute('data-sign');
        b.disabled = signed[k];
        b.textContent = signed[k] ? 'Signed ✓' : 'Sign';
      });
      var gate5 = body.querySelector('.pui-gates li[data-g="4"]');
      if (gate5) { gate5.classList.toggle('is-done', both); gate5.classList.toggle('is-active', both); }
    }
    // G1-G5 are navigation: clicking one switches to the matching stage panel
    body.querySelectorAll('.pui-gates li').forEach(function (li) {
      li.addEventListener('click', function () {
        var target = document.querySelectorAll('.pf[data-panel]')[+li.getAttribute('data-g')] ||
                     document.querySelectorAll('.pf[data-panel]')[0];
        var btn = document.querySelectorAll('.pstage__btn')[+li.getAttribute('data-g')];
        if (btn) btn.click();
        if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    });

    body.addEventListener('click', function (e) {
      var s = e.target.closest('[data-sign]');
      if (s && !s.dataset.confirming) {
        var who = s.getAttribute('data-sign');
        var box = document.createElement('div');
        box.className = 'pui-confirm';
        box.innerHTML = '<span>Confirm signature as ' + (who === 'pod' ? 'pod lead' : 'client') +
          '? This is a local demonstration.</span>';
        var ok = document.createElement('button');
        ok.type = 'button'; ok.className = 'pui-btn pui-btn--xs pui-btn--gold'; ok.textContent = 'Confirm';
        ok.addEventListener('click', function () {
          signed[who] = true; box.remove(); paint();
        });
        var no = document.createElement('button');
        no.type = 'button'; no.className = 'pui-btn pui-btn--xs'; no.textContent = 'Cancel';
        no.addEventListener('click', function () { box.remove(); });
        box.appendChild(ok); box.appendChild(no);
        s.parentNode.appendChild(box);
        s.dataset.confirming = '1';
        setTimeout(function () { delete s.dataset.confirming; }, 1200);
      }
      if (e.target.closest('[data-release]')) {
        $('[data-rstate]', body).innerHTML = pill('released · G5 closed', 'ok');
        var rel = e.target.closest('[data-release]');
        rel.textContent = 'Released ✓'; rel.disabled = true;
      }
    });
    paint();
  }

  /* ----------------------------------------------------------- 6. REPORT -- */
  function report(body) {
    var periods = {
      Nov: { drawn: 186.5, shipped: 34, reviewed: 22, weeks: [24, 38, 46, 58, 62] },
      Oct: { drawn: 141.25, shipped: 27, reviewed: 26, weeks: [18, 26, 34, 40, 52] }
    };
    var active = 'Nov';
    body.innerHTML =
      '<div class="pui pui-report">' +
        '<div class="pui-head"><div><span class="pui-kicker">Monthly report</span>' +
          '<div class="pui-sum"><b data-drawn>0</b><span>credits ·</span><b data-shipped>0</b><span>shipped</span></div></div>' +
          '<div class="pui-chips">' + ['Nov', 'Oct'].map(function (p, i) {
            return '<button type="button" class="pui-chip' + (i === 0 ? ' is-on' : '') + '" data-period="' + p + '">' + p + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="pui-grid2">' +
          '<div class="pui-panel"><div class="pui-h">Credits per week</div><div class="pui-chart" data-chart></div></div>' +
          '<div class="pui-panel"><div class="pui-h">What it replaced</div>' +
            '<table class="pui-table pui-table--tight"><tbody>' +
              '<tr><td>2 contractors</td><td class="pui-n">$6,400</td></tr>' +
              '<tr><td>Freelance media buyer</td><td class="pui-n">$2,100</td></tr>' +
              '<tr><td>Stock + templates</td><td class="pui-n">$180</td></tr>' +
              '<tr class="is-total"><td>This pod</td><td class="pui-n">$6,000</td></tr>' +
            '</tbody></table></div>' +
        '</div>' +
        '<p class="pui-foot">Review turnaround <b data-rev>22</b> hrs median · 0 SLA breaches · local demonstration</p>' +
      '</div>';

    function paint(animate) {
      var d = periods[active];
      if (animate) { countTo($('[data-drawn]', body), d.drawn); countTo($('[data-shipped]', body), d.shipped); countTo($('[data-rev]', body), d.reviewed); }
      else { $('[data-drawn]', body).textContent = d.drawn; $('[data-shipped]', body).textContent = d.shipped; $('[data-rev]', body).textContent = d.reviewed; }
      var max = Math.max.apply(null, d.weeks);
      $('[data-chart]', body).innerHTML = d.weeks.map(function (v, i) {
        return '<div class="pui-col"><i style="height:' + (v / max * 100) + '%"></i><span>W' + (i + 1) + '</span></div>';
      }).join('');
    }
    body.addEventListener('click', function (e) {
      var p = e.target.closest('[data-period]');
      if (!p) return;
      active = p.getAttribute('data-period');
      body.querySelectorAll('.pui-chip').forEach(function (c) { c.classList.toggle('is-on', c === p); });
      paint(true);
    });
    paint(true);
  }

  /* ------------------------------------------------------------- mount ---- */
  var MAP = { 'Brief submission': brief, 'Credit ledger': ledger, 'Deliverable tracking': tracking,
              'Review comments': review, 'Approval': approval, 'Monthly report': report };

  [].slice.call(stage.querySelectorAll('.pf[data-panel]')).forEach(function (panel) {
    var h = panel.querySelector('.pf__meta h4') || panel.querySelector('.pf__body b');
    var title = h ? h.textContent.trim() : '';
    var body = panel.querySelector('.pf__body');
    if (!body || !MAP[title]) return;
    var viz = body.querySelector('[data-viz]');
    if (viz) viz.remove();
    MAP[title](body);
  });
})();
