/* ===========================
   NAVRAS — Browse Page JS
   Real data from TMDb API
   =========================== */

let currentPage = 1;
let currentFilters = { lang: 'all', genre: 'all', era: 'all', sort: 'popularity.desc' };
let currentSearch = '';
let isLoading = false;
let searchTimeout = null;

/* ---- Language display names ---- */
const langNames = {
  hi: 'Hindi', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
  kn: 'Kannada', bn: 'Bengali', mr: 'Marathi', pa: 'Punjabi', en: 'English'
};

/* ---- Build TMDb discover params ---- */
function buildParams() {
  const params = {
    sort_by: currentFilters.sort,
    include_adult: false,
    'vote_count.gte': 50
  };

  if (currentFilters.lang !== 'all') {
    params.with_original_language = currentFilters.lang;
    // Indian films — exclude if Hollywood selected
    if (currentFilters.lang !== 'en') {
      params.region = 'IN';
    }
  } else {
    // Default: show Indian languages
    params.with_original_language = 'hi|ta|te|ml|kn|mr|bn|pa|gu';
  }

  if (currentFilters.genre !== 'all') {
    params.with_genres = currentFilters.genre;
  }

  if (currentFilters.era !== 'all' && currentFilters.era !== 'classic') {
    const decade = parseInt(currentFilters.era);
    params['primary_release_date.gte'] = `${decade}-01-01`;
    params['primary_release_date.lte'] = `${decade + 9}-12-31`;
  } else if (currentFilters.era === 'classic') {
    params['primary_release_date.lte'] = '1999-12-31';
  }

  return params;
}

/* ---- Render a single film card ---- */
function renderCard(film) {
  const posterUrl = TMDB.poster(film.poster_path, 'w342');
  const score = TMDB.navrasScore(film.vote_average, film.vote_count);
  const scoreColor = TMDB.scoreColor(score);
  const dotClass = TMDB.scoreDotClass(score);
  const rasas = TMDB.rasaFromGenres(film.genre_ids?.map(id => ({ id })) || film.genres || []);
  const lang = film.original_language;
  const langName = langNames[lang] || lang?.toUpperCase() || '';
  const year = film.release_date ? film.release_date.slice(0, 4) : '';
  const isNew = year >= '2024';

  return `
    <a href="movie.html?id=${film.id}" class="browse-card">
      <div class="browse-card-poster">
        ${posterUrl
          ? `<img src="${posterUrl}" alt="${film.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-poster\\'>🎬</div>'" />`
          : `<div class="no-poster">🎬</div>`
        }
        ${langName ? `<div class="bc-lang-badge">${langName}</div>` : ''}
        ${isNew ? `<div class="bc-new-badge">NEW</div>` : ''}
        ${score ? `
          <div class="bc-score-badge">
            <span class="sdot ${dotClass}"></span>
            <span style="color:${scoreColor}">${score}</span>
          </div>` : ''}
      </div>
      <div class="browse-card-info">
        <div class="bc-title">${film.title || film.name || 'Unknown'}</div>
        <div class="bc-meta">${year}${langName ? ' · ' + langName : ''}</div>
        <div class="bc-rasas">${rasas.map(r => `<span class="rtag">${r}</span>`).join('')}</div>
      </div>
    </a>
  `;
}

/* ---- Load films from TMDb ---- */
async function loadFilms(page = 1, append = false) {
  if (isLoading) return;
  isLoading = true;

  const btn = document.getElementById('loadMoreBtn');
  if (btn) btn.disabled = true;

  const grid = document.getElementById('browseGrid');

  if (!append) {
    grid.innerHTML = Array(8).fill('<div class="film-skeleton"></div>').join('');
  }

  const params = buildParams();
  params.page = page;

  const data = await TMDB.discover(params);

  if (!data || !data.results) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;">
        <div class="nr-icon">🎬</div>
        <div class="nr-title">No films found</div>
        <div>Try adjusting your filters</div>
      </div>`;
    isLoading = false;
    return;
  }

  const cards = data.results.map(renderCard).join('');

  if (append) {
    grid.insertAdjacentHTML('beforeend', cards);
  } else {
    grid.innerHTML = cards;
  }

  // Update count
  const count = document.getElementById('brCount');
  if (count && data.total_results) {
    count.textContent = `${data.total_results.toLocaleString()} films`;
  }

  // Update label
  updateBrowseLabel();

  // Show/hide load more
  if (btn) {
    btn.disabled = false;
    btn.style.display = data.page < data.total_pages ? 'inline-block' : 'none';
  }

  isLoading = false;
}

/* ---- Load more ---- */
function loadMoreFilms() {
  currentPage++;
  loadFilms(currentPage, true);
}

/* ---- Search ---- */
async function performSearch(query) {
  if (!query.trim()) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('browseResults').style.display = 'block';
    document.getElementById('bsbClear').style.display = 'none';
    return;
  }

  document.getElementById('bsbClear').style.display = 'block';
  document.getElementById('searchResults').style.display = 'block';
  document.getElementById('browseResults').style.display = 'none';

  const grid = document.getElementById('searchGrid');
  const label = document.getElementById('srLabel');
  label.textContent = `Searching for "${query}"...`;
  grid.innerHTML = Array(6).fill('<div class="film-skeleton"></div>').join('');

  const data = await TMDB.search(query);

  if (!data || !data.results?.length) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;">
        <div class="nr-icon">🔍</div>
        <div class="nr-title">No results for "${query}"</div>
        <div>Try a different spelling or search in English</div>
      </div>`;
    label.textContent = `No results for "${query}"`;
    return;
  }

  const films = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
  label.textContent = `${films.length} results for "${query}"`;
  grid.innerHTML = films.map(renderCard).join('');
}

