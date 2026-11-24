/* ============================================================================
   credit-explorer.js — the 127-service credit matrix as an interactive grid.
   Data: assets/data/services.json, extracted from
   "GC³ Service SLA, Credit & Value Matrix v0.2". Every credit figure shown is
   the workbook's own number at $25/credit. Nothing is estimated here.
   Mount: any element with [data-credit-explorer]
   ========================================================================= */
(function () {
  'use strict';
  var mount = document.querySelector('[data-credit-explorer]');
  if (!mount) return;

  var base = mount.getAttribute('data-base') || '';   // "" or "../"
  var state = { pod: 'All', q: '', picked: {} };

  fetch(base + 'assets/data/services.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { render(data); })
    .catch(function () { mount.innerHTML = '<p class="ce__err">The service matrix could not load. The full catalogue is still available on the pods page.</p>'; });

  function render(data) {
    var services = data.services;
    var pods = ['All'].concat(Object.keys(services.reduce(function (a, s) { a[s.pod] = 1; return a; }, {})));

    mount.innerHTML =
      '<div class="ce">' +
        '<div class="ce__head">' +
          '<div class="ce__title">Build a scope. <span>Credits add up as you pick.</span></div>' +
          '<div class="ce__total" aria-live="polite">' +
            '<span class="ce__total-n">0</span><span class="ce__total-u">credits</span>' +
            '<span class="ce__total-usd">$0</span>' +
          '</div>' +
        '</div>' +
        '<div class="ce__bar">' +
          '<div class="ce__chips" role="tablist">' +
            pods.map(function (p) {
              return '<button type="button" class="ce__chip' + (p === 'All' ? ' is-on' : '') +
                '" role="tab" data-pod="' + p + '">' + p + ' <i>' +
                (p === 'All' ? services.length : services.filter(function (s) { return s.pod === p; }).length) + '</i></button>';
            }).join('') +
          '</div>' +
          '<input class="ce__search" type="search" placeholder="Search 127 services…" aria-label="Search services">' +
        '</div>' +
        '<div class="ce__grid" role="list"></div>' +
        '<p class="ce__note">Credits are the billing unit. 1 credit = 1 billable hour at $25. ' +
          'Onboarding, brief clarification, asset handover and the monthly review are never charged. ' +
          'Priority and rush lanes cost more credits — see each service in the matrix.</p>' +
      '</div>';

    var grid = mount.querySelector('.ce__grid');
    var totalN = mount.querySelector('.ce__total-n');
    var totalU = mount.querySelector('.ce__total-usd');

    function matches(s) {
      if (state.pod !== 'All' && s.pod !== state.pod) return false;
      if (!state.q) return true;
      var q = state.q.toLowerCase();
      return (s.service + ' ' + s.cat + ' ' + s.id).toLowerCase().indexOf(q) > -1;
    }

    function paint() {
      var list = services.filter(matches);
      grid.innerHTML = list.map(function (s) {
        var on = state.picked[s.id] ? ' is-on' : '';
        return '<button type="button" class="ce__item' + on + '" role="listitem" data-id="' + s.id + '">' +
          '<span class="ce__svc">' + s.service + '</span>' +
          '<span class="ce__meta">' + s.cat + ' · ' + s.unit + '</span>' +
          '<span class="ce__cr">' + (s.credits === 0 ? 'included' : s.credits + ' cr') + '</span>' +
        '</button>';
      }).join('');
      var sum = services.reduce(function (a, s) { return a + (state.picked[s.id] ? s.credits : 0); }, 0);
      totalN.textContent = (Math.round(sum * 100) / 100).toString();
      totalU.textContent = '$' + (Math.round(sum * 25)).toLocaleString('en-US');
    }

    paint();

    mount.addEventListener('click', function (e) {
      var chip = e.target.closest('.ce__chip');
      if (chip) {
        state.pod = chip.getAttribute('data-pod');
        mount.querySelectorAll('.ce__chip').forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        paint();
        return;
      }
      var item = e.target.closest('.ce__item');
      if (item) {
        var id = item.getAttribute('data-id');
        if (state.picked[id]) delete state.picked[id]; else state.picked[id] = 1;
        paint();
      }
    });

    mount.querySelector('.ce__search').addEventListener('input', function (e) {
      state.q = e.target.value.trim();
      paint();
    });
  }
})();
