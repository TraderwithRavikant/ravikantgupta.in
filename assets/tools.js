/* Tools page: sliders with a moving value bubble and press-and-hold −/+ buttons, and the three calculators. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function txt(p, x, y, s, a) { var t = el('text', Object.assign({ x: x, y: y }, a || {}), p); t.textContent = s; return t; }
  function inr(x) { return '₹' + Math.round(x).toLocaleString('en-IN'); }
  function pct(x) { return (x * 100).toFixed(1).replace(/\.0$/, '') + '%'; }
  function $(id) { return document.getElementById(id); }

  // Sliders.
  var FMT = { pct: function (v) { return v + '%'; }, int: function (v) { return String(v); }, inr: inr };
  function paint(inp) {
    var f = (+inp.value - +inp.min) / (+inp.max - +inp.min);
    inp.style.setProperty('--f', f);
    inp.parentNode.style.setProperty('--f', f);
    var b = inp.parentNode.querySelector('.bubble');
    if (b) b.textContent = FMT[inp.dataset.fmt || 'int'](+inp.value);
  }
  document.querySelectorAll('input.rg').forEach(function (inp) { paint(inp); inp.addEventListener('input', function () { paint(inp); }); });
  document.querySelectorAll('.sb').forEach(function (b) {
    var inp = $(b.dataset.for), timer = null, held = false;
    function step() { if (+b.dataset.d > 0) inp.stepUp(); else inp.stepDown(); inp.dispatchEvent(new Event('input', { bubbles: true })); }
    function stop() { clearInterval(timer); timer = null; }
    b.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      held = true; step();
      var n = 0;
      timer = setInterval(function () { if (++n > 4) step(); }, 80);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, stop); });
    // Keyboard and screen-reader "clicks" arrive without a pointerdown.
    b.addEventListener('click', function () { if (held) { held = false; return; } step(); });
  });

  // 1. Losing streak.
  var sR = $('sRisk'), sN = $('sN'), sBars = $('sBars');
  function streak() {
    var r = +sR.value / 100, n = +sN.value, left = Math.pow(1 - r, n), need = 1 / left - 1;
    $('sRiskO').textContent = sR.value + '%';
    $('sNO').textContent = n;
    $('sLeft').textContent = pct(left);
    $('sNeed').textContent = pct(need);
    while (sBars.firstChild) sBars.removeChild(sBars.firstChild);
    var W = 300, H = 78, top = 12, gap = 4, bw = (W - gap * n) / (n + 1);
    el('line', { x1: 0, x2: W, y1: top, y2: top, stroke: 'var(--teal)', 'stroke-dasharray': '4 4', 'stroke-width': 1.2 }, sBars);
    txt(sBars, W, top - 4, 'where you started', { 'text-anchor': 'end', 'font-family': 'JetBrains Mono', 'font-size': 9, fill: 'var(--teal)' });
    for (var i = 0; i <= n; i++) {
      var h = H * Math.pow(1 - r, i);
      el('rect', { x: i * (bw + gap), y: top + H - h, width: bw, height: h, rx: 2, fill: i === n ? 'var(--hl)' : 'var(--violet-soft)', stroke: 'var(--ink)', 'stroke-width': 1.2 }, sBars);
    }
    $('sMsg').textContent = need <= 0.12 ? 'small risk keeps you in the game' : need <= 0.35 ? 'recoverable, but it will test you' : 'this is how accounts end';
  }
  [sR, sN].forEach(function (x) { x.addEventListener('input', streak); });
  streak();

  // 2. Expectancy.
  var eW = $('eW'), eA = $('eA'), eL = $('eL');
  function expectancy() {
    var w = +eW.value / 100, A = +eA.value, Lo = +eL.value, E = w * A - (1 - w) * Lo;
    $('eWO').textContent = eW.value + '%';
    $('eAO').textContent = inr(A);
    $('eLO').textContent = inr(Lo);
    $('eOut').textContent = (E < 0 ? '−' : '') + inr(Math.abs(E));
    $('eRR').textContent = String(Math.round(A / Lo * 100) / 100);
    $('eMsg').textContent = E > 0 ? 'positive on paper. Now check it on data, with costs' : 'no edge, whatever the win rate says';
  }
  [eW, eA, eL].forEach(function (x) { x.addEventListener('input', expectancy); });
  expectancy();

  // 3. Position size from the stop (capital shown with Indian digit grouping).
  var zC = $('zC'), zR = $('zR'), zE = $('zE'), zS = $('zS');
  function num(inp) { return parseFloat(String(inp.value).replace(/[^0-9.]/g, '')) || 0; }
  zC.addEventListener('blur', function () { zC.value = Math.round(num(zC)).toLocaleString('en-IN'); });
  function size() {
    var C = num(zC), R = +zR.value / 100, E = num(zE), S = num(zS), per = E - S, amt = C * R;
    $('zRO').textContent = zR.value + '%';
    if (per <= 0) { $('zQ').textContent = '—'; $('zAmt').textContent = 'stop must sit below entry'; return; }
    var q = Math.floor(amt / per);
    $('zQ').textContent = q.toLocaleString('en-IN');
    $('zAmt').textContent = inr(q * per);
  }
  [zC, zR, zE, zS].forEach(function (x) { x.addEventListener('input', size); });
  size();
})();
