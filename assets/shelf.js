/* Shelf page: pull a book off the shelf to read about it. Book data comes from content/shelf.json. */
(function () {
  var data = document.getElementById('books');
  var card = document.getElementById('bookCard'), body = document.getElementById('bookBody');
  if (!data || !card || !body) return;
  var books = JSON.parse(data.textContent);
  var spines = Array.prototype.slice.call(document.querySelectorAll('.spine'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;

  function node(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function show(i, fromUser) {
    current = i;
    var b = books[i];
    spines.forEach(function (s) { s.setAttribute('aria-pressed', String(+s.dataset.i === i)); });
    body.textContent = '';
    body.appendChild(node('span', 'stamp', b.category));
    body.appendChild(node('h2', 'h3 bt-title', b.title));
    body.appendChild(node('div', 'by', b.author + (b.year ? ' · ' + b.year : '')));
    body.appendChild(node('p', null, b.about));
    body.appendChild(node('div', 'for', 'Read it for: ' + b.read_for));
    if (!fromUser) return;
    var s = spines.filter(function (x) { return +x.dataset.i === i; })[0];
    if (s) {
      var row = s.parentNode;
      row.scrollTo({ left: Math.max(0, s.offsetLeft - row.offsetLeft - 12), behavior: reduce ? 'auto' : 'smooth' });
    }
    if (matchMedia('(max-width: 979px)').matches) card.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }

  spines.forEach(function (s) { s.addEventListener('click', function () { show(+s.dataset.i, true); }); });
  card.addEventListener('click', function (e) {
    var a = e.target.getAttribute && e.target.getAttribute('data-a');
    if (a === 'prev') show((current - 1 + books.length) % books.length, true);
    if (a === 'next') show((current + 1) % books.length, true);
    if (a === 'pick') { var j; do { j = Math.floor(Math.random() * books.length); } while (j === current && books.length > 1); show(j, true); }
  });
  if (spines[0]) spines[0].setAttribute('aria-pressed', 'true');
})();
