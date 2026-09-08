/* ===========================
   Shared: pick one cover film per list
   Loaded on both index.html and pages/lists.html, before home.js/lists.js.

   The card grids used to show a 2x2 collage of four small crops per
   list — four unrelated posters squeezed into tiny tiles reads as noise,
   not as "here is what this list is." A single real poster, drawn from
   the list's own top 3, is what a list actually looks like. The harder
   requirement is that the same film's poster must not become the cover
   for two different lists — cross-list overlaps are common on this site
   (Kumbalangi Nights alone sits in three), so a naive "always use rank 1"
   rule would visibly repeat art across cards.
   =========================== */

/* Same identity used throughout this site's cross-list duplicate audits:
   prefer the pinned tmdb_id (exact), fall back to title+year. */
function coverFilmKey(film) {
  return film.tmdb_id
    ? `id:${film.tmdb_id}`
    : `${String(film.title || '').toLowerCase()}|${film.year}`;
}

/* lists: array of { id, entries: [{rank, film}] }. Processed in the
   order given — earlier lists get first pick of their own top films, so
   callers should pass a stable, deterministic order (this site uses
   data/lists/index.json's own order, unsorted, so the assignment comes
   out identical wherever it's computed).

   Returns { [list.id]: {rank, film} | null }. Prefers the list's own
   top 3; if all three are already claimed by an earlier list, searches
   the rest of its entries in rank order; only reuses an already-claimed
   film as an absolute last resort (every entry in the list already
   taken elsewhere — not expected with real data). */
function pickListCovers(lists) {
  const claimed = new Set();
  const covers = {};

  for (const list of lists) {
    const entries = [...(list.entries || [])].sort((a, b) => (a.rank || 0) - (b.rank || 0));
    if (!entries.length) { covers[list.id] = null; continue; }

    const top3 = entries.slice(0, 3);
    let chosen = top3.find(e => !claimed.has(coverFilmKey(e.film)));
    if (!chosen) chosen = entries.slice(3).find(e => !claimed.has(coverFilmKey(e.film)));
    if (!chosen) chosen = entries[0];

    claimed.add(coverFilmKey(chosen.film));
    covers[list.id] = chosen;
  }

  return covers;
}
