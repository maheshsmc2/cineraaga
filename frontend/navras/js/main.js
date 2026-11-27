/* ===========================
   NAVRAS — Main JavaScript
   =========================== */

/* ---- Industry Filter ---- */
function filterIndustry(filter) {
  document.querySelectorAll('.ind-chip').forEach(chip => chip.classList.remove('active'));
  const activeChip = document.querySelector(`.ind-chip[data-filter="${filter}"]`);
  if (activeChip) activeChip.classList.add('active');

  const cards = document.querySelectorAll('.film-card');
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.industry === filter) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ---- Mobile Menu ---- */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

/* ---- Language Switcher ---- */
function setLanguage(btn) {
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {

  /* Industry chips */
  document.querySelectorAll('.ind-chip').forEach(chip => {
    chip.addEventListener('click', () => filterIndustry(chip.dataset.filter));
  });

  /* Hamburger */
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

  /* Language buttons */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn));
  });

  /* Hero search — pressing Enter navigates to browse */
  const heroSearch = document.getElementById('heroSearch');
  if (heroSearch) {
    heroSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter' && heroSearch.value.trim()) {
        window.location.href = `pages/browse.html?q=${encodeURIComponent(heroSearch.value.trim())}`;
      }
    });
  }

});

/* ===========================
   THEME TOGGLE — Light / Dark
   =========================== */
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('toggleIcon');
  const label = document.getElementById('toggleLabel');
  const isDark = !body.classList.toggle("light-mode");

  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
  if (label) label.textContent = isDark ? 'Dark' : 'Light';

  localStorage.setItem('navras-theme', isDark ? 'dark' : 'light'); body.classList.toggle('light-mode', !isDark);
}

function initTheme() {
  const saved = localStorage.getItem('navras-theme');
  const icon = document.getElementById('toggleIcon');
  const label = document.getElementById('toggleLabel');
  // Default is dark — light-mode class switches to light
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    if (icon) icon.textContent = '☀️';
    if (label) label.textContent = 'Light';
  } else {
    document.body.classList.remove('light-mode');
    if (icon) icon.textContent = '🌙';
    if (label) label.textContent = 'Dark';
  }
}

// Run before paint to avoid flash
initTheme();

/* ===========================
   TMDB — Load real posters on homepage
   =========================== */
async function loadHomepagePosters() {
  if (typeof TMDB === 'undefined') return;

  // Load trending Indian films for the film cards grid
  const trending = await TMDB.discover({
    with_original_language: 'hi|ta|te|ml|kn|mr|bn|pa|gu',
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
    page: 1
  });

  if (!trending || !trending.results) return;

  const films = trending.results.slice(0, 8);
  const grid = document.getElementById('filmsGrid');
  if (!grid) return;

  const langNames = { hi:'Hindi', ta:'Tamil', te:'Telugu', ml:'Malayalam', kn:'Kannada', bn:'Bengali', mr:'Marathi', en:'English' };

  grid.innerHTML = films.map(film => {
    const posterUrl = TMDB.poster(film.poster_path, 'w342');
    const score = TMDB.audienceRating(film.vote_average, film.vote_count);
    const scoreColor = TMDB.scoreColor(score);
    const dotClass = TMDB.scoreDotClass(score);
    const lang = film.original_language;
    const langName = langNames[lang] || lang?.toUpperCase() || '';
    const year = film.release_date ? film.release_date.slice(0,4) : '';
    const rasas = TMDB.genreTags((film.genre_ids||[]).map(id => ({id})));

    return `
      <a href="pages/movie.html?id=${film.id}" class="film-card" data-industry="${lang}">
        <div class="film-poster" style="${posterUrl ? '' : 'background:linear-gradient(160deg,#1a0d2e,#3a1060);'}">
          ${posterUrl
            ? `<img src="${posterUrl}" alt="${film.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" loading="lazy" />`
            : ''}
          <span class="film-lang" style="position:relative;z-index:1;">${langName}</span>
          <span class="film-score-badge" style="position:relative;z-index:1;">
            <span class="sdot ${dotClass}"></span>
            <span style="color:${scoreColor}">${score || '?'}</span>
          </span>
        </div>
        <div class="film-info">
          <div class="film-title">${film.title}</div>
          <div class="film-meta">${year}</div>
          <div class="film-rasatags">${rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
        </div>
      </a>
    `;
  }).join('');

  // Fix poster container to be relative
  grid.querySelectorAll('.film-poster').forEach(p => {
    p.style.position = 'relative';
    p.style.overflow = 'hidden';
  });
}

// Run on homepage only
if (document.getElementById('filmsGrid')) {
  document.addEventListener('DOMContentLoaded', loadHomepagePosters);
}
