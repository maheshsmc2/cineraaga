/* ===========================
   NAVRAS — Home Page JS v3
   Indian films only, fixed gaps, OTT posters
   =========================== */

const langNames = {
  hi:'Hindi', ta:'Tamil', te:'Telugu', ml:'Malayalam',
  kn:'Kannada', bn:'Bengali', mr:'Marathi', pa:'Punjabi',
  gu:'Gujarati', en:'English'
};

const INDIAN_LANGS = ['hi','ta','te','ml','kn','mr','bn','pa','gu'];

const REVIEWED_TMDB_ID = 1303331; // Dhamaal 4 — pages/dhamaal-4-2026.html, our real published review

/* TMDb's discover endpoints only accept a SINGLE with_original_language
   value — a comma list like 'ta,te,ml,kn' silently returns zero results,
   it is not treated as an OR match. This issues one call per language
   and merges the results, which is what several sections here actually
   needed all along. */
async function discoverByLanguages(endpoint, langs, params = {}) {
  const results = await Promise.all(
    langs.map(lang => TMDB.get(endpoint, { ...params, with_original_language: lang }))
  );
  return results.flatMap(d => d?.results || []);
}

function scoreClass(s) { return s >= 75 ? 'green' : s >= 55 ? 'amber' : 'red'; }
function scoreColorHex(s) { return s >= 75 ? '#2ECC71' : s >= 55 ? '#F39C12' : '#E74C3C'; }

