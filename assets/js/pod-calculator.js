/* ============================================================================
   pod-calculator.js — sticky pricing panel.
   Figures are the published ones from the pricing section of index.html:
     Creative 120 credits $3,000 · Digital 240 credits $6,000 · Strategy 360 credits $9,000
     1 credit = $25 · credits do not carry into the next month
   The "credits used" slider only does arithmetic on those published numbers; it
   never asserts an unpublished rate, rollover or overage rule.
   Mount: any element with [data-pod-calculator]
   ========================================================================= */
(function () {
  'use strict';
  var mount = document.querySelector('[data-pod-calculator]');
  if (!mount) return;

  var PODS = [
    { key: 'creative', name: 'Creative Pod', credits: 120, usd: 3000 },
    { key: 'digital',  name: 'Digital Pod',  credits: 240, usd: 6000 },
    { key: 'strategy', name: 'Strategy Pod', credits: 360, usd: 9000 }
  ];
  var FIXED = 25;                       // $ per credit — 3000/120, 6000/240, 9000/360
  var state = { pod: 0, used: 90 };

  mount.innerHTML =
    '<div class="pc" role="group" aria-label="Credit calculator">' +
      '<div class="pc__kicker">Credit calculator</div>' +
      '<div class="pc__tiers">' +
        PODS.map(function (p, i) {
          return '<button type="button" class="pc__tier' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">' +
            '<span>' + p.name + '</span><b>' + p.credits + ' cr</b></button>';
        }).join('') +
      '</div>' +
      '<label class="pc__label" for="pc-used">Credits used this month</label>' +
      '<input id="pc-used" class="pc__range" type="range" aria-label="Credits used this month" min="0" max="360" step="5" value="90">' +
      '<output class="pc__out" aria-live="polite"></output>' +
      '<p class="pc__note">Same $25 per credit on every pod. Unused credits do not carry into the next month.</p>' +
    '</div>';

  var out = mount.querySelector('.pc__out');
  var range = mount.querySelector('.pc__range');

  function paint() {
    var p = PODS[state.pod];
    var used = Math.min(state.used, p.credits);
    var left = p.credits - used;
    var spent = used * FIXED;
    out.innerHTML =
      '<span class="pc__big">$' + p.usd.toLocaleString('en-US') + '<i>/month</i></span>' +
      '<span class="pc__row"><b>' + p.credits + '</b> credits included</span>' +
      '<span class="pc__row"><b>' + used + '</b> used · <b>' + left + '</b> left this month</span>' +
      '<span class="pc__row pc__row--muted">$' + spent.toLocaleString('en-US') + ' of value drawn · $' + FIXED + '/credit</span>';
    range.max = p.credits;
    range.value = Math.min(state.used, p.credits);
  }

  mount.addEventListener('click', function (e) {
    var t = e.target.closest('.pc__tier');
    if (!t) return;
    state.pod = +t.getAttribute('data-i');
    mount.querySelectorAll('.pc__tier').forEach(function (x) { x.classList.toggle('is-on', x === t); });
    paint();
  });
  range.addEventListener('input', function (e) { state.used = +e.target.value; paint(); });
  paint();
})();
