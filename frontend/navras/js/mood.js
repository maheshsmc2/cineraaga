/* ===========================
   NAVRAS — Mood Page JS
   =========================== */

const rasaInfo = {
  shringara: { name: "Shringara", meaning: "Love · Romance · Beauty", icon: "♡" },
  hasya:     { name: "Hasya",     meaning: "Joy · Laughter · Comedy",   icon: "☺" },
  karuna:    { name: "Karuna",    meaning: "Sorrow · Compassion",        icon: "◇" },
  veera:     { name: "Veera",     meaning: "Courage · Heroism",          icon: "◈" },
  bhayanaka: { name: "Bhayanaka", meaning: "Fear · Suspense",            icon: "◉" },
  adbhuta:   { name: "Adbhuta",   meaning: "Wonder · Fantasy",           icon: "✦" },
  raudra:    { name: "Raudra",    meaning: "Anger · Intensity",          icon: "△" },
  shanta:    { name: "Shanta",    meaning: "Peace · Serenity",           icon: "〇" },
  bibhatsa:  { name: "Bibhatsa",  meaning: "Dark · Gritty",              icon: "▣" }
};

const rasaList = Object.keys(rasaInfo);

/* ---- Data store — loaded from data/mood/*.json, never hand-typed ---- */
let filmDatabase = {};
let dataLoaded = false;

async function loadMoodData() {
  const results = await Promise.all(
    rasaList.map(r => fetch(`../data/mood/${r}.json`).then(res => res.json()).catch(() => ({ rasa: r, films: [] })))
  );
  results.forEach(d => {
    const films = d.films || [];
    filmDatabase[d.rasa] = films;
    const countEl = document.querySelector(`.rasa-face-card[data-rasa="${d.rasa}"] .rfc-face-count`);
    if (countEl) countEl.textContent = `${films.length} film${films.length === 1 ? '' : 's'}`;
  });
  dataLoaded = true;
}

let currentRasa = null;
let currentFilms = [];
let displayedCount = 6;