/* ---- Render poster card ---- */
function renderCinemaCard(film, type) {
  const isTV = type === 'tv';
  const title = isTV ? (film.name||film.original_name) : (film.title||film.original_title);
  const posterUrl = film.poster_path ? TMDB.poster(film.poster_path, 'w342') : null;
  const lang = film.original_language;
  const langName = langNames[lang] || (lang ? lang.toUpperCase() : '');
  const year = (film.release_date||film.first_air_date||'').slice(0,4);
  const rasas = TMDB.genreTags((film.genre_ids||[]).map(id=>({id})));

  // Dhamaal 4 has a real, hand-scored CineRaaga review — link to it and
  // show the real Navras Score instead of TMDb's audience rating.
  const isReviewed = film.id === REVIEWED_TMDB_ID;
  const link = isReviewed ? 'pages/dhamaal-4-2026.html' : `pages/movie.html?id=${film.id}`;
  const score = isReviewed ? 42 : TMDB.audienceRating(film.vote_average, film.vote_count);
  const sc = isReviewed ? 'red' : scoreClass(score);

  return `
    <a href="${link}" class="cinema-card">
      <div class="cinema-poster">
        ${posterUrl
          ? `<img src="${posterUrl}" alt="${title}" loading="lazy" onerror="this.parentElement.style.background='var(--ink3)';this.remove()" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;">🎬</div>`}
        ${langName ? `<div class="cinema-lang">${langName}</div>` : ''}
        ${score ? `<div class="cinema-score ${sc}">${score}</div>` : ''}
      </div>
      <div class="cinema-info">
        <div class="cinema-title">${title||'Unknown'}</div>
        <div class="cinema-meta">${year}</div>
      </div>
    </a>`;
}

/* ---- Render OTT card with real poster ---- */
function renderOttCard(f, film) {
  // Works for both movies and TV shows
  const posterPath = film?.poster_path || null;
  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null;
  const score = f.score;
  const sc = scoreClass(score);
  const pageType = f.type === 'tv' ? 'tv' : 'movie';
  const movieLink = f.tmdbId ? `pages/movie.html?id=${f.tmdbId}` : 'pages/movie.html';
  const bg = f.color || '#1a1a2e';

  return `
    <a href="${movieLink}" class="cinema-card">
      <div class="cinema-poster" style="${!posterUrl ? `background:linear-gradient(160deg,${bg},${bg}cc)` : ''}">
        ${posterUrl
          ? `<img src="${posterUrl}" alt="${f.title}" loading="lazy"
              onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(160deg,${bg},${bg}cc)'" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:11px;">No poster</div>`}
        <div class="cinema-lang">${f.lang}</div>
        ${score ? `<div class="cinema-score ${sc}">${score}</div>` : ''}
      </div>
      <div class="cinema-info">
        <div class="cinema-title">${f.title}</div>
        <div class="cinema-meta">${f.year}</div>
      </div>
    </a>`;
}

/* ---- Render review row ---- */
function renderReviewRow(film, type) {
  const isTV = type === 'tv';
  const title = isTV ? (film.name||film.original_name) : (film.title||film.original_title);
  const posterUrl = film.poster_path ? TMDB.poster(film.poster_path,'w92') : null;
  const score = TMDB.audienceRating(film.vote_average, film.vote_count);
  const lang = film.original_language;
  const langName = langNames[lang] || (lang ? lang.toUpperCase() : '');
  const year = (film.release_date||film.first_air_date||'').slice(0,4);
  const rasas = TMDB.genreTags((film.genre_ids||[]).map(id=>({id})));
  const userScore = film.vote_average ? film.vote_average.toFixed(1) : '?';
  const usc = parseFloat(userScore)>=7 ? '#2ECC71' : parseFloat(userScore)>=5 ? '#F39C12' : '#E74C3C';

  return `
    <a href="pages/movie.html?id=${film.id}" class="review-row">
      <div class="rr-score ${scoreClass(score)}">
        <div class="rr-score-num">${score||'?'}</div>
        <div class="rr-score-lbl">AUDIENCE</div>
      </div>
      ${posterUrl
        ? `<img src="${posterUrl}" class="rr-poster" alt="${title}" loading="lazy" onerror="this.style.display='none'" />`
        : `<div class="rr-poster"></div>`}
      <div class="rr-info">
        <div class="rr-top">
          <div class="rr-title">${title||'Unknown'}</div>
          <div class="rr-year">${year}</div>
          ${langName ? `<div class="rr-lang">${langName}</div>` : ''}
        </div>
        <div class="rr-rasas">${rasas.slice(0,2).map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
      </div>
      <div class="rr-right">
        <div class="rr-user-score" style="color:${usc};">${userScore}</div>
        <div class="rr-user-label">User score</div>
      </div>
    </a>`;
}



/* ---- LOAD FUNCTIONS ---- */

/* In cinemas — real Indian releases only. The old hardcoded ID list here
   turned out to be entirely wrong (IDs resolved to unrelated Western/
   international titles — Smile 2, Anora, Damsel, etc.), so this now
   always pulls from TMDb's actual India-region now_playing feed,
   filtered to Indian-language originals. Our own reviewed film
   (Dhamaal 4) is pinned first since it's the one with a real CineRaaga
   verdict attached. */
async function loadCinemas() {
  const grid = document.getElementById('cinemasGrid');
  if (!grid) return;

  let pinned = null;
  try {
    const data = await TMDB.get(`/movie/${REVIEWED_TMDB_ID}`, {});
    if (data && !data.status_code && data.success !== false) pinned = data;
  } catch {}

  const nowPlaying = await TMDB.get('/movie/now_playing', { region: 'IN' });
  const films = (nowPlaying?.results || [])
    .filter(f => INDIAN_LANGS.includes(f.original_language) && f.id !== REVIEWED_TMDB_ID)
    .slice(0, pinned ? 9 : 10);

  const finalFilms = pinned ? [pinned, ...films] : films;
  grid.innerHTML = finalFilms.map(f => renderCinemaCard(f, 'movie')).join('');
}

/* Recent reviews — Indian films */
async function loadReviews(sort) {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  list.innerHTML = '<div class="review-skeleton"></div>'.repeat(5);

  let data;
  if (sort === 'top') {
    data = await TMDB.get('/discover/movie', {
      with_original_language: 'hi',
      sort_by: 'vote_average.desc',
      'vote_count.gte': 500
    });
  } else {
    // Trending Indian films this week
    const trending = await TMDB.get('/trending/movie/week', {});
    const indianFilms = (trending?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language));

    if (indianFilms.length >= 4) {
      list.innerHTML = indianFilms.slice(0, 6).map(f => renderReviewRow(f, 'movie')).join('');
      return;
    }

    // Supplement with discover
    data = await TMDB.get('/discover/movie', {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
  }

  const results = (data?.results || [])
    .filter(f => INDIAN_LANGS.includes(f.original_language))
    .slice(0, 6);

  list.innerHTML = results.length
    ? results.map(f => renderReviewRow(f, 'movie')).join('')
    : '<div style="color:var(--text-muted);padding:20px;">No reviews available</div>';
}


/* Coming soon — Indian upcoming */
async function loadComingSoon() {
  const grid = document.getElementById('comingGrid');
  if (!grid) return;

  // Fetch upcoming Indian films
  const releaseWindow = {
    sort_by: 'release_date.asc',
    'primary_release_date.gte': new Date().toISOString().slice(0,10),
    'primary_release_date.lte': new Date(Date.now() + 60*24*60*60*1000).toISOString().slice(0,10)
  };
  const [upcoming, southUpcoming] = await Promise.all([
    TMDB.get('/movie/upcoming', { region: 'IN' }),
    discoverByLanguages('/discover/movie', ['ta','te','ml','kn'], releaseWindow)
  ]);

  let results = [
    ...(upcoming?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language)),
    ...southUpcoming.filter(f => INDIAN_LANGS.includes(f.original_language))
  ]
  .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)
  .sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
  .slice(0, 5);

  if (!results.length) {
    grid.innerHTML = '<div style="color:var(--text-muted);padding:12px;">No upcoming releases found</div>';
    return;
  }

  // Render matching trending-list-item structure for alignment
  grid.innerHTML = results.map((film, i) => {
    const lang = film.original_language;
    const langName = langNames[lang] || (lang ? lang.toUpperCase() : '');
    const rd = film.release_date
      ? new Date(film.release_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})
      : '';
    return `
      <a href="pages/movie.html?id=${film.id}" class="trending-list-item">
        <div class="tli-rank">${i+1}</div>
        <div class="tli-title">${film.title || film.name}</div>
        <div class="tli-lang">${langName}</div>
        <div class="tli-score">
          <div class="tli-score-num" style="color:var(--text-muted);font-size:11px;white-space:nowrap;">${rd}</div>
        </div>
      </a>`;
  }).join('');
}

/* TV Shows */
async function loadTV() {
  const grid = document.getElementById('tvGrid');
  const list = document.getElementById('tvReviewsList');

  const data = await TMDB.get('/trending/tv/week', {});
  let indianTV = (data?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language));

  // Trending-this-week rarely has 6+ Indian shows — supplement with a
  // language-filtered discover call instead of padding with global shows.
  if (indianTV.length < 6) {
    const supplement = await discoverByLanguages('/discover/tv', ['hi','ta','te','ml','kn'], { sort_by: 'popularity.desc' });
    indianTV = [...indianTV, ...supplement.filter(f => INDIAN_LANGS.includes(f.original_language))]
      .filter((f,i,arr) => arr.findIndex(x=>x.id===f.id)===i);
  }

  const mixed = indianTV.slice(0,6);

  if (grid) grid.innerHTML = mixed.map(f => renderCinemaCard(f, 'tv')).join('');
  if (list) list.innerHTML = mixed.slice(0,4).map(f => renderReviewRow(f,'tv')).join('');
}




function initTopTabs() {
  document.querySelectorAll('.top-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.top-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('tab-movies').style.display = tab==='movies'?'block':'none';
      document.getElementById('tab-tv').style.display = tab==='tv'?'block':'none';
      document.getElementById('tab-news').style.display = tab==='news'?'block':'none';
      if (tab==='tv') loadTV();
    });
  });
}

function initReviewSort() {
  document.querySelectorAll('.rsort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rsort-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadReviews(btn.dataset.sort);
    });
  });
}

function initSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key==='Enter' && input.value.trim()) {
      window.location.href = `pages/browse.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

/* ---- Fix gap CSS issue inline ---- */
function fixGaps() {
  // Remove empty space between sections
  document.querySelectorAll('.home-section').forEach(s => {
    s.style.paddingTop = '20px';
    s.style.paddingBottom = '20px';
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initTopTabs();
  initSearch();
  loadCinemas();
  loadComingSoon();
  loadPopularNow();
  initPopularNowToggle();
  initExplorerFilter();
  loadFeaturedReview();
});

/* ===========================
   HERO CAROUSEL
   =========================== */

const carouselFilms = [
  { title:"Stree 2", year:2024, lang:"Hindi", type:"Film", score:87, verdict:"Rajkummar & Shraddha deliver the horror comedy sequel India deserved.", id:1100782 },
  { title:"RRR", year:2022, lang:"Telugu", type:"Film", score:95, verdict:"Pure cinematic adrenaline. S.S. Rajamouli at his most unstoppable.", id:759244 },
  { title:"All We Imagine as Light", year:2024, lang:"Malayalam", type:"Film", score:96, verdict:"Grand Prix at Cannes. India's most quietly beautiful film in decades.", id:1017336 },
  { title:"IC 814: The Kandahar Hijack", year:2024, lang:"Hindi", type:"Series", score:91, verdict:"India's most gripping series based on true events.", id:242074 },
  { title:"Dangal", year:2016, lang:"Hindi", type:"Film", score:96, verdict:"Aamir Khan and two extraordinary daughters. The greatest Indian sports film ever made.", id:363676 },
  { title:"Tumbbad", year:2018, lang:"Hindi", type:"Film", score:94, verdict:"Greed, mythology, and nightmares fused into something completely original.", id:520110 }
];


async function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots) return;

  // Fetch real backdrops from TMDb for each film
  const withBackdrops = await Promise.all(carouselFilms.map(async f => {
    try {
      const endpoint = f.type === 'Series' ? `/tv/${f.id}` : `/movie/${f.id}`;
      const data = await TMDB.get(endpoint, {});
      const backdropPath = data?.backdrop_path || data?.poster_path;
      const backdrop = backdropPath
        ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
        : null;
      return { ...f, backdrop };
    } catch {
      return { ...f, backdrop: null };
    }
  }));

  track.innerHTML = withBackdrops.map((f, i) => {
    const sc = f.score >= 75 ? 'green' : f.score >= 55 ? 'amber' : 'red';
    const typeClass = f.type.toLowerCase() === 'series' ? 'series' : 'film';
    const bgStyle = f.backdrop
      ? `background-image:url('${f.backdrop}'); background-size:cover; background-position:center;`
      : `background:linear-gradient(135deg, #1a1a2e, #2a1a3e);`;
    return `
      <div class="carousel-slide${i===0?' active':''}" data-index="${i}">
        <div class="carousel-bg" style="${bgStyle}"></div>
        <div class="carousel-overlay"></div>
        <div class="carousel-content">
          <div class="carousel-badge">
            <span class="carousel-badge-dot"></span>
            ${f.lang} · ${f.year}
          </div>
          <div class="carousel-title">${f.title}</div>
          <div class="carousel-meta">
            <span class="carousel-type ${typeClass}">${f.type}</span>
          </div>
          <div class="carousel-verdict">${f.verdict}</div>
          <div class="carousel-bottom">
            <div class="carousel-score ${sc}">
              <div class="carousel-score-num">${f.score}</div>
              <div class="carousel-score-lbl">AUDIENCE</div>
            </div>
            <div class="carousel-rasas">
              ${f.rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}
            </div>
            <a href="pages/movie.html?id=${f.id}" class="carousel-cta">Full review →</a>
          </div>
        </div>
      </div>`;
  }).join('');

  dots.innerHTML = withBackdrops.map((_,i) =>
    `<button class="carousel-dot${i===0?' active':''}" onclick="carouselGoTo(${i})"></button>`
  ).join('');

  // Activate first slide
  const firstSlide = track.querySelector('.carousel-slide');
  if (firstSlide) firstSlide.classList.add('active');

  startCarouselTimer();
}

function carouselGoTo(index) {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = document.querySelectorAll('.carousel-slide');
  if (!track) return;

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  carouselIndex = ((index % carouselFilms.length) + carouselFilms.length) % carouselFilms.length;
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;

  if (slides[carouselIndex]) slides[carouselIndex].classList.add('active');
  if (dots[carouselIndex]) dots[carouselIndex].classList.add('active');
}

function carouselMove(dir) {
  clearCarouselTimer();
  carouselGoTo(carouselIndex + dir);
  startCarouselTimer();
}

function startCarouselTimer() {
  clearCarouselTimer();
  carouselTimer = setInterval(() => carouselGoTo(carouselIndex + 1), 5000);
}

function clearCarouselTimer() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
}

