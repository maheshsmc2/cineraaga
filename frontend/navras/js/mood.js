/* ===========================
   CineRaaga — Mood Page JS

   Shows every film CineRaaga covers (the ranked lists and the reviews),
   grouped by rasa.

   Where a film's rasas come from, in order:
     1. data/reviews.json  — the editor's own rasas for a reviewed film
     2. data/rasa-films.json — placements for listed films. While its status
        is not "approved" they are suggestions, and the page says so.

   No scores are shown except a real Navras Score from a published review.
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
const PAGE_SIZE = 24;

const ERAS = {
  '2020s': y => y >= 2020,
  '2010s': y => y >= 2010 && y < 2020,
  '2000s': y => y >= 2000 && y < 2010,
  '1990s': y => y >= 1990 && y < 2000,
  'classic': y => y < 1990
};

let filmsByRasa = {};
let placementsApproved = false;
let loading = null;
let currentRasa = null;
let sortBy = 'match';
let shown = PAGE_SIZE;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const getJson = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);

function loadMoodData() {
  if (loading) return loading;
  loading = (async () => {
    const [index, placements, reviews, db] = await Promise.all([
      getJson('../data/lists/index.json'), getJson('../data/rasa-films.json'),
      getJson('../data/reviews.json'), loadFilmDb('../')
    ]);
    if (!index || !placements) { loading = null; throw new Error('mood data unavailable'); }
    const lists = await Promise.all(index.map(e => getJson(`../data/lists/${e.slug}.json`)));
    placementsApproved = placements.status === 'approved';

    const films = new Map();
    const add = (title, year, language) => {
      const key = `${title}|${year}|${language}`;
      if (!films.has(key)) {
        const rec = db[key] || {};
        films.set(key, { key, title, year, language, tmdbId: rec.tmdb_id || null,
          poster: rec.poster_path || null, lists: 0, bestRank: 999, review: null, rasas: [] });
      }
      return films.get(key);
    };

    lists.filter(Boolean).forEach(list => (list.entries || []).forEach(e => {
      const f = add(e.film.title, e.film.year, e.film.language);
      f.lists += 1;
      f.bestRank = Math.min(f.bestRank, e.rank || 999);
      f.tmdbId = e.film.tmdb_id || f.tmdbId;
    }));
    films.forEach(f => { f.rasas = placements.films[f.key] || []; });

    (reviews || []).forEach(r => {
      const f = [...films.values()].find(x => x.tmdbId === r.tmdb_id)
        || add(r.title, r.year, r.language.toLowerCase());
      f.review = r;
      f.tmdbId = r.tmdb_id;
      if ((r.rasas || []).length) f.rasas = r.rasas;
    });

    rasaList.forEach(rasa => {
      filmsByRasa[rasa] = [...films.values()].filter(f => f.rasas.includes(rasa));
      const count = document.querySelector(`.rasa-face-card[data-rasa="${rasa}"] .rfc-face-count`);
      const n = filmsByRasa[rasa].length;
      if (count) count.textContent = `${n} film${n === 1 ? '' : 's'}`;
    });
  })();
  return loading;
}

/* Strongest first: films where this is the main rasa, reviewed ones ahead,
   then those in more lists and ranked higher. */
function byMatch(rasa) {
  return (a, b) => a.rasas.indexOf(rasa) - b.rasas.indexOf(rasa)
    || Boolean(b.review) - Boolean(a.review)
    || b.lists - a.lists
    || a.bestRank - b.bestRank
    || a.title.localeCompare(b.title);
}

function filtered() {
  const lang = document.getElementById('langFilter').value;
  const era = document.getElementById('eraFilter').value;
  const list = (filmsByRasa[currentRasa] || []).filter(f =>
    (lang === 'all' || f.language === lang) && (era === 'all' || ERAS[era](f.year)));
  const order = {
    match: byMatch(currentRasa),
    newest: (a, b) => b.year - a.year || byMatch(currentRasa)(a, b),
    oldest: (a, b) => a.year - b.year || byMatch(currentRasa)(a, b)
  };
  return list.sort(order[sortBy]);
}

