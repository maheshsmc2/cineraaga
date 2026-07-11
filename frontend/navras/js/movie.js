/* ===========================
   NAVRAS — Movie Page JS
   Fully dynamic — loads from TMDb
   =========================== */

const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/';

const langNames = {
  hi:'Hindi', ta:'Tamil', te:'Telugu', ml:'Malayalam',
  kn:'Kannada', bn:'Bengali', mr:'Marathi', pa:'Punjabi',
  gu:'Gujarati', en:'English', ko:'Korean'
};

const industryNames = {
  hi:'Bollywood', ta:'Kollywood', te:'Tollywood',
  ml:'Mollywood', kn:'Sandalwood', bn:'Bengali Cinema',
  ko:'Korean Cinema', en:'Hollywood'
};

const genreRasaMap = {
  28:['Veera','Raudra'], 12:['Veera','Adbhuta'],
  16:['Hasya','Adbhuta'], 35:['Hasya'],
  80:['Raudra','Bhayanaka'], 99:['Adbhuta'],
  18:['Karuna','Shanta'], 10751:['Shringara','Hasya'],
  14:['Adbhuta','Veera'], 36:['Veera','Karuna'],
  27:['Bhayanaka','Bibhatsa'], 10402:['Shringara'],
  9648:['Bhayanaka','Adbhuta'], 10749:['Shringara','Karuna'],
  878:['Adbhuta','Veera'], 53:['Bhayanaka','Raudra'],
  10752:['Veera','Karuna'], 37:['Veera']
};

function getRasas(genres) {
  const rasas = new Set();
  (genres||[]).forEach(g => {
    (genreRasaMap[g.id]||[]).forEach(r => rasas.add(r));
  });
  return [...rasas].slice(0,3);
}

function navrasScore(avg, count) {
  if (!avg || !count) return null;
  const base = Math.pow(avg/10, 0.7) * 88;
  const vol = Math.min((Math.log10(count+1)/5)*8, 8);
  const desi = 3 + Math.round((avg/10)*1);
  return Math.round(Math.min(base+vol+desi, 99));
}

function scoreClass(s) { return s>=75?'green':s>=55?'amber':'red'; }
function scoreHex(s) { return s>=75?'#1A7A3C':s>=55?'#C47A00':'#C0392B'; }

/* ---- Get film ID from URL ---- */
function getFilmId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/* ---- Fetch from TMDb ---- */
async function tmdbFetch(endpoint, extra='') {
  const url = `${TMDB_BASE}${endpoint}?api_key=${TMDB_KEY}&language=en-US${extra}`;
  const res = await fetch(url);
  return res.json();
}

/* ---- Build the full page ---- */
async function buildMoviePage() {
  const id = getFilmId();
  if (!id) { showFallback(); return; }

  try {
    // Fetch all data in parallel
    const [film, credits, videos, similar] = await Promise.all([
      tmdbFetch(`/movie/${id}`, '&append_to_response=external_ids'),
      tmdbFetch(`/movie/${id}/credits`),
      tmdbFetch(`/movie/${id}/videos`),
      tmdbFetch(`/movie/${id}/similar`)
    ]);

    if (!film || film.success === false) { showFallback(); return; }

    renderPage(film, credits, videos, similar);

  } catch(e) {
    console.error('TMDb error:', e);
    showFallback();
  }
}

function showFallback() {
  document.getElementById('movieLoadingState').style.display = 'none';
  document.getElementById('movieContent').style.display = 'block';
}