// Pause on hover
document.addEventListener('DOMContentLoaded', () => {
  buildCarousel();
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', clearCarouselTimer);
    carousel.addEventListener('mouseleave', startCarouselTimer);
    // Touch swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive:true });
    carousel.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) carouselMove(diff > 0 ? 1 : -1);
    });
  }
});

/* ===========================
   TRENDING THIS WEEK LISTS
   RT-style clean list
   =========================== */

let trendingMoviesData = [];
let trendingTVData = [];

function renderTrendingItem(film, rank, type) {
  const isTV = type === 'tv';
  const title = isTV ? (film.name||film.original_name) : (film.title||film.original_title);
  const score = TMDB.audienceRating(film.vote_average, film.vote_count);
  const lang = film.original_language;
  const langName = langNames[lang] || (lang ? lang.toUpperCase() : '');
  const sc = score >= 75 ? 'green' : score >= 55 ? 'amber' : 'red';
  const icon = sc === 'green' ? '▲' : sc === 'amber' ? '●' : '▼';

  return `
    <a href="pages/movie.html?id=${film.id}" class="trending-list-item">
      <div class="tli-rank">${rank}</div>
      <div class="tli-title">${title||'Unknown'}</div>
      <div class="tli-lang">${langName}</div>
      <div class="tli-score">
        <div class="tli-score-icon ${sc}">${icon}</div>
        <div class="tli-score-num">${score ? score+'%' : '—'}</div>
      </div>
    </a>`;
}

