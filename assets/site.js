/* Shared behaviour for every page: theme switch, menu, reading progress, gentle reveals, topic filters. */
(function () {
  window.__siteReady = true;
  var root = document.documentElement;
  var hasIO = 'IntersectionObserver' in window;

  // Light / dark switch, remembered on this device only.
  var themeBtn = document.getElementById('theme');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu.
  var menu = document.getElementById('menu'), drawer = document.getElementById('drawer');
  function closeMenu() { drawer.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); }
  if (menu && drawer) {
    menu.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    drawer.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) { closeMenu(); menu.focus(); } });
  }

  // Reading progress line.
  var bar = document.getElementById('progress'), ticking = false;
  if (bar) addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    });
  }, { passive: true });

  // Reveal sections, highlighter sweeps, the signature and chart bars as they scroll into view.
  var targets = document.querySelectorAll('.reveal, .sig, .bars[data-anim]');
  if (root.classList.contains('js') && hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  // Topic filter chips (Writing page).
  document.querySelectorAll('[data-filter]').forEach(function (group) {
    var selector = group.getAttribute('data-filter'), chips = group.querySelectorAll('.chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === chip)); });
        document.querySelectorAll(selector).forEach(function (n) {
          n.hidden = !(chip.dataset.f === 'all' || n.dataset.t === chip.dataset.f);
        });
      });
    });
  });
})();
