/* ===========================
   NAVRAS — Main JavaScript
   =========================== */

/* ---- Mood Search Data ---- */
const rasaData = {
  shringara: {
    label: "Top Shringara picks for you",
    prompt: '"romantic but not too cheesy, set in modern India"',
    films: [
      { title: "Dilwale Dulhania Le Jayenge", meta: "Hindi · 1995 · Romance", score: "9.8", color: "#1a0d2e", scoreColor: "#2ECC71" },
      { title: "Jab We Met", meta: "Hindi · 2007 · Romance Comedy", score: "9.2", color: "#0d1a2e", scoreColor: "#2ECC71" },
      { title: "OK Kanmani", meta: "Tamil · 2015 · Romance", score: "9.0", color: "#2e1a0d", scoreColor: "#2ECC71" }
    ]
  },
  hasya: {
    label: "Top Hasya picks — laugh your heart out",
    prompt: '"something funny but smart, makes me forget my day"',
    films: [
      { title: "Stree 2", meta: "Hindi · 2024 · Horror Comedy", score: "9.3", color: "#0d1a2e", scoreColor: "#2ECC71" },
      { title: "3 Idiots", meta: "Hindi · 2009 · Comedy Drama", score: "9.5", color: "#1a2e0d", scoreColor: "#2ECC71" },
      { title: "Golmaal Again", meta: "Hindi · 2017 · Comedy", score: "7.8", color: "#2e0d1a", scoreColor: "#F39C12" }
    ]
  },
  karuna: {
    label: "Top Karuna picks — feel it deeply",
    prompt: '"emotionally heavy but leaves me feeling hopeful"',
    films: [
      { title: "Taare Zameen Par", meta: "Hindi · 2007 · Drama", score: "9.7", color: "#0d2e1a", scoreColor: "#2ECC71" },
      { title: "Drishyam", meta: "Malayalam · 2013 · Drama Thriller", score: "9.4", color: "#1a0d2e", scoreColor: "#2ECC71" },
      { title: "All We Imagine as Light", meta: "Malayalam · 2024 · Drama", score: "9.6", color: "#2e1a0d", scoreColor: "#2ECC71" }
    ]
  },
  veera: {
    label: "Top Veera picks — feel the fire",
    prompt: '"heroic and inspiring, makes me want to conquer the world"',
    films: [
      { title: "Dangal", meta: "Hindi · 2016 · Sports Drama", score: "9.6", color: "#1a2e0d", scoreColor: "#2ECC71" },
      { title: "RRR", meta: "Telugu · 2022 · Action Epic", score: "9.5", color: "#2e0d1a", scoreColor: "#2ECC71" },
      { title: "Kanguva", meta: "Tamil · 2024 · Action", score: "9.1", color: "#1a0d2e", scoreColor: "#2ECC71" }
    ]
  },
  bhayanaka: {
    label: "Top Bhayanaka picks — edge of your seat",
    prompt: '"psychological thrills, not gory, keeps me guessing"',
    films: [
      { title: "IC 814: The Kandahar Hijack", meta: "Hindi · 2024 · Thriller", score: "9.4", color: "#1a1a2e", scoreColor: "#2ECC71" },
      { title: "Drishyam 2", meta: "Malayalam · 2021 · Crime Thriller", score: "9.1", color: "#0d1a2e", scoreColor: "#2ECC71" },
      { title: "Tumbbad", meta: "Hindi · 2018 · Horror", score: "9.3", color: "#2e1a0d", scoreColor: "#2ECC71" }
    ]
  },
  adbhuta: {
    label: "Top Adbhuta picks — blow your mind",
    prompt: '"visually stunning, world-building, nothing like I have seen before"',
    films: [
      { title: "Baahubali 2", meta: "Telugu · 2017 · Epic Fantasy", score: "9.2", color: "#2e1a0d", scoreColor: "#2ECC71" },
      { title: "Kalki 2898-AD", meta: "Telugu · 2024 · Sci-Fi", score: "7.4", color: "#1a0d2e", scoreColor: "#F39C12" },
      { title: "Enthiran", meta: "Tamil · 2010 · Sci-Fi", score: "8.8", color: "#0d2e1a", scoreColor: "#2ECC71" }
    ]
  },
  raudra: {
    label: "Top Raudra picks — raw and intense",
    prompt: '"intense, morally complex, no-holds-barred storytelling"',
    films: [
      { title: "Gangs of Wasseypur", meta: "Hindi · 2012 · Crime Drama", score: "9.4", color: "#2e0d0d", scoreColor: "#2ECC71" },
      { title: "Vikram", meta: "Tamil · 2022 · Action Thriller", score: "9.0", color: "#1a0d2e", scoreColor: "#2ECC71" },
      { title: "Devara: Part 1", meta: "Telugu · 2024 · Action", score: "6.9", color: "#2e1a0d", scoreColor: "#F39C12" }
    ]
  },
  shanta: {
    label: "Top Shanta picks — breathe and feel",
    prompt: '"slow, beautiful, no rush — I want to exhale and just watch"',
    films: [
      { title: "All We Imagine as Light", meta: "Malayalam · 2024 · Drama", score: "9.6", color: "#0d2e1a", scoreColor: "#2ECC71" },
      { title: "Piku", meta: "Hindi · 2015 · Drama", score: "8.9", color: "#1a2e0d", scoreColor: "#2ECC71" },
      { title: "Masaan", meta: "Hindi · 2015 · Drama", score: "9.1", color: "#0d1a2e", scoreColor: "#2ECC71" }
    ]
  },
  bibhatsa: {
    label: "Top Bibhatsa picks — dark and unflinching",
    prompt: '"gritty realism, dark themes, not for the faint-hearted"',
    films: [
      { title: "Tumbbad", meta: "Hindi · 2018 · Horror", score: "9.3", color: "#2e0d0d", scoreColor: "#2ECC71" },
      { title: "Ugly", meta: "Hindi · 2013 · Crime Drama", score: "9.1", color: "#1a1a1a", scoreColor: "#2ECC71" },
      { title: "Article 15", meta: "Hindi · 2019 · Crime Drama", score: "8.8", color: "#0d1a1a", scoreColor: "#2ECC71" }
    ]
  }
};