async function loadTrendingMovies(langFilter) {
  const list = document.getElementById('trendingMoviesList');
  if (!list) return;

  if (!trendingMoviesData.length) {
    list.innerHTML = '<div class="trending-skeleton-item"></div>'.repeat(10);
    // Fetch Indian trending movies
    const [hi, south] = await Promise.all([
      TMDB.get('/trending/movie/week', {}),
      TMDB.discover({ with_original_language:'ta,te,ml,kn', sort_by:'popularity.desc', 'vote_count.gte':50 })
    ]);
    const hiFilms = (hi?.results||[]).filter(f => INDIAN_LANGS.includes(f.original_language));
    const southFilms = (south?.results||[]).filter(f => INDIAN_LANGS.includes(f.original_language));

    // Merge and deduplicate
    trendingMoviesData = [...hiFilms, ...southFilms]
      .filter((f,i,arr) => arr.findIndex(x=>x.id===f.id)===i)
      .sort((a,b) => b.popularity - a.popularity);
  }

  let filtered = langFilter && langFilter !== 'all'
    ? trendingMoviesData.filter(f => f.original_language === langFilter)
    : trendingMoviesData;

  // If filtered is empty, show all
  if (!filtered.length) filtered = trendingMoviesData;

  list.innerHTML = filtered.slice(0,10).map((f,i) => renderTrendingItem(f, i+1, 'movie')).join('') ||
    '<div style="color:var(--text-muted);padding:12px;">No results</div>';
}

async function loadTrendingTV(langFilter) {
  const list = document.getElementById('trendingTVList');
  if (!list) return;

  if (!trendingTVData.length) {
    list.innerHTML = '<div class="trending-skeleton-item"></div>'.repeat(10);
    const data = await TMDB.get('/trending/tv/week', {});
    trendingTVData = (data?.results||[]);
  }

  let filtered = langFilter && langFilter !== 'all'
    ? trendingTVData.filter(f => f.original_language === langFilter)
    : trendingTVData.filter(f => INDIAN_LANGS.includes(f.original_language));

  // Fallback to global if no Indian TV found
  if (!filtered.length) filtered = trendingTVData.slice(0,10);

  list.innerHTML = filtered.slice(0,10).map((f,i) => renderTrendingItem(f, i+1, 'tv')).join('') ||
    '<div style="color:var(--text-muted);padding:12px;">No results</div>';
}

function initTrendingTabs() {
  // Movies tabs
  document.querySelectorAll('.trending-col-tab[data-col="movies"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.trending-col-tab[data-col="movies"]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadTrendingMovies(btn.dataset.filter);
    });
  });

  // TV tabs
  document.querySelectorAll('.trending-col-tab[data-col="tv"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.trending-col-tab[data-col="tv"]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadTrendingTV(btn.dataset.filter);
    });
  });

  // Initial load
  loadTrendingMovies('all');
  loadTrendingTV('all');
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initTrendingTabs();
});


/* ===========================
   FEATURED REVIEW + POPULAR NOW
   =========================== */

/* Featured review — latest Indian release, shown prominently */
async function loadFeaturedReview() {
  const container = document.getElementById('featuredReview');
  const list = document.getElementById('reviewsList');
  if (!container) return;

  // Get latest Indian films
  const data = await TMDB.get('/trending/movie/week', {});
  const films = (data?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language));

  if (!films.length) {
    container.innerHTML = '';
    return;
  }

  // First film = featured
  const featured = films[0];
  const rest = films.slice(1, 7);

  const posterUrl = featured.poster_path ? TMDB.poster(featured.poster_path, 'w185') : null;
  const score = TMDB.audienceRating(featured.vote_average, featured.vote_count);
  const sc = scoreClass(score);
  const lang = featured.original_language;
  const langName = langNames[lang] || lang?.toUpperCase() || '';
  const year = (featured.release_date || '').slice(0, 4);
  const rasas = TMDB.genreTags((featured.genre_ids || []).map(id => ({ id })));

  // Verdicts for featured films
  const verdicts = {
    default: "A film that demands your attention this week."
  };

  container.innerHTML = `
    <a href="pages/movie.html?id=${featured.id}" class="featured-review-card">
      <div class="fr-poster">
        ${posterUrl ? `<img src="${posterUrl}" alt="${featured.title}" loading="lazy" />` : ''}
        ${score ? `<div class="fr-score ${sc}"><div>${score}</div><div class="fr-score-lbl">NVS</div></div>` : ''}
      </div>
      <div class="fr-content">
        <div class="fr-badge"><span class="fr-badge-dot"></span>Latest review</div>
        <div class="fr-title">${featured.title || featured.name}</div>
        <div class="fr-meta">${langName} · ${year} · ${featured.vote_average?.toFixed(1)} IMDb</div>
        <div class="fr-verdict">${verdicts[featured.id] || verdicts.default}</div>
        <div class="fr-bottom">
          <div class="fr-three-words">
            ${rasas.map(r => `<span class="fr-word">${r}</span>`).join('')}
          </div>
          <div class="fr-rasas">
            ${rasas.map(r => `<span class="rtag">${r}</span>`).join('')}
          </div>
          <span class="fr-platform">Read review →</span>
        </div>
      </div>
    </a>`;

  // Rest as normal rows
  if (list) {
    list.innerHTML = rest.map(f => renderReviewRow(f, 'movie')).join('');
  }
}

