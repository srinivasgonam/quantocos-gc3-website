/* before/after slider + keyboard support */
(function () {
  [].slice.call(document.querySelectorAll('.ba__frame')).forEach(function (f) {
    var r = f.querySelector('.ba__range');
    function paint() { var v = r.value + '%'; f.style.setProperty('--p', v); r.setAttribute('aria-valuetext', r.value + ' percent graded'); }
    r.addEventListener('input', paint);
    paint();
  });
})();