/* ---- Mood Card Interaction ---- */
function selectMood(rasa) {
  document.querySelectorAll('.mood-card').forEach(card => {
    card.classList.remove('selected');
  });

  const selected = document.querySelector(`.mood-card[data-rasa="${rasa}"]`);
  if (selected) selected.classList.add('selected');

  const data = rasaData[rasa];
  if (!data) return;

  document.getElementById('moodResultsLabel').textContent = data.label;
  document.getElementById('moodPromptText').textContent = 'Tell us more — ' + data.prompt;

  const list = document.getElementById('moodResultList');
  list.innerHTML = data.films.map(f => `
    <a href="pages/movie.html" class="mood-result-item">
      <div class="result-poster" style="background:${f.color};"></div>
      <div class="result-info">
        <div class="result-title">${f.title}</div>
        <div class="result-meta">${f.meta}</div>
      </div>
      <div class="result-score" style="color:${f.scoreColor};">${f.score}</div>
    </a>
  `).join('');
}

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

  /* Mood cards */
  document.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => selectMood(card.dataset.rasa));
  });

  /* Load default mood */
  selectMood('shringara');

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
   OTT EDITORIAL — New on OTT
   =========================== */
const ottData = {
  netflix: [
    { title: "IC 814: The Kandahar Hijack", meta: "Series · Hindi · Thriller", score: 91, color: "#1a1a2e", rasas: ["Bhayanaka","Veera"], isNew: true },
    { title: "Heeramandi", meta: "Series · Hindi · Drama", score: 78, color: "#2e1a0d", rasas: ["Shringara","Karuna"], isNew: false },
    { title: "Scam 2003", meta: "Series · Hindi · Crime", score: 85, color: "#0d1a2e", rasas: ["Raudra","Adbhuta"], isNew: false },
    { title: "All We Imagine as Light", meta: "Film · Malayalam · Drama", score: 96, color: "#0d2e1a", rasas: ["Karuna","Shanta"], isNew: true }
  ],
  prime: [
    { title: "Stree 2", meta: "Film · Hindi · Horror Comedy", score: 87, color: "#1a0d2e", rasas: ["Hasya","Bhayanaka"], isNew: true },
    { title: "Mirzapur S3", meta: "Series · Hindi · Crime", score: 82, color: "#2e0d0d", rasas: ["Raudra","Bhayanaka"], isNew: false },
    { title: "Panchayat S3", meta: "Series · Hindi · Comedy", score: 93, color: "#1a2e0d", rasas: ["Hasya","Shanta"], isNew: false },
    { title: "Farzi", meta: "Series · Hindi · Thriller", score: 88, color: "#0d1a2e", rasas: ["Raudra","Adbhuta"], isNew: false }
  ],
  hotstar: [
    { title: "Anupama", meta: "Series · Hindi · Drama", score: 74, color: "#2e1a0d", rasas: ["Karuna","Shringara"], isNew: false },
    { title: "The Great Indian Kapil Show", meta: "Series · Hindi · Comedy", score: 80, color: "#1a2e0d", rasas: ["Hasya"], isNew: true },
    { title: "Shaitaan", meta: "Film · Hindi · Horror", score: 77, color: "#1a0d0d", rasas: ["Bhayanaka","Raudra"], isNew: false },
    { title: "Kalki 2898-AD", meta: "Film · Telugu · Sci-Fi", score: 74, color: "#1a1a0d", rasas: ["Adbhuta","Veera"], isNew: false }
  ],
  sony: [
    { title: "The Family Man S3", meta: "Series · Hindi · Thriller", score: 91, color: "#0d1a2e", rasas: ["Veera","Bhayanaka"], isNew: true },
    { title: "Aspirants S2", meta: "Series · Hindi · Drama", score: 89, color: "#1a2e1a", rasas: ["Veera","Karuna"], isNew: false },
    { title: "Rocket Boys S2", meta: "Series · Hindi · Drama", score: 87, color: "#0d0d2e", rasas: ["Veera","Adbhuta"], isNew: false },
    { title: "Jamtara S2", meta: "Series · Hindi · Crime", score: 83, color: "#2e0d1a", rasas: ["Raudra","Bibhatsa"], isNew: false }
  ],
  zee5: [
    { title: "Kaala Paani", meta: "Series · Hindi · Thriller", score: 85, color: "#0d1a2e", rasas: ["Bhayanaka","Veera"], isNew: false },
    { title: "Dhoom Dhaam", meta: "Film · Hindi · Comedy", score: 72, color: "#1a2e0d", rasas: ["Hasya","Shringara"], isNew: true },
    { title: "Murder in Mahim", meta: "Series · Hindi · Crime", score: 80, color: "#1a0d0d", rasas: ["Raudra","Bhayanaka"], isNew: false },
    { title: "Bhakshak", meta: "Film · Hindi · Drama", score: 86, color: "#0d0d1a", rasas: ["Raudra","Karuna"], isNew: false }
  ],
  jio: [
    { title: "Thalavara", meta: "Film · Malayalam · Action", score: 79, color: "#1a0d2e", rasas: ["Veera","Raudra"], isNew: true },
    { title: "Singham Again", meta: "Film · Hindi · Action", score: 68, color: "#2e1a0d", rasas: ["Veera","Raudra"], isNew: false },
    { title: "Yudhra", meta: "Film · Hindi · Action", score: 65, color: "#0d1a0d", rasas: ["Veera","Hasya"], isNew: false },
    { title: "Manjummel Boys", meta: "Film · Malayalam · Thriller", score: 91, color: "#0d2e2e", rasas: ["Veera","Bhayanaka"], isNew: false }
  ]
};

