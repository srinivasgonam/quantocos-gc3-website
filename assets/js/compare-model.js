/* ============================================================================
   Compare model — three inputs, two answers.
   The GC³ line uses published prices from solutions.html; the in-house line
   uses whatever loaded cost the reader types. Nothing is estimated by us.
   ========================================================================== */
(function () {
  'use strict';
  var box = document.querySelector('[data-cmp]');
  if (!box) return;

  var roles = box.querySelector('[data-cmp-roles]');
  var cost = box.querySelector('[data-cmp-cost]');
  var months = box.querySelector('[data-cmp-months]');
  var pod = box.querySelector('[data-cmp-pod]');
  var outHouse = box.querySelector('[data-cmp-house]');
  var outPod = box.querySelector('[data-cmp-podout]');
  var outDiff = box.querySelector('[data-cmp-diff]');
  var note = box.querySelector('[data-cmp-note]');

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function render() {
    var r = +roles.value, c = +cost.value, m = +months.value, price = +pod.value;
    var house = r * c * m;
    var pods = price * m;
    var diff = house - pods;

    roles.nextElementSibling.textContent = r;
    cost.nextElementSibling.textContent = money(c);
    months.nextElementSibling.textContent = m;

    outHouse.textContent = money(house);
    outPod.textContent = money(pods);
    outDiff.textContent = diff >= 0 ? money(diff) + ' less' : money(-diff) + ' more';


  var svg = box.querySelector('.prm-curve');
  var cap = box.querySelector('[data-cmp-curvecap]');

  function drawCurve(r, c, m, price) {
    if (!svg) return;
    var W = 640, H = 200, pad = 26, top = 16;
    var max = Math.max(r * c * m, price * m) || 1;
    var x = function (i) { return pad + (W - pad * 2) * (i / (m - 1)); };
    var y = function (v) { return H - 22 - (H - 22 - top) * (v / max); };
    var house = [], pod = [];
    for (var i = 1; i <= m; i++) {
      house.push(x(i - 1) + ',' + y(r * c * i) );
      pod.push(x(i - 1) + ',' + y(price * i));
    }
    svg.innerHTML =
      '<line class="prm-curve__axis" x1="' + pad + '" y1="' + (H - 22) + '" x2="' + (W - pad) + '" y2="' + (H - 22) + '"/>' +
      '<line class="prm-curve__axis" x1="' + pad + '" y1="' + top + '" x2="' + pad + '" y2="' + (H - 22) + '"/>' +
      '<polyline class="prm-curve__house" points="' + house.join(' ') + '"/>' +
      '<polyline class="prm-curve__pod" points="' + pod.join(' ') + '"/>' +
      '<text class="prm-curve__lbl" x="' + pad + '" y="' + (H - 6) + '">month 1</text>' +
      '<text class="prm-curve__lbl" x="' + (W - pad) + '" y="' + (H - 6) + '" text-anchor="end">month ' + m + '</text>' +
      '<text class="prm-curve__val" x="' + (W - pad) + '" y="' + (y(r * c * m) - 6) + '" text-anchor="end">' + money(r * c * m) + '</text>' +
      '<text class="prm-curve__val" x="' + (W - pad) + '" y="' + (y(price * m) + 14) + '" text-anchor="end">' + money(price * m) + '</text>';
    if (cap) cap.textContent = 'Cumulative cost by month: the in-house line at your loaded cost of ' + money(c) +
      ' per role, and the pod line at ' + money(price) + ' a month.';
  }

    drawCurve(r, c, m, price);

    note.textContent = r + ' roles at ' + money(c) + ' a month for ' + m +
      ' months is ' + money(house) + '. The same period on the pod is ' + m +
      ' months at ' + money(price) + ' — ' + (price / 25) + ' credits a month at $25 a credit. ' +
      'The in-house figure carries no recruitment fee, benefits, management time or the weeks a hire takes to start.';
  }

  [roles, cost, months, pod].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });
  render();
}());