/* ---- Render everything ---- */
function renderPage(film, credits, videos, similar) {
  document.getElementById('movieLoadingState').style.display = 'none';
  document.getElementById('movieContent').style.display = 'block';

  const score = navrasScore(film.vote_average, film.vote_count);
  const sc = scoreClass(score);
  const lang = film.original_language;
  const langName = langNames[lang] || lang?.toUpperCase() || '';
  const industry = industryNames[lang] || 'World Cinema';
  const year = (film.release_date||'').slice(0,4);
  const rasas = getRasas(film.genres);
  const posterUrl = film.poster_path ? `${IMG_BASE}w342${film.poster_path}` : null;
  const backdropUrl = film.backdrop_path ? `${IMG_BASE}w1280${film.backdrop_path}` : null;
  const runtime = film.runtime ? `${Math.floor(film.runtime/60)}h ${film.runtime%60}m` : '';
  const director = credits?.crew?.find(c=>c.job==='Director');
  const cast = credits?.cast?.slice(0,8)||[];
  const trailer = videos?.results?.find(v=>v.type==='Trailer'&&v.site==='YouTube');
  const genres = film.genres?.map(g=>g.name).join(' · ') || '';

  // Update page title
  document.title = `${film.title} (${year}) — Navras`;

  // Update breadcrumb
  const bc = document.getElementById('breadcrumbFilm');
  if (bc) bc.textContent = film.title;
  const bcIndustry = document.getElementById('breadcrumbIndustry');
  if (bcIndustry) bcIndustry.textContent = industry;

  // Hero backdrop
  if (backdropUrl) {
    const heroBg = document.getElementById('heroBg');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${backdropUrl}')`;
      heroBg.style.backgroundSize = 'cover';
      heroBg.style.backgroundPosition = 'center top';
    }
  }

  // Poster
  const posterEl = document.getElementById('moviePoster');
  if (posterEl) {
    if (posterUrl) {
      posterEl.innerHTML = `<img src="${posterUrl}" alt="${film.title}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" />`;
    }
    if (trailer) {
      const playBtn = document.getElementById('posterPlay');
      if (playBtn) {
        playBtn.style.display = 'flex';
        playBtn.onclick = () => openTrailer(trailer.key);
      }
    }
  }

  // Title and meta
  setEl('movieTitle', film.title);
  setEl('movieTagline', film.tagline || '');
  setEl('movieMetaLine', [year, genres, runtime, film.adult?'A':'UA'].filter(Boolean).join(' · '));
  setEl('movieDirector', director ? `Directed by ${director.name}` : '');

  // Language / industry badge
  setEl('movieLangBadge', langName);
  setEl('movieIndustryBadge', industry);

  // Navras score
  if (score) {
    const scoreEl = document.getElementById('navrasScoreNum');
    const scoreBadge = document.getElementById('navrasScoreBadge');
    if (scoreEl) scoreEl.textContent = score;
    if (scoreBadge) {
      scoreBadge.className = `navras-score-big ${sc}`;
    }
    // Score bar
    const criticBar = document.getElementById('criticBar');
    const audienceBar = document.getElementById('audienceBar');
    const desiBar = document.getElementById('desiBar');
    const criticNum = document.getElementById('criticNum');
    const audienceNum = document.getElementById('audienceNum');
    const desiNum = document.getElementById('desiNum');

    const criticScore = Math.round(film.vote_average * 10);
    const audienceScore = Math.round(film.vote_average * 9.5);
    const desiScore = Math.round(score * 0.85);

    if (criticBar) criticBar.style.width = criticScore + '%';
    if (audienceBar) audienceBar.style.width = audienceScore + '%';
    if (desiBar) desiBar.style.width = desiScore + '%';
    if (criticNum) criticNum.textContent = Math.round(criticScore/10*4)/4 * 10;
    if (audienceNum) audienceNum.textContent = film.vote_count?.toLocaleString();
    if (desiNum) desiNum.textContent = desiScore;
  }

  // External scores
  setEl('imdbScore', film.vote_average?.toFixed(1));
  setEl('imdbLink', `https://www.imdb.com/title/${film.external_ids?.imdb_id||''}`);

  // Certified hit badge
  if (score >= 85) {
    const hitBadge = document.getElementById('certifiedHit');
    if (hitBadge) hitBadge.style.display = 'inline-block';
  }

  // Rasas
  const rasaContainer = document.getElementById('movieRasas');
  if (rasaContainer) {
    rasaContainer.innerHTML = rasas.map(r =>
      `<a href="mood.html?rasa=${r.toLowerCase()}" class="movie-rasa-tag">
        <span class="rasa-icon">${rasaIcon(r)}</span> ${r} · ${rasaMeaning(r)}
      </a>`
    ).join('');
  }

  // Film details sidebar
  setEl('detailLanguage', langName);
  setEl('detailIndustry', industry);
  setEl('detailRelease', film.release_date ? new Date(film.release_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '');
  setEl('detailRuntime', runtime);
  setEl('detailCert', film.adult ? 'A' : 'UA');
  setEl('detailBudget', film.budget > 0 ? `$${(film.budget/1000000).toFixed(1)}M` : '—');
  setEl('detailRevenue', film.revenue > 0 ? `$${(film.revenue/1000000).toFixed(1)}M` : '—');
  setEl('detailStudio', film.production_companies?.[0]?.name || '—');

  // Cast
  const castGrid = document.getElementById('castGrid');
  if (castGrid && cast.length) {
    castGrid.innerHTML = cast.map(actor => {
      const photo = actor.profile_path ? `${IMG_BASE}w185${actor.profile_path}` : null;
      return `
        <div class="cast-card">
          <div class="cast-photo" style="${!photo?'background:var(--ink3);':''}" >
            ${photo ? `<img src="${photo}" alt="${actor.name}" loading="lazy" />` : `<div class="cast-initial">${actor.name[0]}</div>`}
          </div>
          <div class="cast-name">${actor.name}</div>
          <div class="cast-char">${actor.character||''}</div>
        </div>`;
    }).join('');
  }

  // Crew
  const crew = credits?.crew || [];
  const writers = crew.filter(c=>c.department==='Writing').slice(0,2);
  const dop = crew.find(c=>c.job==='Director of Photography');
  const editor = crew.find(c=>c.job==='Editor');
  const music = crew.find(c=>c.department==='Sound'&&c.job==='Original Music Composer') ||
                crew.find(c=>c.department==='Music');

  setEl('crewDirector', director?.name || '—');
  setEl('crewWriters', writers.map(w=>w.name).join(', ') || '—');
  setEl('crewDOP', dop?.name || '—');
  setEl('crewEditor', editor?.name || '—');
  setEl('crewMusic', music?.name || '—');

  // Similar films
  const similarGrid = document.getElementById('similarGrid');
  if (similarGrid && similar?.results?.length) {
    similarGrid.innerHTML = similar.results.slice(0,6).map(f => {
      const p = f.poster_path ? `${IMG_BASE}w185${f.poster_path}` : null;
      const s = navrasScore(f.vote_average, f.vote_count);
      const yr = (f.release_date||'').slice(0,4);
      return `
        <a href="movie.html?id=${f.id}" class="similar-card">
          <div class="similar-poster" style="${!p?'background:var(--ink3);':''}">
            ${p?`<img src="${p}" alt="${f.title}" loading="lazy" />`:''}
            ${s?`<div class="similar-score ${scoreClass(s)}">${s}</div>`:''}
          </div>
          <div class="similar-title">${f.title||f.name}</div>
          <div class="similar-year">${yr}</div>
        </a>`;
    }).join('');
  }

  // Desi score bars animation
  setTimeout(animateBars, 300);
}

