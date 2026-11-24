/* ============================================================================
   compare-toggle.js — make the comparison table interrogable.
   Builds chips from the table's own header cells; each chip shows or hides that
   column. Nothing is added to the data, and the first column (the dimension) can
   never be hidden. Works on keyboard; state is announced via aria-pressed.
   ========================================================================= */
(function () {
  'use strict';
  var tables = [].slice.call(document.querySelectorAll('.compare-table'));
  if (!tables.length) return;

  var wrap = document.createElement('div');
  wrap.className = 'cmp-toggle';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Show or hide a column');
  wrap.innerHTML = '<span class="cmp-toggle__label">Columns</span>';

  var heads = [].slice.call(tables[0].querySelectorAll('tr:first-child th'));
  heads.slice(1).forEach(function (th, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cmp-toggle__b is-on';
    b.setAttribute('aria-pressed', 'true');
    b.textContent = th.textContent.trim();
    b.addEventListener('click', function () {
      var on = b.classList.toggle('is-on');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      tables.forEach(function (t) {
        [].slice.call(t.querySelectorAll('tr')).forEach(function (tr) {
          var cell = tr.children[i + 1];
          if (cell) cell.style.display = on ? '' : 'none';
        });
      });
    });
    wrap.appendChild(b);
  });

  var host = tables[0].closest('.table-wrap') || tables[0];
  host.parentNode.insertBefore(wrap, host);
})();