async function selectRasa(rasa, el) {
  if (!dataLoaded) await loadMoodData();

  currentRasa = rasa;
  displayedCount = 6;

  // Update card states
  document.querySelectorAll('.rasa-face-card, .rasa-full-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  // Hide grid, show results
  const grid = document.getElementById('rasasFullGrid');
  if (grid) grid.style.display = 'none';
  document.getElementById('moodResultsPanel').style.display = 'block';
  document.getElementById('rasaPhilosophy').style.display = 'none';

  const info = rasaInfo[rasa];
  document.getElementById('mrpTitle').textContent = `${info.icon} ${info.name} · ${info.meaning}`;
  document.getElementById('mrpGridLabel').textContent = `All ${info.name} films`;

  currentFilms = [...(filmDatabase[rasa] || [])];
  renderFeatured(currentFilms[0]);
  renderFilms(currentFilms.slice(1, displayedCount + 1));

  document.getElementById('moodResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearRasa() {
  currentRasa = null;
  document.querySelectorAll('.rasa-face-card, .rasa-full-card').forEach(c => c.classList.remove('active'));
  const grid = document.getElementById('rasasFullGrid');
  if (grid) grid.style.display = 'grid';
  document.getElementById('moodResultsPanel').style.display = 'none';
  document.getElementById('rasaPhilosophy').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- Score display rule: only score_status:"official" films show a
   Navras Score badge. Every curated film today is "placeholder", so
   no badge renders yet — that's expected, not a bug. ---- */
function langLabel(lang) {
  return lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : '';
}

function ottLabel(ott) {
  const platform = (ott || [])[0]?.platform;
  return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : '';
}

function renderFeatured(film) {
  if (!film) return;
  const container = document.getElementById('mrpFeatured');
  const showScore = film.score_status === 'official';
  const scoreColor = film.navras_score >= 85 ? '#2ECC71' : film.navras_score >= 70 ? '#F39C12' : '#E74C3C';
  container.innerHTML = `
    <div class="featured-pick-card">
      <div class="fp-poster" style="background:linear-gradient(160deg,${film.color},${film.color}88);"></div>
      <div class="fp-info">
        <div class="fp-badge">✦ Top Navras Pick</div>
        <div class="fp-title">${film.title}</div>
        <div class="fp-meta">${langLabel(film.language)} · ${film.year} · ${(film.rasas||[]).join(' · ')}</div>
        <div class="fp-verdict">${film.verdict || ''}</div>
        <div class="fp-bottom">
          ${showScore ? `<div class="fp-score" style="color:${scoreColor};">${film.navras_score}<span>/100 Navras</span></div>` : ''}
          <a href="movie.html" class="fp-watch-btn">View full review →</a>
          ${ottLabel(film.ott) ? `<span class="navras-score-pill" style="font-size:11px;">${ottLabel(film.ott)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderFilms(films) {
  const grid = document.getElementById('mrpFilmsGrid');
  grid.innerHTML = films.map(f => {
    const showScore = f.score_status === 'official';
    const dotClass = f.navras_score >= 85 ? 'green' : f.navras_score >= 70 ? 'amber' : 'red';
    return `
      <a href="movie.html" class="film-card">
        <div class="film-poster" style="background:linear-gradient(160deg,${f.color},${f.color}88);">
          <span class="film-lang">${langLabel(f.language)}</span>
          ${showScore ? `<span class="film-score-badge"><span class="sdot ${dotClass}"></span>${f.navras_score}</span>` : ''}
        </div>
        <div class="film-info">
          <div class="film-title">${f.title}</div>
          <div class="film-meta">${f.year} · ${(f.rasas||[])[0] || ''}</div>
          <div class="film-rasatags">${(f.rasas||[]).map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
        </div>
      </a>
    `;
  }).join('');

  // Show/hide load more
  const allFilms = filmDatabase[currentRasa] || [];
  document.getElementById('loadMoreBtn').style.display =
    displayedCount + 1 >= allFilms.length ? 'none' : 'block';
}

function loadMore() {
  displayedCount += 4;
  applyFilters();
}

function applyFilters() {
  if (!currentRasa) return;
  const lang = document.getElementById('langFilter').value;
  const ott = document.getElementById('ottFilter').value;
  const era = document.getElementById('eraFilter').value;

  let filtered = [...(filmDatabase[currentRasa] || [])];

  if (lang !== 'all') filtered = filtered.filter(f => f.language === lang);
  if (ott !== 'all') filtered = filtered.filter(f => (f.ott || []).some(o => o.platform === ott));
  if (era !== 'all') filtered = filtered.filter(f => f.era === era);

  currentFilms = filtered;
  if (filtered.length > 0) {
    renderFeatured(filtered[0]);
    renderFilms(filtered.slice(1, displayedCount + 1));
  } else {
    document.getElementById('mrpFeatured').innerHTML = `
      <div style="padding:20px;color:var(--text-muted);font-size:14px;">
        No films found with these filters. Try adjusting.
      </div>`;
    document.getElementById('mrpFilmsGrid').innerHTML = '';
  }
}

function sortResults(by) {
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  if (by === 'navras') currentFilms.sort((a,b) => b.navras_score - a.navras_score);
  else if (by === 'year') currentFilms.sort((a,b) => b.year - a.year);
  else if (by === 'popular') currentFilms.sort((a,b) => b.navras_score - a.navras_score);

  renderFeatured(currentFilms[0]);
  renderFilms(currentFilms.slice(1, displayedCount + 1));
}

async function searchByPrompt() {
  const input = document.getElementById('moodPromptInput').value.trim();
  if (!input) return;
  if (!dataLoaded) await loadMoodData();

  // For now highlight the most relevant rasa based on keywords
  const keywords = input.toLowerCase();
  let rasa = 'shringara';
  if (keywords.match(/funny|laugh|comedy|light/)) rasa = 'hasya';
  else if (keywords.match(/sad|cry|emotional|feel|moving/)) rasa = 'karuna';
  else if (keywords.match(/action|hero|inspire|pump|courage/)) rasa = 'veera';
  else if (keywords.match(/scary|thriller|suspense|horror|tense/)) rasa = 'bhayanaka';
  else if (keywords.match(/fantasy|wonder|mind.blown|visual|spectacle/)) rasa = 'adbhuta';
  else if (keywords.match(/dark|gritty|intense|raw|angry/)) rasa = 'raudra';
  else if (keywords.match(/calm|peace|slow|quiet|relax/)) rasa = 'shanta';
  else if (keywords.match(/disturbing|unsettling|real|brutal/)) rasa = 'bibhatsa';
  else if (keywords.match(/love|romance|romantic|heart/)) rasa = 'shringara';

  const card = document.querySelector(`.rasa-full-card[data-rasa="${rasa}"]`);
  selectRasa(rasa, card);
}

document.addEventListener('DOMContentLoaded', () => {
  loadMoodData();

  // Enter key on prompt
  const input = document.getElementById('moodPromptInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchByPrompt();
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
});
