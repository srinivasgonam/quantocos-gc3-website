/* ============================================================================
   Credit planner - the home-page calculator.

   Models a month of work against a pod's included credit pool, using only the
   credit estimates published on the Creative Pod page (2 / 8 / 10 / 3 / 6).
   No hourly rates, no currency conversion, no country comparison: the offer is
   sold in credits, so the planner is in credits.

   Inputs   #pod-select (120 / 240 / 360), #q-posts, #q-videos, #q-visuals,
            #q-assets, #q-decks
   Outputs  #output-badge, #stat-used, #stat-pool, #stat-left, #stat-pct,
            #stat-over
   ========================================================================== */
(function () {
  "use strict";

  var RATES = {
    posts: 2,     /* 12 social posts = 24 credits  */
    videos: 8,    /* 4 short videos   = 32 credits */
    visuals: 10,  /* 1 key visual     = 10 credits */
    assets: 3,    /* 6 web / email    = 18 credits */
    decks: 6      /* 2 decks          = 12 credits */
  };

  function count(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function fmt(n) {
    return Math.round(n).toLocaleString("en-GB");
  }

  function updateCalculations() {
    var pod = document.getElementById("pod-select");
    var pool = pod ? parseFloat(pod.value) || 120 : 120;
    var name = "Creative Pod";
    if (pod && pod.options[pod.selectedIndex]) {
      name = pod.options[pod.selectedIndex].getAttribute("data-name") || name;
    }

    var used =
      count("q-posts") * RATES.posts +
      count("q-videos") * RATES.videos +
      count("q-visuals") * RATES.visuals +
      count("q-assets") * RATES.assets +
      count("q-decks") * RATES.decks;

    var left = Math.max(0, pool - used);
    var over = Math.max(0, used - pool);
    var pct = pool > 0 ? Math.round((used / pool) * 100) : 0;

    setText("output-badge", name);
    setText("stat-used", fmt(used));
    setText("stat-pool", fmt(pool));
    setText("stat-left", fmt(left));
    setText("stat-pct", pct + "%");
    setText("stat-over", over > 0 ? fmt(over) + " credits" : "0");
  }

  window.updateCalculations = updateCalculations;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCalculations);
  } else {
    updateCalculations();
  }
})();
