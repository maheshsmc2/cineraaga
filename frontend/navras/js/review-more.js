/* ===========================
   "More from CineRaaga" at the foot of a review
   Filled from published content only: the other reviews in
   data/reviews.json, then the most recently updated lists that have films.

   This block used to be hand-typed into the review template, with sample
   cards (reviews that were never written, with scores) that every published
   review then carried. Nothing here is typed in, and with nothing to show
   the block stays hidden.
   =========================== */

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