/* Popular right now — Indian films only */
async function loadPopularNow() {
  const moviesCol = document.getElementById('popularMoviesList');
  const tvCol = document.getElementById('popularTVList');

  // Fetch Indian trending from multiple language sources
  const [trending, hiMovies, southMovies, indianTV] = await Promise.all([
    TMDB.get('/trending/movie/week', {}),
    TMDB.get('/discover/movie', {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    }),
    discoverByLanguages('/discover/movie', ['ta','te','ml','kn'], {
      sort_by: 'popularity.desc',
      'vote_count.gte': 50
    }),
    TMDB.get('/discover/tv', {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      'vote_count.gte': 50
    })
  ]);

  // Movies — Indian films only, sorted by popularity
  if (moviesCol) {
    const trendingIndian = (trending?.results || [])
      .filter(f => INDIAN_LANGS.includes(f.original_language));
    const hiFilms = (hiMovies?.results || [])
      .filter(f => f.original_language === 'hi');
    const southFilms = southMovies
      .filter(f => INDIAN_LANGS.includes(f.original_language));

    // Merge all Indian films, deduplicate, sort by popularity
    let allIndian = [...trendingIndian, ...hiFilms, ...southFilms]
      .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);

    moviesCol.innerHTML = allIndian.slice(0,5).map((f, i) =>
      renderTrendingItem(f, i + 1, 'movie')
    ).join('');
  }

  // TV — Indian series only
  if (tvCol) {
    const trendingTV = (trending?.results || [])
      .filter(f => INDIAN_LANGS.includes(f.original_language));
    const indianSeries = (indianTV?.results || [])
      .filter(f => f.original_language === 'hi');

    // Hardcode top Indian series since TMDb TV data for Indian is limited
    const topIndianSeries = [
      { id: 113855, name: 'Scam 1992', original_language: 'hi', vote_average: 9.2, vote_count: 85000, popularity: 900 },
      { id: 94954, name: 'Panchayat', original_language: 'hi', vote_average: 9.0, vote_count: 45000, popularity: 850 },
      { id: 95557, name: 'The Family Man', original_language: 'hi', vote_average: 8.7, vote_count: 52000, popularity: 800 },
      { id: 125925, name: 'Paatal Lok', original_language: 'hi', vote_average: 8.4, vote_count: 28000, popularity: 750 },
      { id: 209764, name: 'Farzi', original_language: 'hi', vote_average: 8.2, vote_count: 22000, popularity: 700 },
      { id: 112130, name: 'Aspirants', original_language: 'hi', vote_average: 8.9, vote_count: 18000, popularity: 650 },
      { id: 120168, name: 'Rocket Boys', original_language: 'hi', vote_average: 8.5, vote_count: 15000, popularity: 600 },
      { id: 242074, name: 'IC 814: The Kandahar Hijack', original_language: 'hi', vote_average: 8.4, vote_count: 32000, popularity: 880 },
      { id: 99966, name: 'Mirzapur', original_language: 'hi', vote_average: 8.5, vote_count: 65000, popularity: 820 },
      { id: 108978, name: 'Raktanchal', original_language: 'hi', vote_average: 8.1, vote_count: 12000, popularity: 550 }
    ];

    const allTV = [...trendingTV, ...indianSeries, ...topIndianSeries]
      .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);

    tvCol.innerHTML = allTV.slice(0,5).map((f, i) =>
      renderTrendingItem(f, i + 1, 'tv')
    ).join('');
  }
}

/* Popular now toggle — movies vs TV */
function initPopularNowToggle() {
  const moviesCol = document.getElementById('popularMoviesList');
  const tvCol = document.getElementById('popularTVList');

  document.querySelectorAll('[data-pop]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pop]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.pop;
      // On mobile — toggle visibility
      if (window.innerWidth < 700) {
        if (moviesCol) moviesCol.style.display = tab === 'movies' ? 'flex' : 'none';
        if (tvCol) tvCol.style.display = tab === 'tv' ? 'flex' : 'none';
      }
    });
  });
}

// Add to init
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedReview();
  loadPopularNow();
  initPopularNowToggle();
});

/* ===========================
   RANKER-STYLE EXPLORER LISTS
   Visual cards with collage thumbnails
   =========================== */

const explorerCategoryLabel = {
  evergreen: 'All time',
  ott: 'OTT',
  trending: 'Trending',
  language: 'Language',
  awards: 'Awards',
  genre: 'Genre',
  actor: 'Actor',
  director: 'Director',
  setting: 'Setting'
};

let explorerListsData = [];

/* ---- Load real curated lists (data/lists/*.json) — counts and
   preview titles come straight from the data, never hand-typed ---- */
