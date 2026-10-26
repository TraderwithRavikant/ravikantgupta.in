/* Home page: the pre-trade checklist ticks itself, and the "hunch to rule" steps switch with tabs. */
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

  // "From a hunch to a written rule": the tabs switch the notebook visual and the text.
  var rb = document.getElementById('rb');
  if (!rb) return;
  var tabs = rb.querySelectorAll('.rb-tab'), panels = rb.querySelectorAll('.rb-panel'), stages = rb.querySelectorAll('.rb-stage');
  var prev = document.getElementById('rbPrev'), next = document.getElementById('rbNext'), cur = 0, last = tabs.length - 1;
  function show(n, user) {
    cur = n;
    if (user) tabs[n].parentNode.scrollLeft = Math.max(0, tabs[n].offsetLeft - 24);
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === n ? 'true' : 'false'); t.tabIndex = i === n ? 0 : -1; t.classList.toggle('done', i < n); });
    panels.forEach(function (p, i) { p.hidden = i !== n; });
    stages.forEach(function (s, i) { s.hidden = i !== n; });
    prev.disabled = n === 0;
    next.textContent = n === last ? 'Start again ↺' : 'Next step →';
  }
  rb.classList.add('live');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i, true); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); var j = (i + d + tabs.length) % tabs.length; show(j, true); tabs[j].focus(); }
    });
  });
  prev.addEventListener('click', function () { if (cur > 0) show(cur - 1, true); });
  next.addEventListener('click', function () { show(cur === last ? 0 : cur + 1, true); });
  show(0);
})();