function filmCard(f) {
  const href = f.review ? `${encodeURIComponent(f.review.slug)}.html`
    : f.tmdbId ? `movie.html?id=${f.tmdbId}` : null;
  const art = f.poster
    ? `<img src="https://image.tmdb.org/t/p/w342${esc(f.poster)}" alt="" loading="lazy" onerror="this.remove()" />` : '';
  const score = f.review
    ? `<span class="mood-score ${esc(f.review.score_class)}">${f.review.navras_score} Navras</span>` : '';
  return `
    <${href ? `a href="${href}"` : 'div'} class="film-card">
      <div class="film-poster mood-poster">
        ${art}
        <span class="film-lang">${esc(cap(f.language))}</span>
        ${score}
      </div>
      <div class="film-info">
        <div class="film-title">${esc(f.title)}</div>
        <div class="film-meta">${f.year}${f.review ? ' · Reviewed' : ''}</div>
        <div class="film-rasatags">${f.rasas.map(r => `<span class="rtag">${esc(cap(r))}</span>`).join('')}</div>
      </div>
    </${href ? 'a' : 'div'}>`;
}

function render() {
  const all = filtered();
  const grid = document.getElementById('mrpFilmsGrid');
  const info = rasaInfo[currentRasa];
  document.getElementById('mrpGridLabel').textContent =
    `${all.length} ${info.name} film${all.length === 1 ? '' : 's'}`;
  grid.innerHTML = all.length
    ? all.slice(0, shown).map(filmCard).join('')
    : '<p class="mood-none">No films match these filters.</p>';
  document.getElementById('loadMoreBtn').style.display = all.length > shown ? 'block' : 'none';
}

async function selectRasa(rasa, el) {
  if (!rasaInfo[rasa]) return;
  try { await loadMoodData(); } catch (e) { return; }

  currentRasa = rasa;
  shown = PAGE_SIZE;

  document.querySelectorAll('.rasa-face-card').forEach(c => c.classList.toggle('active', c.dataset.rasa === rasa));
  document.getElementById('rasasFullGrid').style.display = 'none';
  document.getElementById('moodResultsPanel').style.display = 'block';
  document.getElementById('rasaPhilosophy').style.display = 'none';

  const info = rasaInfo[rasa];
  document.getElementById('mrpTitle').textContent = `${info.icon} ${info.name} · ${info.meaning}`;
  document.getElementById('mrpNote').hidden = placementsApproved;

  /* offer only the languages this rasa actually has */
  const select = document.getElementById('langFilter');
  const languages = [...new Set(filmsByRasa[rasa].map(f => f.language))].sort();
  select.innerHTML = '<option value="all">All languages</option>'
    + languages.map(l => `<option value="${esc(l)}">${esc(cap(l))}</option>`).join('');
  document.getElementById('eraFilter').value = 'all';

  render();
  history.replaceState(null, '', `?rasa=${rasa}`);
  document.getElementById('moodResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearRasa() {
  currentRasa = null;
  document.querySelectorAll('.rasa-face-card').forEach(c => c.classList.remove('active'));
  document.getElementById('rasasFullGrid').style.display = 'grid';
  document.getElementById('moodResultsPanel').style.display = 'none';
  document.getElementById('rasaPhilosophy').style.display = 'block';
  history.replaceState(null, '', location.pathname);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyFilters() {
  if (!currentRasa) return;
  shown = PAGE_SIZE;
  render();
}

function loadMore() {
  shown += PAGE_SIZE;
  render();
}

function sortResults(by, button) {
  sortBy = by;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b === button));
  applyFilters();
}

/* A single mood word opens that rasa; anything longer goes to the full search. */
function searchByPrompt() {
  const input = document.getElementById('moodPromptInput').value.trim();
  if (!input) return;
  const words = {
    hasya: /^(funny|laugh|comedy|happy|light)$/, karuna: /^(sad|cry|emotional|moving)$/,
    veera: /^(courage|hero|inspiring|brave)$/, bhayanaka: /^(scary|fear|horror|suspense|tense)$/,
    adbhuta: /^(wonder|fantasy|spectacle)$/, raudra: /^(angry|anger|rage|intense)$/,
    shanta: /^(calm|peace|peaceful|quiet|relax)$/, bibhatsa: /^(dark|gritty|disturbing)$/,
    shringara: /^(love|romance|romantic)$/
  };
  const rasa = rasaList.find(r => r === input.toLowerCase() || words[r].test(input.toLowerCase()));
  if (rasa) selectRasa(rasa);
  else window.location.href = `search.html?q=${encodeURIComponent(input)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('moodPromptInput');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') searchByPrompt(); });

  const requested = new URLSearchParams(location.search).get('rasa');
  if (requested && rasaInfo[requested]) selectRasa(requested);
  else loadMoodData().catch(() => {});
});