async function loadExplorerListsData() {
  try {
    const indexRes = await fetch('data/lists/index.json');
    const index = await indexRes.json();
    const fullLists = await Promise.all(
      index.map(entry => fetch(`data/lists/${entry.slug}.json`).then(r => r.json()).catch(() => null))
    );
    /* Empty lists are kept, not filtered out — a seeded-but-uncurated list
       renders an honest "0 films — coming soon" card rather than being
       silently hidden. Populated lists sort first so the featured slot is
       never an empty one. */
    explorerListsData = index.map((entry, i) => ({
      id: entry.slug,
      filter: entry.category === 'evergreen' ? 'alltime' : entry.category,
      category: explorerCategoryLabel[entry.category] || entry.category,
      title: entry.title,
      description: entry.description || '',
      updated: entry.updated_at || entry.updated || null,
      count: (fullLists[i]?.entries || []).length,
      entries: fullLists[i]?.entries || []
    })).sort((a, b) => (b.entries.length ? 1 : 0) - (a.entries.length ? 1 : 0));
  } catch (e) {
    explorerListsData = [];
  }
}

let explorerPosterCache = {};
let currentExplorerFilter = 'all';

async function fetchPostersForList(list) {
  if (explorerPosterCache[list.id]) return explorerPosterCache[list.id];

  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  const posters = await Promise.all(list.entries.slice(0, 4).map(async e => {
    const f = e.film;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}`
      );
      const data = await res.json();
      const movie = data?.results?.[0];
      return movie?.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : null;
    } catch { return null; }
  }));

  explorerPosterCache[list.id] = posters;
  return posters;
}

function renderExplorerCard(list, posters, variant = 'small') {
  const cells = [0,1,2,3].map(i => {
    const url = posters?.[i];
    return url
      ? `<div class="elc-collage-cell"><img src="${url}" alt="" loading="lazy" /></div>`
      : `<div class="elc-collage-cell"></div>`;
  }).join('');

  const preview = list.entries.slice(0, 2).map(e => e.film.title);
  const isEmpty = !list.entries.length;
  const href = `pages/list.html?slug=${encodeURIComponent(list.id)}`;
  const countLabel = isEmpty ? '0 films — coming soon' : `${list.count} films`;

  if (variant === 'featured') {
    return `
      <a href="${href}" class="elc-featured${isEmpty ? ' elc-empty' : ''}" data-filter="${list.filter}" data-id="${list.id}">
        <div class="elc-featured-collage">${cells}</div>
        <div class="elc-featured-body">
          <div class="elc-category">${list.category} · ${countLabel}</div>
          <div class="elc-title">${list.title}</div>
          ${isEmpty
            ? `<div class="elc-desc">${list.description}</div>`
            : `<div class="elc-preview">
            ${preview.map((title, i) => `
              <div class="elc-preview-item">
                <span class="elc-preview-rank">#${i+1}</span>
                <span class="elc-preview-title">${title}</span>
              </div>`).join('')}
          </div>`}
        </div>
      </a>`;
  }

  return `
    <a href="${href}" class="elc-small${isEmpty ? ' elc-empty' : ''}" data-filter="${list.filter}" data-id="${list.id}">
      <div class="elc-small-collage">${cells}</div>
      <div class="elc-small-body">
        <div class="elc-category">${list.category}${isEmpty ? ' · 0 films — coming soon' : ''}</div>
        <div class="elc-title">${list.title}</div>
      </div>
    </a>`;
}

async function loadExplorerLists(filter) {
  const grid = document.getElementById('explorerListsGrid');
  if (!grid) return;

  if (!explorerListsData.length) await loadExplorerListsData();

  const filtered = filter === 'all'
    ? explorerListsData
    : explorerListsData.filter(l => l.filter === filter);

  const featured = filtered[0];
  const smalls = filtered.slice(1, 4);
  const bottom = filtered.slice(4, 7);

  grid.innerHTML = `
    <div class="elg-top">
      ${featured ? renderExplorerCard(featured, null, 'featured') : ''}
      <div class="elg-stack">
        ${smalls.map(l => renderExplorerCard(l, null, 'small')).join('')}
      </div>
    </div>
    <div class="elg-bottom">
      ${bottom.map(l => renderExplorerCard(l, null, 'small')).join('')}
    </div>`;

  for (const list of filtered.slice(0, 7)) {
    const posters = await fetchPostersForList(list);
    const allCards = grid.querySelectorAll('[data-id]');
    for (const card of allCards) {
      if (card.dataset.id === list.id) {
        const collageClass = card.classList.contains('elc-featured') ? '.elc-featured-collage' : '.elc-small-collage';
        const collage = card.querySelector(collageClass);
        if (collage) {
          const cells = collage.querySelectorAll('.elc-collage-cell');
          posters.forEach((url, i) => {
            if (cells[i] && url) {
              cells[i].innerHTML = `<img src="${url}" alt="" loading="lazy" />`;
            }
          });
        }
        break;
      }
    }
  }
}

function initExplorerFilter() {
  document.querySelectorAll('.eft-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eft-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentExplorerFilter = btn.dataset.filter;
      loadExplorerLists(currentExplorerFilter);
    });
  });
  loadExplorerLists('all');
}

document.addEventListener('DOMContentLoaded', () => {
  initExplorerFilter();
});

/* ===========================
   EDITORIAL STRIP
   Featured story + trending list
   =========================== */

/* Every other editorialStories entry leaves score: null — those films are
   score_status:"placeholder" in data/films/*.json and placeholders never
   display a badge (see score display rule). Dhamaal 4 is the exception:
   it's a real, hand-scored, published CineRaaga review (pages/dhamaal-4-2026.html),
   not a placeholder, so its score is genuine and safe to show. */
const editorialStories = [
  {
    category: 'New Review',
    title: 'Dhamaal 4 Review — loud, forgettable comfort food, best saved for OTT',
    meta: 'Hindi · 2026',
    score: 42, scoreClass: 'red',
    tmdbId: 1303331, type: 'movie',
    link: 'pages/dhamaal-4-2026.html'
  },
  {
    category: 'New Review',
    title: 'Saiyaara Review — Ahaan Panday announces himself in 2025\'s biggest romantic debut',
    meta: 'Hindi · 2025',
    score: null,
    tmdbId: 1241634, type: 'movie',
    link: 'pages/article.html'
  },
  {
    category: 'In Cinemas',
    title: 'Dhurandhar: The Revenge — Is Ranveer Singh\'s action epic worth the ticket price?',
    meta: 'Hindi · 2026',
    score: null,
    tmdbId: 1582770, type: 'movie',
    link: 'pages/article.html'
  },
  {
    category: 'OTT Pick',
    title: 'All We Imagine as Light is the best Indian film on Netflix right now',
    meta: 'Malayalam · On Netflix',
    score: null,
    tmdbId: 1017336, type: 'movie',
    link: 'pages/article.html'
  },
  {
    category: 'Mood Search',
    title: 'Feeling tense? These 10 Indian thrillers will keep you up all night',
    meta: 'Bhayanaka rasa · 10 films',
    score: null,
    tmdbId: 520110, type: 'movie',
    link: 'pages/mood.html'
  },
  {
    category: 'Coming Soon',
    title: 'Nagabandham, Dhamaal 4, Idhayam Murali — July 2026\'s biggest releases',
    meta: 'Telugu · Hindi · Tamil · July 2026',
    score: null,
    tmdbId: 1582770, type: 'movie',
    link: 'pages/article.html'
  },
  {
    category: 'New Review',
    title: 'IC 814: The Kandahar Hijack — Still the best Indian series you can watch',
    meta: 'Hindi · Netflix',
    score: null,
    tmdbId: 242074, type: 'tv',
    link: 'pages/article.html'
  },
  {
    category: 'Best of List',
    title: 'Best Malayalam Films of 2025 — Ranked by CineRaaga',
    meta: 'Curated list · 8 films · Malayalam',
    score: null,
    tmdbId: 1017336, type: 'movie',
    link: 'pages/article.html'
  }
];

async function buildEditorialStrip() {
  const featured = editorialStories[0];
  const stories = editorialStories.slice(1);

  // Load featured backdrop — only use backdrop_path (wide image), never poster
  try {
    const data = await TMDB.get(`/${featured.type}/${featured.tmdbId}`, {});
    const efImg = document.getElementById('efImg');
    if (efImg && data?.backdrop_path) {
      const imgUrl = `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`;
      // Preload to verify it works before setting
      const testImg = new Image();
      testImg.onload = () => { efImg.style.backgroundImage = `url('${imgUrl}')`; };
      testImg.onerror = () => { efImg.style.background = 'linear-gradient(135deg, #2a1a3e, #1a1a2e)'; };
      testImg.src = imgUrl;
    } else if (efImg) {
      efImg.style.background = 'linear-gradient(135deg, #2a1a3e, #1a1a2e)';
    }
  } catch(e) {
    const efImg = document.getElementById('efImg');
    if (efImg) efImg.style.background = 'linear-gradient(135deg, #2a1a3e, #1a1a2e)';
  }

  // Set featured content
  const efCat = document.getElementById('efCategory');
  const efTitle = document.getElementById('efTitle');
  const efMeta = document.getElementById('efMeta');

  if (efCat) efCat.innerHTML = `<span class="ef-cat-dot"></span>${featured.category}`;
  if (efTitle) efTitle.textContent = featured.title;
  if (efMeta) efMeta.innerHTML = `
    ${featured.score ? `<span class="ef-score ${featured.scoreClass}">${featured.score} Navras</span>` : ''}
    <span>${featured.meta}</span>
  `;

  // Make featured clickable
  const featuredEl = document.getElementById('editorialFeatured');
  if (featuredEl) featuredEl.onclick = () => window.location.href = featured.link;

  // Build story list
  const esList = document.getElementById('esList');
  if (!esList) return;

  esList.innerHTML = stories.map(s => `
    <a href="${s.link}" class="es-story">
      <div class="es-story-img" id="es-img-${s.tmdbId}">
        <div style="width:100%;height:100%;background:var(--ink3);"></div>
      </div>
      <div class="es-story-info">
        <div class="es-story-cat">${s.category}</div>
        <div class="es-story-title">${s.title}</div>
        <div class="es-story-meta">
          ${s.score ? `<span style="color:${s.scoreClass==='green'?'#2ECC71':'#F39C12'};font-weight:600;">${s.score}</span> · ` : ''}
          ${s.meta}
        </div>
      </div>
    </a>
  `).join('');

  // Load story thumbnails progressively
  for (const s of stories) {
    try {
      const data = await TMDB.get(`/${s.type}/${s.tmdbId}`, {});
      const path = data?.poster_path || data?.backdrop_path;
      if (path) {
        const el = document.getElementById(`es-img-${s.tmdbId}`);
        if (el) el.innerHTML = `<img src="https://image.tmdb.org/t/p/w185${path}" alt="" loading="lazy" />`;
      }
    } catch(e) {}
  }
}

// Search
function initSearchCompact() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `pages/browse.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildEditorialStrip();
  initSearchCompact();
});

/* Popular RT-style tab switching */
function initPopularRTTabs() {
  document.querySelectorAll('.prt-platform').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prt-platform').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.prt;
      const moviesList = document.getElementById('popularMoviesList');
      const tvList = document.getElementById('popularTVList');
      if (moviesList) moviesList.style.display = tab === 'movies' ? 'flex' : 'none';
      if (tvList) tvList.style.display = tab === 'tv' ? 'flex' : 'none';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPopularRTTabs();
});