/* ---- Helpers ---- */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.textContent = val;
}

function rasaIcon(r) {
  const icons = {
    Shringara:'♡', Hasya:'☺', Karuna:'◇', Veera:'◈',
    Bhayanaka:'◉', Adbhuta:'✦', Raudra:'△', Shanta:'〇', Bibhatsa:'▣'
  };
  return icons[r] || '·';
}

function rasaMeaning(r) {
  const m = {
    Shringara:'Love', Hasya:'Joy', Karuna:'Sorrow', Veera:'Courage',
    Bhayanaka:'Fear', Adbhuta:'Wonder', Raudra:'Anger', Shanta:'Peace', Bibhatsa:'Dark'
  };
  return m[r] || '';
}

function openTrailer(key) {
  const modal = document.getElementById('trailerModal');
  const iframe = document.getElementById('trailerIframe');
  if (modal && iframe) {
    iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
    modal.style.display = 'flex';
  }
}

function closeTrailer() {
  const modal = document.getElementById('trailerModal');
  const iframe = document.getElementById('trailerIframe');
  if (modal) modal.style.display = 'none';
  if (iframe) iframe.src = '';
}

/* ---- Watchlist ---- */
let inWatchlist = false;
function toggleWatchlist() {
  inWatchlist = !inWatchlist;
  const btn = document.getElementById('watchlistBtn');
  if (btn) {
    btn.textContent = inWatchlist ? '✓ In Watchlist' : '+ Watchlist';
    btn.style.background = inWatchlist ? 'transparent' : 'var(--gold)';
    btn.style.color = inWatchlist ? 'var(--gold)' : 'var(--ink)';
  }
}

/* ---- Share ---- */
function shareFilm() {
  if (navigator.share) {
    navigator.share({ title: document.title, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  }
}

/* ---- Animate desi bars ---- */
function animateBars() {
  document.querySelectorAll('.desi-bar-fill').forEach(bar => {
    const w = bar.getAttribute('data-width') || bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = w; }, 100);
  });
}

/* ---- Rating flow ---- */
let selectedRasa = null;
let selectedStars = 0;

function initRating() {
  document.querySelectorAll('.rate-rasa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rate-rasa-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRasa = btn.dataset.rasa;
      const wrap = document.getElementById('starRatingWrap');
      const lbl = document.getElementById('starRatingLabel');
      if (wrap) wrap.style.display = 'block';
      if (lbl) lbl.textContent = `You felt ${selectedRasa} — now rate it`;
    });
  });

  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('mouseover', () => {
      const val = parseInt(btn.dataset.val);
      document.querySelectorAll('.star-btn').forEach(s => {
        s.classList.toggle('lit', parseInt(s.dataset.val) <= val);
      });
    });
    btn.addEventListener('click', () => {
      selectedStars = parseInt(btn.dataset.val);
      document.querySelectorAll('.star-btn').forEach(s => {
        s.classList.toggle('lit', parseInt(s.dataset.val) <= selectedStars);
      });
      const sub = document.getElementById('submitRatingBtn');
      if (sub) sub.style.display = 'inline-block';
    });
  });
}

function submitRating() {
  const wrap = document.getElementById('starRatingWrap');
  const success = document.getElementById('ratingSuccess');
  const grid = document.getElementById('rateRasaGrid');
  if (wrap) wrap.style.display = 'none';
  if (grid) grid.style.display = 'none';
  if (success) success.style.display = 'block';
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  buildMoviePage();
  initRating();

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // Close trailer on click outside
  const modal = document.getElementById('trailerModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeTrailer();
    });
  }
});
