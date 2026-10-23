/* Home page: the pre-trade checklist ticks itself, and the "hunch to rule" sketch builds step by step. */
(function () {
  var root = document.documentElement;
  var animate = root.classList.contains('js') && 'IntersectionObserver' in window;
  if (!animate) root.classList.add('reduce');

  // Checklist: ticks appear one by one when the card is on screen.
  var chk = document.getElementById('checklist');
  if (chk) {
    var items = chk.querySelectorAll('li');
    if (!animate) items.forEach(function (li) { li.classList.add('on'); });
    else new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) {
        items.forEach(function (li, i) { setTimeout(function () { li.classList.add('on'); }, 350 + i * 320); });
        o.disconnect();
      }
    }, { threshold: 0.4 }).observe(chk);
  }

  var sc = document.getElementById('storyChart');
  if (!sc) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function txt(p, x, y, s, a) { var t = el('text', Object.assign({ x: x, y: y }, a || {}), p); t.textContent = s; return t; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // A concept sketch, not market data: hand-placed swing points with a little noise.
  var N = 100;
  var way = [[0, 100], [10, 109], [16, 104], [28, 117], [34, 111], [46, 125], [52, 118], [64, 135], [73, 126], [78, 132], [90, 141], [99, 147]];
  function build(pullVal) {
    way[8][1] = pullVal;
    var r = rng(5), c = [];
    for (var w = 0; w < way.length - 1; w++) {
      var a = way[w], b = way[w + 1];
      for (var i = a[0]; i < b[0]; i++) { var t = (i - a[0]) / (b[0] - a[0]); c[i] = a[1] + (b[1] - a[1]) * t + (i === a[0] ? 0 : (r() - 0.5) * 1.1); }
    }
    c[N - 1] = way[way.length - 1][1];
    return c;
  }
  function sma(c, n) { return c.map(function (_, i) { if (i < n - 1) return null; var s = 0; for (var j = i - n + 1; j <= i; j++) s += c[j]; return s / n; }); }
  // Place the pullback low right on the 20-period average.
  var pv = 126, c, m;
  for (var k = 0; k < 5; k++) { c = build(pv); m = sma(c, 20); pv = m[73] + 0.3; }
  c = build(pv); m = sma(c, 20);

  var lo = Math.min.apply(0, c) - 3, hi = Math.max.apply(0, c) + 3, X0 = 20, X1 = 580, Y0 = 34, Y1 = 250, VY0 = 274, VY1 = 348;
  function X(i) { return X0 + (X1 - X0) * i / (N - 1); }
  function Y(v) { return Y1 - (v - lo) / (hi - lo) * (Y1 - Y0); }
  for (var g = 0; g <= 4; g++) { var gy = Y0 + (Y1 - Y0) * g / 4; el('line', { x1: X0, x2: X1, y1: gy, y2: gy, stroke: 'var(--grid)' }, sc); }
  el('line', { x1: X0, x2: X1, y1: Y1, y2: Y1, stroke: 'var(--ink)', 'stroke-width': 1.2 }, sc);

  // Volume panel.
  var rv = rng(11), vol = c.map(function () { return 40 + rv() * 28; });
  vol[74] = 118; vol[73] = 50; vol[72] = 46;
  var vavg = vol.reduce(function (a, b) { return a + b; }, 0) / N, vmax = 120;
  var vg = el('g', { opacity: 0.35, style: 'transition:opacity .5s' }, sc);
  vol.forEach(function (v, i) {
    var h = (VY1 - VY0) * v / vmax;
    el('rect', { x: X(i) - 2, y: VY1 - h, width: 4, height: h, fill: i === 74 ? 'var(--hl)' : 'var(--line)', stroke: i === 74 ? 'var(--ink)' : 'none', 'stroke-width': i === 74 ? 1.2 : 0 }, vg);
  });
  el('line', { x1: X0, x2: X1, y1: VY1, y2: VY1, stroke: 'var(--ink)', 'stroke-width': 1.2 }, sc);
  txt(sc, X0, VY1 + 18, 'volume', { 'font-family': 'JetBrains Mono', 'font-size': 10, fill: 'var(--muted)' });
  var vav = el('g', { opacity: 0, style: 'transition:opacity .5s' }, sc), vy = VY1 - (VY1 - VY0) * vavg / vmax;
  el('line', { x1: X0, x2: X1, y1: vy, y2: vy, stroke: 'var(--teal)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, vav);
  txt(vav, X(30), VY0 + 6, 'average volume (dashed)', { 'text-anchor': 'middle', 'font-family': 'Caveat', 'font-size': 19, fill: 'var(--teal)' });
  txt(vav, X(74) - 8, VY0 + 6, 'above average', { 'text-anchor': 'end', 'font-family': 'Caveat', 'font-size': 20, fill: 'var(--violet)' });

  // Price line.
  var price = el('path', { d: c.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, sc);

  // Step 1: structure.
  var s1 = el('g', { opacity: 0, style: 'transition:opacity .5s' }, sc);
  var sw = [[10, 'HH'], [16, 'HL'], [28, 'HH'], [34, 'HL'], [46, 'HH'], [52, 'HL'], [64, 'HH'], [73, 'HL']];
  el('path', { d: sw.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(c[p[0]]); }).join(' '), fill: 'none', stroke: 'var(--violet)', 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }, s1);
  sw.forEach(function (p) {
    var up = p[1] === 'HH';
    el('circle', { cx: X(p[0]), cy: Y(c[p[0]]), r: 4.5, fill: 'var(--card)', stroke: 'var(--violet)', 'stroke-width': 2 }, s1);
    txt(s1, X(p[0]), Y(c[p[0]]) + (up ? -12 : 21), p[1], { 'text-anchor': 'middle', 'font-family': 'JetBrains Mono', 'font-size': 10.5, 'font-weight': 600, fill: 'var(--violet)' });
  });
  txt(s1, X0 + 4, Y0 - 10, 'higher highs, higher lows = uptrend', { 'font-family': 'Caveat', 'font-size': 22, fill: 'var(--violet)' });

  // Step 2: the setup.
  var s2 = el('g', { opacity: 0, style: 'transition:opacity .5s' }, sc);
  el('path', { d: m.map(function (v, i) { return v == null ? '' : ((i === 19 ? 'M' : 'L') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)); }).join(' '), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s2);
  txt(s2, X(32), Y(m[32]) + 26, '20-period average', { 'text-anchor': 'middle', 'font-family': 'Caveat', 'font-size': 20, fill: 'var(--teal)' });
  el('ellipse', { cx: X(73), cy: Y(c[73]), rx: 24, ry: 17, fill: 'none', stroke: 'var(--violet)', 'stroke-width': 2 }, s2);
  el('path', { d: 'M' + X(73) + ' ' + (Y(c[73]) + 18) + ' q -4 14 -10 24', fill: 'none', stroke: 'var(--violet)', 'stroke-width': 1.5 }, s2);
  txt(s2, X(73) - 12, Y(c[73]) + 58, 'pullback to the average', { 'text-anchor': 'middle', 'font-family': 'Caveat', 'font-size': 21, fill: 'var(--violet)' });

  // Step 4: risk before reward.
  var s4 = el('g', { opacity: 0, style: 'transition:opacity .5s' }, sc), ent = c[75], stop = c[73] - 3.2;
  el('rect', { x: X(75), y: Y(ent), width: X(99) - X(75), height: Y(stop) - Y(ent), fill: 'var(--teal-soft)', opacity: 0.9 }, s4);
  el('line', { x1: X(73) - 10, x2: X(99), y1: Y(stop), y2: Y(stop), stroke: 'var(--teal)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, s4);
  el('line', { x1: X(75), x2: X(99), y1: Y(ent), y2: Y(ent), stroke: 'var(--ink)', 'stroke-width': 1.5 }, s4);
  el('circle', { cx: X(75), cy: Y(ent), r: 5, fill: 'var(--hl)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, s4);
  txt(s4, X(99), Y(ent) - 7, 'entry', { 'text-anchor': 'end', 'font-family': 'JetBrains Mono', 'font-size': 10.5, fill: 'var(--ink)' });
  txt(s4, X(99), Y(stop) + 16, 'stop below the swing low', { 'text-anchor': 'end', 'font-family': 'JetBrains Mono', 'font-size': 10.5, fill: 'var(--teal)' });

  var L = price.getTotalLength();
  if (animate) { price.style.strokeDasharray = L; price.style.strokeDashoffset = L; price.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4,.1,.2,1)'; }
  var dots = document.querySelectorAll('.dots i'), steps = document.querySelectorAll('.step'), cur = -1;
  function stage(n) {
    if (n === cur) return;
    cur = n;
    price.style.strokeDashoffset = 0;
    s1.setAttribute('opacity', 1);
    s2.setAttribute('opacity', n >= 1 ? 1 : 0);
    vg.setAttribute('opacity', n >= 2 ? 1 : 0.35);
    vav.setAttribute('opacity', n >= 2 ? 1 : 0);
    s4.setAttribute('opacity', n >= 3 ? 1 : 0);
    dots.forEach(function (d, i) { d.classList.toggle('on', i <= n); });
    steps.forEach(function (st) { st.classList.toggle('on', +st.dataset.step === n); });
  }
  if (!animate) { stage(3); steps.forEach(function (st) { st.classList.add('on'); }); return; }
  requestAnimationFrame(function () { stage(0); });
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) stage(+e.target.dataset.step); });
  }, { rootMargin: '-55% 0px -35% 0px' });
  steps.forEach(function (st) { sio.observe(st); });
})();
