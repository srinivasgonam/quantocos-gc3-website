/* =============================================================================
   QUANTOCOS — topographic wireframe wave mesh + telemetry node engine
   Hero ambience for index.html. No dependencies, single canvas, 2D context.

   Behaviour
   - Multi-harmonic cyan iso-curves with a Gaussian elevation peak.
   - Four travelling execution nodes carrying status pills.
   - Pointer lift: a soft Gaussian ripple under the cursor.
   - Pauses off-screen, in background tabs and when motion is disabled.
   - Respects prefers-reduced-motion and the site's .no-motion / ?motion=off
     switches: renders one static frame instead of animating.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('quantocosTopoCanvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var host = canvas.parentNode;
  var root = document.documentElement;

  /* ---- tokens ---------------------------------------------------------- */
  var CYAN = '6, 182, 212';   /* #06B6D4 iso-curves                          */
  var AMBER = '#F59E0B';      /* OMNI / primary                              */
  var NODE_CYAN = '#06B6D4';  /* AGENT / standard                            */
  var EMERALD = '#10B981';    /* GATE / verified                             */
  var PILL_BG = 'rgba(11, 15, 25, 0.94)';
  var PILL_TEXT = '#F8FAFC';

  var FONT = '500 10px "IBM Plex Mono", ui-monospace, Consolas, monospace';

  /* ---- geometry -------------------------------------------------------- */
  var DPR_CAP = 2;
  var W = 0, H = 0, dpr = 1;
  var lines = 26, cols = 110, ampScale = 1, rippleRadius = 150;
  var time = 0;
  var pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false };

  /* Node ratios keep the four badges on sensible contours at any line count. */
  var nodeSpec = [
    { at: 0.16, x: 0.16, speed: 0.060, color: AMBER,      label: 'OMNI: ACTIVE'  },
    { at: 0.36, x: 0.40, speed: 0.072, color: NODE_CYAN,  label: 'AGENT: EXEC'   },
    { at: 0.54, x: 0.64, speed: 0.054, color: NODE_CYAN,  label: 'AGENT: SYNC'    },
    { at: 0.77, x: 0.86, speed: 0.066, color: EMERALD,    label: 'GATE: VERIFIED' }
  ];
  var nodes = [];

  function buildNodes() {
    nodes = nodeSpec.map(function (n) {
      return {
        line: Math.round(n.at * (lines - 1)),
        x: n.x,
        speed: n.speed,
        color: n.color,
        label: n.label,
        phase: n.at * 6.283
      };
    });
  }

  /* ---- sizing ---------------------------------------------------------- */
  function resize() {
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (!w || !h) return;

    W = w;
    H = h;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    /* setTransform, not scale — a repeated ctx.scale() would compound on
       every resize and shrink the drawing a little more each time. */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var compact = W < 700 || H < 300;
    lines = compact ? 17 : 26;
    cols = compact ? 66 : 110;
    ampScale = Math.max(0.62, Math.min(1.15, H / 380)) *
               Math.max(0.72, Math.min(1, W / 900));
    rippleRadius = Math.max(90, Math.min(180, W * 0.15));
    buildNodes();
  }

  /* ---- surface --------------------------------------------------------- */
  /* Returns the surface y for a horizontal ratio on iso-line i. */
  function elevation(xr, i, t) {
    var base = (i / lines) * (H * 0.60) + H * 0.30;
    var peak = Math.exp(-Math.pow((xr - 0.48) * 3.8, 2));
    var wave = (Math.sin(xr * 7 + t + i * 0.18) * 15 +
                Math.sin(xr * 14 - t * 0.7) * 7) * ampScale;

    var y = base - wave * peak * (1 + i * 0.035);

    if (pointer.active) {
      var dx = xr * W - pointer.x;
      var dy = y - pointer.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < rippleRadius) {
        var f = 1 - dist / rippleRadius;
        /* smooth, squared falloff reads as a surface lift, not a spike */
        y -= f * f * 34 * ampScale;
      }
    }
    return y;
  }

  function drawCurves(t) {
    for (var i = 0; i < lines; i++) {
      var alpha = 0.10 + (i / lines) * 0.34;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + CYAN + ', ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = i % 5 === 0 ? 1.25 : 0.8;

      for (var j = 0; j <= cols; j++) {
        var xr = j / cols;
        var x = xr * W;
        var y = elevation(xr, i, t);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawNode(n, t, animate) {
    var nx = n.x * W;
    var ny = elevation(n.x, n.line, t);
    var pulse = 1 + Math.sin(t * 2.4 + n.phase) * 0.14;
    var r = 5.5 * pulse;

    /* glow dot */
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.shadowColor = n.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* inner core */
    ctx.beginPath();
    ctx.arc(nx, ny, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    /* Status readout floats above its node, tethered by a short dashed probe
       so the four labels never collide with each other. */
    if (W < 560) return;

    var badgeH = 20;
    var badgeY = Math.max(6, ny - 36 - badgeH);

    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.lineWidth = 1;
    ctx.moveTo(nx, ny - r - 2);
    ctx.lineTo(nx, badgeY + badgeH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = FONT;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.05em';

    var textW = ctx.measureText(n.label).width;
    var badgeW = textW + 18;
    var edge = 14;
    var bx = Math.max(edge, Math.min(nx - badgeW / 2, W - badgeW - edge));

    ctx.fillStyle = PILL_BG;
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, badgeY, badgeW, badgeH, 4);
    else ctx.rect(bx, badgeY, badgeW, badgeH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PILL_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, bx + badgeW / 2, badgeY + badgeH / 2 + 0.5);

    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  function draw(dt, animate) {
    ctx.clearRect(0, 0, W, H);

    if (animate) {
      time += dt * 1.2;
      for (var n = 0; n < nodes.length; n++) {
        nodes[n].x += nodes[n].speed * dt;
        if (nodes[n].x > 0.96) nodes[n].x = 0.04;
      }
      /* ease the pointer toward its target so the ripple glides */
      if (pointer.active) {
        pointer.x += (pointer.tx - pointer.x) * 0.18;
        pointer.y += (pointer.ty - pointer.y) * 0.18;
      } else {
        pointer.x += (pointer.tx - pointer.x) * 0.08;
        pointer.y += (pointer.ty - pointer.y) * 0.08;
      }
    }

    drawCurves(time);
    for (var k = 0; k < nodes.length; k++) drawNode(nodes[k], time, animate);
  }

  /* ---- loop control ---------------------------------------------------- */
  var rafId = 0;
  var last = 0;
  var onScreen = true;

  function motionOff() {
    if (window.MOTION_ENABLED === false) return true;
    if (root.classList.contains('no-motion')) return true;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) { /* no matchMedia */ }
    return false;
  }

  function shouldRun() {
    return onScreen && !document.hidden && !motionOff();
  }

  function tick(now) {
    rafId = 0;
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    draw(dt, true);
    rafId = requestAnimationFrame(tick);
  }

  function sync() {
    if (shouldRun()) {
      if (!rafId) {
        last = 0;
        rafId = requestAnimationFrame(tick);
      }
    } else {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      draw(0, false);   /* one static frame: readable, no motion */
    }
  }

  /* ---- input ----------------------------------------------------------- */
  function setPointer(e) {
    var r = canvas.getBoundingClientRect();
    pointer.tx = e.clientX - r.left;
    pointer.ty = e.clientY - r.top;
    if (!pointer.active) {
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
    }
    pointer.active = true;
  }

  function clearPointer() {
    pointer.active = false;
    pointer.tx = -1e4;
    pointer.ty = -1e4;
  }

  canvas.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    setPointer(e);
  }, { passive: true });

  canvas.addEventListener('pointerleave', clearPointer, { passive: true });

  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    setPointer(e);
  }, { passive: true });

  canvas.addEventListener('pointerup', function (e) {
    if (e.pointerType === 'mouse') return;
    window.setTimeout(clearPointer, 620);
  }, { passive: true });

  canvas.addEventListener('pointercancel', clearPointer, { passive: true });

  /* ---- observation ----------------------------------------------------- */
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      var pw = W, ph = H;
      resize();
      if (pw !== W || ph !== H) sync();
    }).observe(host);
  } else {
    window.addEventListener('resize', function () { resize(); sync(); });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      sync();
    }, { rootMargin: '80px' }).observe(host);
  }

  document.addEventListener('visibilitychange', sync);

  /* react to the site's motion toggle (html.no-motion is switched at runtime) */
  if ('MutationObserver' in window) {
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (!rafId) draw(0, false); });
  }

  /* ---- boot ------------------------------------------------------------ */
  resize();
  draw(0, false);
  sync();
})();
