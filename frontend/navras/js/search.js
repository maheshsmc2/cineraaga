/* ===========================
   Search page — draws what js/search-engine.js finds
   =========================== */

(async function () {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const out = document.getElementById('searchResults');
  if (!form || !input || !out) return;

  const MAIN = 10;
  const ACROSS = 6;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const json = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);

  let indexPromise = null;
  function loadIndex() {
    return indexPromise || (indexPromise = (async () => {
      const [list, filmDb, reviews, bridges] = await Promise.all([
        json('../data/lists/index.json'), json('../data/film-db.json'),
        json('../data/reviews.json'), json('../data/bridges.json'),
      ]);
      if (!list) { indexPromise = null; throw new Error('lists unavailable'); }
      const lists = await Promise.all(list.map(e => json(`../data/lists/${e.slug}.json`)));
      return CRSearch.build({ lists, filmDb: filmDb || {}, reviews: reviews || [], bridges: bridges || [] });
    })());
  }

  function noteFor(result, mode) {
    const f = result.film;
    const preferred = result.reasons.find(r => r.type === 'list');
    const a = f.appearances.find(x => x.note && preferred && preferred.text.includes(x.list)) ||
      f.appearances.find(x => x.note);
    if (a) return `<p class="sr-note">“${esc(a.note)}”<span> — ${esc(a.list)}, #${a.rank}</span></p>`;
    if (f.review) return `<p class="sr-note">“${esc(f.review.verdict || f.review.tagline)}”<span> — CineRaaga review</span></p>`;
    return '';
  }

  function card(result, mode) {
    const f = result.film;
    const href = f.review ? `${encodeURIComponent(f.review.slug)}.html`
      : f.tmdbId ? `movie.html?id=${f.tmdbId}`
      : f.appearances[0] ? `list-${encodeURIComponent(f.appearances[0].slug)}.html` : null;
    const title = href ? `<a href="${href}">${esc(f.title)}</a>` : esc(f.title);
    const poster = f.poster
      ? `<img src="https://image.tmdb.org/t/p/w154${esc(f.poster)}" alt="" loading="lazy" onerror="this.remove()" />`
      : '';
    const reasons = result.reasons.slice(0, 5)
      .map(r => `<li class="sr-why sr-why-${r.type}">${r.type === 'bridge' ? '<b>Our pick:</b> ' : ''}${esc(r.text)}</li>`).join('');
    const because = mode === 'similar' && result.because && result.because.length > 1
      ? `<li class="sr-why">Close to ${esc(result.because.join(' and '))}</li>` : '';

    return `
      <article class="sr-card">
        <div class="sr-poster">${poster}</div>
        <div class="sr-body">
          <h3 class="sr-title">${title}</h3>
          <div class="sr-meta">${esc([cap(f.language), f.year, f.director.join(', ')].filter(Boolean).join(' · '))}
            ${f.review ? `<span class="sr-score ${esc(f.review.score_class)}">${f.review.navras_score} Navras</span>` : ''}</div>
          <ul class="sr-reasons">${reasons}${because}</ul>
          ${noteFor(result, mode)}
        </div>
      </article>`;
  }

  const section = (title, items, mode) => items.length
    ? `<h2 class="sr-heading">${esc(title)}</h2><div class="sr-list">${items.map(r => card(r, mode)).join('')}</div>` : '';

  const elsewhere = q => `<p class="sr-elsewhere">Looking for a film we haven't listed?
    <a href="browse.html?q=${encodeURIComponent(q)}">Search all films</a>.</p>`;

  const seedCard = film => ({
    film,
    reasons: film.appearances.slice(0, 3).map(a => ({ type: 'list', text: `#${a.rank} in ${a.list}` })),
  });

  function draw(q, found) {
    const chips = found.understood.length
      ? `<div class="sr-understood">Searching for ${found.understood.map(u => `<span>${esc(u)}</span>`).join('')}</div>` : '';

    if (found.mode === 'unknown-film') {
      out.innerHTML = `<p class="sr-empty">We haven't covered “${esc(found.unknown.join('” or “'))}” yet, so we can't say what is like it.</p>${elsewhere(found.unknown[0] || q)}`;
      return;
    }
    if (found.mode === 'similar' && !found.results.length) {
      out.innerHTML = `${chips}${section('The film you named', found.seeds.map(seedCard), 'seed')}<p class="sr-empty">We don't have anything close to it in our lists yet.</p>${elsewhere(found.seeds[0].title)}`;
      return;
    }
    if (!found.results.length) {
      out.innerHTML = `${chips}<p class="sr-empty">Nothing in our lists and reviews matches that yet. Try a mood, a language, a decade, a name, or “films like …”.</p>${elsewhere(q)}`;
      return;
    }

    if (found.mode === 'similar') {
      const top = found.results.slice(0, MAIN);
      const seen = new Set(found.seeds.map(s => s.language).concat(top.map(r => r.film.language)));
      const across = [];
      found.results.slice(MAIN).forEach(r => {
        if (across.length < ACROSS && !seen.has(r.film.language)) across.push(r);
      });
      found.results.slice(MAIN).forEach(r => {
        if (across.length < ACROSS && !across.includes(r) && !found.seeds.some(s => s.language === r.film.language)) across.push(r);
      });
      const names = found.seeds.map(s => `${s.title} (${s.year}, ${cap(s.language)})`).join(' and ');
      const missing = found.unknown.length ? `<p class="sr-empty">We haven't covered “${esc(found.unknown.join('”, “'))}” yet.</p>` : '';
      out.innerHTML = `${chips}${missing}${section('The film you named', found.seeds.map(seedCard), 'seed')}${section(`Films like ${names}`, top, 'similar')}${section('From other Indian languages', across, 'similar')}${elsewhere(found.seeds[0].title)}`;
      return;
    }

    const count = found.results.length;
    const relaxed = found.relaxed ? `<p class="sr-empty">${esc(found.relaxed)}</p>` : '';
    out.innerHTML = `${chips}${relaxed}${section(count > MAIN ? `Top ${MAIN} of ${count} films` : `${count} film${count === 1 ? '' : 's'}`, found.results.slice(0, MAIN), 'discover')}${elsewhere(q)}`;
  }

  async function run(q, push) {
    input.value = q;
    if (push) history.pushState(null, '', q ? `?q=${encodeURIComponent(q)}` : location.pathname);
    if (!q.trim()) { out.innerHTML = ''; return; }
    out.innerHTML = '<p class="sr-empty">Searching…</p>';
    try {
      draw(q, CRSearch.search(await loadIndex(), q));
    } catch (e) {
      out.innerHTML = '<p class="sr-empty">Search could not load just now. Please try again.</p>';
    }
  }

  form.addEventListener('submit', e => { e.preventDefault(); run(input.value.trim(), true); });
  document.querySelectorAll('[data-q]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); run(a.dataset.q, true); }));
  window.addEventListener('popstate', () => run(new URLSearchParams(location.search).get('q') || '', false));
  run(new URLSearchParams(location.search).get('q') || '', false);
})();
