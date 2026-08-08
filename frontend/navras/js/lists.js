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
  genre:     ["By genre", "The films that define each kind of story"],
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
}

/* ---- Render list cards with visual collage ---- */
function renderListCard(list) {
  const topFilms = list.entries.slice(0, 3).map(e => e.film.title);
  const colors = ['#1a1a2e', '#0d2e1a', '#2e0d0d', '#1a2e0d'];

  const collageCells = list.entries.slice(0, 4).map((e, i) => {
    const c = e.film.color || colors[i];
    return `<div class="lc-collage-cell" id="lc-cell-${list.slug}-${i}"
      style="background:linear-gradient(135deg,${c},${c}88);">
    </div>`;
  }).join('');

  const accent = categoryAccent[list.category] || '';
  const label = categoryLabel[list.category] || list.category;

  return `
    <div class="list-card" onclick="openList('${list.slug}')">
      <!-- Visual collage top -->
      <div class="lc-collage">
        ${collageCells}
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
    </div>
  `;
}

/* ---- Load real posters into list card collages ---- */
async function loadListCardPosters() {
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  const lists = allListsFlat;

  for (const list of lists) {
    const entries = (list.entries || []).slice(0, 4);
    for (let i = 0; i < entries.length; i++) {
      const f = entries[i].film;
      const cellId = `lc-cell-${list.slug}-${i}`;
      const cell = document.getElementById(cellId);
      if (!cell) continue;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}`
        );
        const data = await res.json();
        const movie = data?.results?.[0];
        if (movie?.poster_path) {
          cell.style.backgroundImage = `url('https://image.tmdb.org/t/p/w185${movie.poster_path}')`;
          cell.style.backgroundSize = 'cover';
          cell.style.backgroundPosition = 'center';
        }
      } catch (e) {}
    }
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

/* ---- Open full list modal ---- */
async function openList(slug) {
  const list = allListsFlat.find(l => l.slug === slug);
  if (!list) return;

  document.getElementById('lmTag').textContent = categoryLabel[list.category] || list.category;
  document.getElementById('lmTitle').textContent = list.title;
  document.getElementById('lmMeta').textContent = 'Curated by CineRaaga';
  document.getElementById('lmIntro').textContent = list.intro;
  document.getElementById('listOverlay').style.display = 'block';
  document.getElementById('listOverlay').scrollTop = 0;
  document.body.style.overflow = 'hidden';

  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';

  // Render immediately with colour blocks
  document.getElementById('lmFilms').innerHTML = list.entries.map(e => {
    const f = e.film;
    const rank = e.rank;
    const isPlaceholder = f.score_status === 'placeholder';
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';

    // Score integrity: a placeholder score never wears the same colours
    // as an official one — it must not visually read as an editorial verdict.
    const scoreColor = isPlaceholder ? 'var(--text-muted)'
      : f.navras_score >= 85 ? '#2ECC71' : f.navras_score >= 65 ? '#F39C12' : '#E74C3C';
    const scoreBg = isPlaceholder ? 'rgba(255,255,255,0.08)'
      : f.navras_score >= 85 ? '#1A7A3C' : f.navras_score >= 65 ? '#C47A00' : '#C0392B';
    const scoreDisplay = isPlaceholder ? '—' : f.navras_score;
    const scoreLabel = isPlaceholder ? 'Placeholder' : 'Navras';
    const langLabel = f.language ? f.language.charAt(0).toUpperCase() + f.language.slice(1) : '';

    return `
      <div class="lm-film-row" id="lm-row-${rank}">
        <div class="lm-rank ${rankClass}">${rank}</div>
        <div class="lm-poster" id="lm-poster-${rank}"
          style="background:linear-gradient(160deg,${f.color},${f.color}88);">
          <div class="lm-poster-score" style="background:${scoreBg}">${scoreDisplay}</div>
        </div>
        <div class="lm-info">
          <div class="lm-film-title">${f.title}</div>
          <div class="lm-film-meta">${langLabel} · ${f.year}</div>
          <div class="lm-film-verdict">"${e.blurb}"</div>
          <div class="lm-rasas">${(f.rasas || []).map(r => `<span class="rtag">${r}</span>`).join('')}</div>
        </div>
        <div class="lm-score">
          <div class="lm-score-num" style="color:${scoreColor};">${scoreDisplay}</div>
          <div class="lm-score-label">${scoreLabel}</div>
        </div>
      </div>
    `;
  }).join('');

  // Load ALL posters in parallel — much faster
  await Promise.all(list.entries.map(async e => {
    const f = e.film;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}&language=en-US`
      );
      const data = await res.json();
      let movie = data?.results?.[0];
      if (!movie?.poster_path && data?.results?.length > 1) {
        movie = data.results.find(r => r.poster_path) || movie;
      }
      if (movie?.poster_path) {
        const posterEl = document.getElementById(`lm-poster-${e.rank}`);
        if (posterEl) {
          const img = document.createElement('img');
          img.src = `https://image.tmdb.org/t/p/w185${movie.poster_path}`;
          img.alt = f.title;
          img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:6px;';
          img.loading = 'lazy';
          img.onerror = () => img.remove();
          posterEl.style.position = 'relative';
          posterEl.style.overflow = 'hidden';
          posterEl.prepend(img);
        }
      }
    } catch (err) {}
  }));
}

function closeList() {
  document.getElementById('listOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

/* ---- Category filter — operates on the generated sections, so it stays
   correct as categories are added or removed from the data ---- */
function initCategoryFilter() {
  document.querySelectorAll('.lf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('#listsSections .lists-section').forEach(sec => {
        sec.style.display = (cat === 'all' || sec.dataset.cat === cat) ? 'block' : 'none';
      });
    });
  });
}

/* ---- Close modal on escape ---- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeList();
});

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
  btn.onclick = (e) => { e.preventDefault(); openList(list.slug); };

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
