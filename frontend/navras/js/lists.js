/* ===========================
   NAVRAS — Lists Page JS
   =========================== */

/* ---- Category display labels (no fake urgency badges, just what's true) ---- */
const categoryLabel = {
  evergreen: "All-time", ott: "OTT", trending: "Trending",
  language: "Language", awards: "Awards",
  genre: "Genre", actor: "Actor", director: "Director", setting: "Setting"
};

/* Section heading + subtitle per category, used to build the page sections */
const categoryHeading = {
  evergreen: ["All time greats", "The definitive canon of Indian cinema — films that endure"],
  ott:       ["OTT picks", "The best Indian content streaming right now"],
  trending:  ["Trending now", "Lists people are reading and sharing this week"],
  language:  ["By language", "The best films from every Indian cinema industry"],
  awards:    ["Awards & recognition", "Indian cinema on the world stage"],
  /* Named to match the homepage section: country-wide, every-language
     genre rankings, as distinct from the by-actor section. */
  genre:     ["All India Best Films", "The films that define each kind of story, across every Indian language"],
  actor:     ["By actor", "Careers worth ranking, one performer at a time"],
  director:  ["By director", "The filmmakers whose work rewards a full retrospective"],
  setting:   ["By setting", "Where a film takes place, and why it matters"]
};

/* ---- CSS accent per category (matches existing .lc-badge modifier classes) ---- */
const categoryAccent = {
  evergreen: "updated",
  ott: "weekly",
  trending: "hot",
  language: "language",
  awards: "awards"
};

/* ---- Data store — every list, flat. Grouping happens at render time so a
   new category (genre, actor, director, setting…) needs no code change, and
   no list can silently fail to render because its bucket doesn't exist. ---- */
let allListsFlat = [];

async function loadAllLists() {
  const indexRes = await fetch('../data/lists/index.json');
  const index = await indexRes.json();

  const fullLists = await Promise.all(
    index.map(entry => fetch(`../data/lists/${entry.slug}.json`)
      .then(r => r.json())
      .catch(() => null))
  );

  allListsFlat = index.map((entry, i) => ({
    ...entry,
    ...(fullLists[i] || {}),
    entries: fullLists[i]?.entries || [],
    count: (fullLists[i]?.entries || []).length
  }));

  /* Covers are assigned in index.json's own order — untouched, before
     any display sort — so this agrees with index.html, which computes
     covers over the same order via the same shared pickListCovers.

     A list with its own thumbnail (see below) never shows a generated
     cover, so it must not claim one from the shared pool either — that
     would take a film's poster out of circulation for every other list,
     for a cover nobody on this page or index.html ever displays. */
  const covers = pickListCovers(
    allListsFlat.filter(l => !l.thumbnail).map(l => ({ id: l.slug, entries: l.entries }))
  );
  allListsFlat.forEach(l => { l.coverEntry = covers[l.slug] || null; });
}

/* ---- Render list cards with a single cover poster ---- */
function renderListCard(list) {
  const topFilms = list.entries.slice(0, 3).map(e => e.film.title);
  const accent = categoryAccent[list.category] || '';
  const label = categoryLabel[list.category] || list.category;

  /* A list may supply its own artwork (see data/lists/*.json's optional
     thumbnail field) — it wins over the generated cover poster, same
     precedence as the home page. It's a wide banner (not a movie
     poster), so it gets its own landscape wrapper rather than being
     forced into the portrait 2:3 box — that would crop away almost all
     of it, showing a narrow vertical sliver through the middle. Path is
     relative to frontend/navras/, so a page under pages/ needs "../". */
  const wrapClass = list.thumbnail ? 'lc-cover-wrap lc-thumb-wrap' : 'lc-cover-wrap';
  const cover = list.thumbnail
    ? `<div class="lc-collage"><img src="../${list.thumbnail}" alt="${list.title}" loading="lazy" /></div>`
    : `<div class="lc-collage" id="lc-cover-${list.slug}"></div>`;

  return `
    <a class="list-card" href="list.html?slug=${encodeURIComponent(list.slug)}">
      <!-- Cover poster — the list's own top-3 pick, deduplicated against
           every other list by pickListCovers, filled in by
           loadListCardPosters(). Background stays plain ink until then. -->
      <div class="${wrapClass}">
        ${cover}
        <div class="lc-collage-overlay">
          <div class="lc-count-badge">${list.count} films</div>
        </div>
        <div class="lc-badge-wrap">
          <span class="lc-badge ${accent}">${label}</span>
        </div>
      </div>
      <!-- Card body -->
      <div class="lc-body">
        <div class="lc-tag">${label}</div>
        <div class="lc-title">${list.title}</div>
        <div class="lc-desc">${list.description}</div>
        <div class="lc-films-preview">
          ${topFilms.map(f => `<span class="lc-film-chip">${f}</span>`).join('')}
        </div>
        <div class="lc-bottom">
          <div class="lc-meta">Curated by CineRaaga</div>
          <div class="lc-arrow">→</div>
        </div>
      </div>
    </a>
  `;
}