function renderOttCards(platform) {
  const grid = document.getElementById('ottCardsGrid');
  if (!grid) return;
  const films = ottData[platform] || [];
  grid.innerHTML = films.map(f => `
    <a href="pages/movie.html" class="ott-film-card">
      <div class="ott-card-poster" style="background:linear-gradient(160deg,${f.color},${f.color}88);">
        ${f.isNew ? '<span class="ott-card-new">NEW</span>' : '<span class="ott-card-new" style="background:var(--ink3);color:var(--text-muted);">AVAILABLE</span>'}
        <span class="ott-card-score">${f.score}<span style="font-size:9px;font-weight:400;color:var(--gold-dim);"> /100</span></span>
      </div>
      <div class="ott-card-info">
        <div class="ott-card-title">${f.title}</div>
        <div class="ott-card-meta">${f.meta}</div>
        <div class="ott-card-rasas">${f.rasas.map(r => `<span class="rtag">${r}</span>`).join('')}</div>
      </div>
    </a>
  `).join('');
}

function initOttTabs() {
  const tabs = document.querySelectorAll('.ott-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderOttCards(tab.dataset.platform);
    });
  });
  renderOttCards('netflix');
}

document.addEventListener('DOMContentLoaded', () => {
  initOttTabs();
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
    const score = TMDB.navrasScore(film.vote_average, film.vote_count);
    const scoreColor = TMDB.scoreColor(score);
    const dotClass = TMDB.scoreDotClass(score);
    const lang = film.original_language;
    const langName = langNames[lang] || lang?.toUpperCase() || '';
    const year = film.release_date ? film.release_date.slice(0,4) : '';
    const rasas = TMDB.rasaFromGenres((film.genre_ids||[]).map(id => ({id})));

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
