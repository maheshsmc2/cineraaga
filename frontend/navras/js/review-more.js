/* ===========================
   "More from CineRaaga" at the foot of a review
   Filled from published content only: the other reviews in
   data/reviews.json, then the most recently updated lists that have films.

   This block used to be hand-typed into the review template, with sample
   cards (reviews that were never written, with scores) that every published
   review then carried. Nothing here is typed in, and with nothing to show
   the block stays hidden.
   =========================== */

/* Two optional editor-written blocks, each shown only once filled in:
   "Watch with" (data/reviews.json → watch_with) and "Liked it? Try"
   (data/bridges.json). Neither is ever generated. */
(async function () {
  const header = document.querySelector('.rv-header-info');
  const watchRow = header && header.querySelector('.rv-watch-row');
  const here = location.pathname.split('/').pop().replace(/\.html$/, '');
  const json = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const [reviews, bridges] = await Promise.all([json('../data/reviews.json'), json('../data/bridges.json')]);
  const review = (reviews || []).find(r => r.slug === here);
  if (!review) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const watch = review.watch_with || {};
  if (header && watch.who) {
    const row = el('div', 'rv-watch-row');
    row.append(el('span', 'rv-watch-label', 'Watch with:'), el('span', 'afe-watch-badge ott', watch.who));
    if (watch.caution) row.append(el('span', 'rv-watch-caution', watch.caution));
    header.insertBefore(row, watchRow ? watchRow.nextSibling : null);
  }

  const same = f => f && f.title.toLowerCase() === review.title.toLowerCase() && Number(f.year) === review.year;
  const picks = (bridges || []).filter(b => same(b.from) || same(b.to));
  const before = document.getElementById('moreFromCineraaga');
  if (picks.length && before) {
    const box = el('div', 'rv-bridges');
    box.append(el('div', 'rv-section-head', 'Liked it? Try'));
    picks.forEach(b => {
      const other = same(b.from) ? b.to : b.from;
      const p = el('p', 'rv-para');
      const link = el('a', 'rv-bridge-link', `${other.title} (${other.year}, ${other.language})`);
      link.href = `search.html?q=${encodeURIComponent(other.title)}`;
      p.append(link, document.createTextNode(` — ${b.why}`));
      box.append(p);
    });
    before.parentElement.insertBefore(box, before);
  }
})();

(async function () {
  const section = document.getElementById('moreFromCineraaga');
  const grid = section && section.querySelector('.related-grid');
  if (!grid) return;

  const MAX_CARDS = 3;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const json = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const card = (href, tag, title, detail) => `
    <a href="${href}" class="related-card">
      <div class="related-card-tag">${esc(tag)}</div>
      <div class="related-card-title">${esc(title)}</div>
      <div class="related-card-count">${esc(detail)}</div>
    </a>`;

  const here = location.pathname.split('/').pop().replace(/\.html$/, '');
  const reviews = (await json('../data/reviews.json')) || [];
  const cards = reviews
    .filter(r => r.slug !== here)
    .sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')))
    .slice(0, MAX_CARDS)
    .map(r => card(`${encodeURIComponent(r.slug)}.html`,
      [r.language, r.year].filter(Boolean).join(' · '),
      `${r.title} Review`,
      `Navras ${r.navras_score}/100`));

  if (cards.length < MAX_CARDS) {
    const index = (await json('../data/lists/index.json')) || [];
    const lists = await Promise.all(index.map(e => json(`../data/lists/${e.slug}.json`)));
    lists
      .filter(l => l && (l.entries || []).length >= 3)
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
      .slice(0, MAX_CARDS - cards.length)
      .forEach(l => cards.push(card(`list-${encodeURIComponent(l.slug)}.html`,
        'List', l.title, `${l.entries.length} films`)));
  }

  if (!cards.length) return;
  grid.innerHTML = cards.join('');
  section.hidden = false;
})();