function clearSearch() {
  document.getElementById('browseSearchInput').value = '';
  document.getElementById('bsbClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('browseResults').style.display = 'block';
}

/* ---- Filter logic ---- */
function initFilters() {
  // Language
  document.querySelectorAll('#langChips .fc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#langChips .fc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.lang = btn.dataset.val;
      currentPage = 1;
      loadFilms(1);
      updateActiveFilters();
    });
  });

  // Rasa/Genre
  document.querySelectorAll('#rasaChips .fc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#rasaChips .fc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.genre = btn.dataset.val;
      currentPage = 1;
      loadFilms(1);
      updateActiveFilters();
    });
  });

  // Era
  document.querySelectorAll('#eraChips .fc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#eraChips .fc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.era = btn.dataset.val;
      currentPage = 1;
      loadFilms(1);
      updateActiveFilters();
    });
  });

  // Sort
  document.querySelectorAll('#sortChips .fc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#sortChips .fc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.sort = btn.dataset.val;
      currentPage = 1;
      loadFilms(1);
      updateActiveFilters();
    });
  });
}

function updateActiveFilters() {
  const parts = [];
  if (currentFilters.lang !== 'all') parts.push(langNames[currentFilters.lang] || currentFilters.lang);
  if (currentFilters.genre !== 'all') {
    const btn = document.querySelector(`#rasaChips .fc[data-val="${currentFilters.genre}"]`);
    if (btn) parts.push(btn.textContent.trim());
  }
  if (currentFilters.era !== 'all') parts.push(currentFilters.era === 'classic' ? 'Classics' : currentFilters.era + 's');

  const bar = document.getElementById('activeFilters');
  const summary = document.getElementById('afSummary');
  if (parts.length) {
    bar.style.display = 'flex';
    summary.textContent = parts.join(' · ');
  } else {
    bar.style.display = 'none';
  }
}

function clearAllFilters() {
  currentFilters = { lang: 'all', genre: 'all', era: 'all', sort: 'popularity.desc' };
  document.querySelectorAll('.fc').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.fc[data-val="all"]').forEach(b => b.classList.add('active'));
  document.querySelector('#sortChips .fc[data-val="popularity.desc"]').classList.add('active');
  document.getElementById('activeFilters').style.display = 'none';
  currentPage = 1;
  loadFilms(1);
}

function updateBrowseLabel() {
  const label = document.getElementById('brLabel');
  if (!label) return;
  const parts = [];
  if (currentFilters.lang !== 'all') parts.push(langNames[currentFilters.lang]);
  else parts.push('Indian');
  if (currentFilters.era !== 'all') parts.push(currentFilters.era === 'classic' ? 'classic' : currentFilters.era + 's');
  parts.push('films');
  const sort = currentFilters.sort;
  if (sort === 'popularity.desc') label.textContent = 'Trending ' + parts.join(' ');
  else if (sort === 'vote_average.desc') label.textContent = 'Top rated ' + parts.join(' ');
  else if (sort === 'release_date.desc') label.textContent = 'Newest ' + parts.join(' ');
  else label.textContent = parts.join(' ').charAt(0).toUpperCase() + parts.join(' ').slice(1);
}

/* ---- Handle URL params (from homepage search) ---- */
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    document.getElementById('browseSearchInput').value = q;
    performSearch(q);
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  handleUrlParams();
  loadFilms(1);

  // Search input
  const input = document.getElementById('browseSearchInput');
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = input.value.trim();
      searchTimeout = setTimeout(() => performSearch(q), 400);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') clearSearch();
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
});