/* ---- Load each card's single cover poster ---- */
async function loadListCardPosters() {
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';

  for (const list of allListsFlat) {
    if (!list.coverEntry) continue;
    const cell = document.getElementById(`lc-cover-${list.slug}`);
    if (!cell) continue;

    const f = list.coverEntry.film;
    try {
      // Pinned tmdb_id is a direct lookup, not a title search — it can't
      // resolve to the wrong film the way a global title search can.
      let path = null;
      if (f.tmdb_id) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${f.tmdb_id}?api_key=${TMDB_KEY}`);
        const data = await res.json();
        path = data?.poster_path || null;
      } else {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}`
        );
        const data = await res.json();
        path = data?.results?.[0]?.poster_path || null;
      }
      if (path) {
        cell.style.backgroundImage = `url('https://image.tmdb.org/t/p/w342${path}')`;
        cell.style.backgroundSize = 'cover';
        cell.style.backgroundPosition = 'center';
      }
    } catch (e) {}
  }
}

function renderAllLists() {
  const host = document.getElementById('listsSections');
  if (!host) return;

  // Preserve index.json's category order rather than imposing one here.
  const order = [];
  allListsFlat.forEach(l => { if (!order.includes(l.category)) order.push(l.category); });

  host.innerHTML = order.map(cat => {
    const [heading, sub] = categoryHeading[cat] || [categoryLabel[cat] || cat, ''];
    const cards = allListsFlat.filter(l => l.category === cat).map(renderListCard).join('');
    return `
      <div class="lists-section" data-cat="${cat}">
        <div class="ls-head">
          <div class="ls-title"><span class="title-bar"></span>${heading}</div>
          ${sub ? `<div class="ls-sub">${sub}</div>` : ''}
        </div>
        <div class="lists-cards-grid">${cards}</div>
      </div>`;
  }).join('');

  loadListCardPosters();
}

/* ---- Category filter — operates on the generated sections, so it stays
   correct as categories are added or removed from the data ---- */
function applyCategoryFilter(cat) {
  document.querySelectorAll('.lf-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === cat));
  document.querySelectorAll('#listsSections .lists-section').forEach(sec => {
    sec.style.display = (cat === 'all' || sec.dataset.cat === cat) ? 'block' : 'none';
  });
}

function initCategoryFilter() {
  document.querySelectorAll('.lf-btn').forEach(btn => {
    btn.addEventListener('click', () => applyCategoryFilter(btn.dataset.cat));
  });

  /* The home page's "See all →" link on each category section points
     here with ?cat=<category>, so the filter a viewer already chose
     carries over instead of landing on the unfiltered page. Falls back
     to "all" for a missing or unrecognized value rather than a blank
     filtered view. */
  const requested = new URLSearchParams(location.search).get('cat');
  const valid = requested && document.querySelector(`.lf-btn[data-cat="${CSS.escape(requested)}"]`);
  applyCategoryFilter(valid ? requested : 'all');
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllLists();
  renderAllLists();
  initCategoryFilter();

  /* Only a list with real entries can be featured — the banner is built
     around a top-5 preview and poster collage, so featuring an empty list
     would render an advert for nothing. Hidden until one qualifies. */
  const banner = document.getElementById('featuredListBanner');
  const featured = allListsFlat
    .filter(l => l.entries.length)
    .sort((a, b) => String(b.updated_at || b.updated || '')
      .localeCompare(String(a.updated_at || a.updated || '')))[0];

  if (featured) {
    if (banner) banner.hidden = false;
    renderFeaturedBanner(featured);
    loadFeaturedBannerPosters(featured);
  } else if (banner) {
    banner.hidden = true;
  }

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
});

/* ---- Render featured banner text from the real list data — no more
   hand-typed title/count/top-5, which had drifted from the actual
   curated list (wrong film order, and a "50 films" count when only
   10 are curated so far). ---- */
function renderFeaturedBanner(list) {
  document.getElementById('flbTitle').textContent = list.title;
  document.getElementById('flbSub').textContent = list.description;
  document.getElementById('flbMeta').textContent = `${list.count} films · Curated by CineRaaga`;

  const btn = document.getElementById('flbBtn');
  btn.href = `list.html?slug=${encodeURIComponent(list.slug)}`;

  const top = list.entries.slice(0, 5);
  document.getElementById('flbPreview').innerHTML = top.map((e, i) => {
    const f = e.film;
    return `
      <div class="flb-rank-item">
        <span class="flb-num ${i === 0 ? 'gold' : ''}">${e.rank}</span>
        <div class="flb-mini-poster" id="flb-p-${i + 1}" style="background:linear-gradient(135deg,${f.color},${f.color}88);"></div>
        <div class="flb-film-info">
          <span class="flb-film-name">${f.title}</span>
          <span class="flb-film-year">${f.year}</span>
        </div>
      </div>`;
  }).join('');
}

/* ---- Load real posters + background collage for the featured banner ---- */
async function loadFeaturedBannerPosters(list) {
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  const top = list.entries.slice(0, 6);

  await Promise.all(top.map(async (e, i) => {
    const f = e.film;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}`
      );
      const data = await res.json();
      const movie = data?.results?.[0];
      if (!movie) return;

      if (i < 5 && movie.poster_path) {
        const el = document.getElementById(`flb-p-${i + 1}`);
        if (el) {
          el.style.backgroundImage = `url('https://image.tmdb.org/t/p/w185${movie.poster_path}')`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        }
      }

      const bgPath = movie.backdrop_path || movie.poster_path;
      if (bgPath) {
        const bgEl = document.getElementById(`flb-bg-${i + 1}`);
        if (bgEl) {
          bgEl.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${bgPath}')`;
          bgEl.style.backgroundSize = 'cover';
          bgEl.style.backgroundPosition = 'center';
        }
      }
    } catch (e) {}
  }));
}