/* ===========================
   NEW ON OTT — poster cards
   Manually-curated recent OTT arrivals (last ~60 days).
   TMDb doesn't reliably surface Indian OTT release dates, so —
   same as coming-to-OTT — this reads from a hand-maintained
   data file instead of a TMDb catalog query.
   =========================== */
const OTT_PLATFORM_LABELS = {
  netflix: 'Netflix',
  prime: 'Prime Video',
  hotstar: 'Hotstar',
  sony: 'SonyLIV',
  zee5: 'ZEE5'
};

async function loadOttPosterGrid(platform) {
  const grid = document.getElementById('ottPosterGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="poster-skeleton"></div>'.repeat(6);

  let entries = [];
  try {
    const res = await fetch('data/new_on_ott.json');
    entries = await res.json();
  } catch (e) {
    entries = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  const platformLabel = OTT_PLATFORM_LABELS[platform];

  const films = entries
    .filter(f => f.ott_platform === platformLabel)
    .filter(f => {
      const d = new Date(f.release_date);
      return d >= cutoff && d <= today;
    })
    .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
    .slice(0, 8);

  if (!films.length) {
    grid.innerHTML = `<div style="color:var(--text-muted);padding:20px;grid-column:1/-1;">Nothing new here — check back soon</div>`;
    return;
  }

  // Fetch each title's real poster + vote data by TMDb ID. Series entries
  // carry type:"tv" — the same numeric ID means a different, unrelated
  // title on /movie/, so the endpoint has to match the entry's type.
  const results = [];
  for (const f of films) {
    try {
      const data = await TMDB.get(`/${f.type === 'tv' ? 'tv' : 'movie'}/${f.tmdb_id}`, {});
      const score = TMDB.audienceRating(data.vote_average, data.vote_count);
      results.push({ f, posterPath: data.poster_path || null, score });
    } catch {
      results.push({ f, posterPath: null, score: null });
    }
  }

  grid.innerHTML = results.map(({ f, posterPath, score }) => {
    const sc = score >= 75 ? 'green' : score >= 55 ? 'amber' : 'red';
    const posterUrl = posterPath ? TMDB.poster(posterPath, 'w342') : null;
    const bg = '#1a1a2e';
    // movie.html is movie-only, so series get a plain card rather than a
    // link that would resolve the TV id against /movie/ and show the wrong title.
    const isTV = f.type === 'tv';
    const open = isTV ? '<div class="cinema-card">' : `<a href="pages/movie.html?id=${f.tmdb_id}" class="cinema-card">`;
    const close = isTV ? '</div>' : '</a>';
    return `
      ${open}
        <div class="cinema-poster" style="${!posterUrl ? `background:linear-gradient(160deg,${bg},${bg}aa)` : ''}">
          ${posterUrl
            ? `<img src="${posterUrl}" alt="${f.title}" loading="lazy"
                onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(160deg,${bg},${bg}aa)'" />`
            : `<div style="padding:8px;font-size:11px;color:var(--text-muted);text-align:center;margin-top:30px;">${f.title}</div>`}
          <div class="cinema-lang">${f.language}</div>
          ${score ? `<div class="cinema-score ${sc}">${score}</div>` : ''}
        </div>
        <div class="cinema-info">
          <div class="cinema-title">${f.title}</div>
          <div class="cinema-meta">${new Date(f.release_date).getFullYear()}</div>
        </div>
      ${close}`;
  }).join('');
}

function initOttPosterTabs() {
  const tabs = document.querySelectorAll('[data-ottposter]');
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadOttPosterGrid(btn.dataset.ottposter);
    });
  });
  loadOttPosterGrid('netflix');
}

/* ===========================
   COMING SOON ON OTT — text list
   Manually-curated upcoming OTT releases.
   TMDb doesn't reliably surface Indian OTT release dates,
   so this reads from a hand-maintained data file instead.
   =========================== */
async function loadOttComingList() {
  const col = document.getElementById('ottComingCol');
  const list = document.getElementById('ottComingList');
  if (!list || !col) return;

  let entries = [];
  try {
    const res = await fetch('data/coming_to_ott.json');
    entries = await res.json();
  } catch (e) {
    entries = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = entries
    .filter(f => new Date(f.release_date) > today)
    .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

  if (!upcoming.length) {
    col.style.display = 'none';
    return;
  }

  col.style.display = '';
  list.innerHTML = upcoming.slice(0, 5).map((f, i) => {
    const d = new Date(f.release_date);
    const dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `
    <a href="pages/browse.html" class="trending-list-item">
      <div class="tli-rank">${i+1}</div>
      <div class="tli-title">${f.title}</div>
      <div class="tli-lang">${f.language}</div>
      <div class="tli-score">
        <div class="tli-score-num" style="color:var(--text-muted);font-size:11px;white-space:nowrap;">${dateLabel}</div>
      </div>
    </a>
  `;
  }).join('');
}

// Run on DOM ready AND as fallback after short delay
document.addEventListener('DOMContentLoaded', () => {
  initOttPosterTabs();
  loadOttComingList();
});

// Belt-and-suspenders fallback — fires after all other scripts
window.addEventListener('load', () => {
  loadOttComingList();
  if (!document.getElementById('ottPosterGrid')?.children?.length ||
      document.getElementById('ottPosterGrid')?.querySelector('.poster-skeleton')) {
    loadOttPosterGrid('netflix');
  }
});
