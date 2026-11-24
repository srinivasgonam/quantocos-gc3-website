/* The slide's CTA is data-only. Wire each rendered label to its page. */
(function () {
  var MAP = {
    'See how intake works': 'onboarding.html',
    'See a sample calendar': 'sample-statement.html',
    'See the build rhythm': 'capabilities.html',
    'See the monthly review': 'proof.html',
    'See what renews': 'pricing.html'
  };
  var root = document.getElementById('pods-hero');
  if (!root) return;
  function patch() {
    root.querySelectorAll('a').forEach(function (a) {
      var t = (a.textContent || '').trim();
      for (var k in MAP) {
        if (t.indexOf(k) === 0 && a.getAttribute('href') !== MAP[k]) a.setAttribute('href', MAP[k]);
      }
    });
  }
  patch();
  new MutationObserver(patch).observe(root, { childList: true, subtree: true, characterData: true });
  root.addEventListener('click', function (e) {
    if (e.target.closest('[role="tab"]')) setTimeout(patch, 60);
  });
})();
