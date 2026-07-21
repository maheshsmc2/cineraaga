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

function scoreClass(s) { return s >= 75 ? 'green' : s >= 55 ? 'amber' : 'red'; }
function scoreColorHex(s) { return s >= 75 ? '#2ECC71' : s >= 55 ? '#F39C12' : '#E74C3C'; }

/* ---- Render poster card ---- */
function renderCinemaCard(film, type) {
  const isTV = type === 'tv';
  const title = isTV ? (film.name||film.original_name) : (film.title||film.original_title);
  const posterUrl = film.poster_path ? TMDB.poster(film.poster_path, 'w342') : null;
  const score = TMDB.audienceRating(film.vote_average, film.vote_count);
  const lang = film.original_language;
  const langName = langNames[lang] || (lang ? lang.toUpperCase() : '');
  const year = (film.release_date||film.first_air_date||'').slice(0,4);
  const rasas = TMDB.genreTags((film.genre_ids||[]).map(id=>({id})));
  const sc = scoreClass(score);

  return `
    <a href="pages/movie.html?id=${film.id}" class="cinema-card">
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

/* ---- OTT local data ---- */
const ottFilms = {
  netflix: [
    { title:"IC 814: The Kandahar Hijack", year:2024, lang:"Hindi", score:91, color:"#1a1a2e", platform:"Netflix", tmdbId:242074 },
    { title:"All We Imagine as Light", year:2024, lang:"Malayalam", score:96, color:"#0d2e1a", platform:"Netflix", tmdbId:1017336 },
    { title:"Tumbbad", year:2018, lang:"Hindi", score:94, color:"#2e0d0d", platform:"Netflix", tmdbId:520110 },
    { title:"RRR", year:2022, lang:"Telugu", score:95, color:"#2e0d1a", platform:"Netflix", tmdbId:759244 },
    { title:"3 Idiots", year:2009, lang:"Hindi", score:95, color:"#1a2e0d", platform:"Netflix", tmdbId:20453 },
    { title:"Dangal", year:2016, lang:"Hindi", score:96, color:"#0a2010", platform:"Netflix", tmdbId:363676 },
    { title:"Drishyam 2", year:2021, lang:"Malayalam", score:91, color:"#0d1a2e", platform:"Netflix", tmdbId:933131 },
    { title:"Squid Game S2", year:2024, lang:"Korean", score:92, color:"#0a0a1e", platform:"Netflix", tmdbId:93405 }
  ],
  prime: [
    { title:"Panchayat S3", year:2024, lang:"Hindi", score:93, color:"#1a2e0d", platform:"Prime Video", tmdbId:101352, type:"tv" },
    { title:"Andhadhun", year:2018, lang:"Hindi", score:94, color:"#1a1a1a", platform:"Prime Video", tmdbId:534780 },
    { title:"Drishyam 2", year:2021, lang:"Malayalam", score:91, color:"#0d1a2e", platform:"Prime Video", tmdbId:933131 },
    { title:"Manjummel Boys", year:2024, lang:"Malayalam", score:91, color:"#0d2e2e", platform:"Prime Video", tmdbId:1186532 },
    { title:"Jawan", year:2023, lang:"Hindi", score:82, color:"#2e1a0d", platform:"Prime Video", tmdbId:1086747 },
    { title:"KGF Chapter 2", year:2022, lang:"Kannada", score:89, color:"#2e2a0a", platform:"Prime Video", tmdbId:763215 },
    { title:"Vikram", year:2022, lang:"Tamil", score:88, color:"#0a1a2e", platform:"Prime Video", tmdbId:824055 },
    { title:"Pushpa: The Rise", year:2021, lang:"Telugu", score:84, color:"#2e1a00", platform:"Prime Video", tmdbId:877703 }
  ],
  hotstar: [
    { title:"Kalki 2898-AD", year:2024, lang:"Telugu", score:74, color:"#1a1a0d", platform:"Hotstar", tmdbId:1064213 },
    { title:"Shaitaan", year:2024, lang:"Hindi", score:77, color:"#1a0d0d", platform:"Hotstar", tmdbId:1172034 },
    { title:"Devara", year:2024, lang:"Telugu", score:72, color:"#2e2e0d", platform:"Hotstar", tmdbId:1087822 },
    { title:"Baahubali 2", year:2017, lang:"Telugu", score:92, color:"#2e1a0a", platform:"Hotstar", tmdbId:346364 },
    { title:"Pushpa 2", year:2024, lang:"Telugu", score:85, color:"#2e1a00", platform:"Hotstar", tmdbId:1241982 },
    { title:"Article 370", year:2024, lang:"Hindi", score:83, color:"#1a2e2e", platform:"Hotstar", tmdbId:1172613 },
    { title:"Stree 2", year:2024, lang:"Hindi", score:87, color:"#1a0d2e", platform:"Hotstar", tmdbId:1100782 },
    { title:"Munjya", year:2024, lang:"Hindi", score:79, color:"#0d1a1a", platform:"Hotstar", tmdbId:1227139 }
  ],
  sony: [
    { title:"Scam 1992", year:2020, lang:"Hindi", score:97, color:"#2e2e0d", platform:"SonyLIV", tmdbId:113855 },
    { title:"The Family Man", year:2019, lang:"Hindi", score:94, color:"#0d1a1a", platform:"SonyLIV", tmdbId:95557 },
    { title:"Aspirants", year:2021, lang:"Hindi", score:89, color:"#1a2e1a", platform:"SonyLIV", tmdbId:112130 },
    { title:"Rocket Boys", year:2022, lang:"Hindi", score:87, color:"#0d0d2e", platform:"SonyLIV", tmdbId:120168 },
    { title:"Farzi", year:2023, lang:"Hindi", score:86, color:"#2e0d1a", platform:"SonyLIV", tmdbId:209764 },
    { title:"Paatal Lok", year:2020, lang:"Hindi", score:93, color:"#1a0d2e", platform:"SonyLIV", tmdbId:125925 },
    { title:"Undekhi", year:2020, lang:"Hindi", score:84, color:"#2e1a0a", platform:"SonyLIV", tmdbId:113988 },
    { title:"Tabbar", year:2021, lang:"Hindi", score:88, color:"#0a1a0a", platform:"SonyLIV", tmdbId:173560 }
  ],
  zee5: [
    { title:"Kaala Paani", year:2023, lang:"Hindi", score:85, color:"#0d1a2e", platform:"ZEE5", tmdbId:229268 },
    { title:"Bhakshak", year:2024, lang:"Hindi", score:86, color:"#0d0d1a", platform:"ZEE5", tmdbId:1156452 },
    { title:"Murder in Mahim", year:2024, lang:"Hindi", score:80, color:"#1a0d0d", platform:"ZEE5", tmdbId:245786 },
    { title:"Dhoom Dhaam", year:2025, lang:"Hindi", score:72, color:"#1a2e0d", platform:"ZEE5", tmdbId:1299065 },
    { title:"Raktanchal", year:2020, lang:"Hindi", score:83, color:"#2e0d0d", platform:"ZEE5", tmdbId:108978 },
    { title:"Gullak", year:2019, lang:"Hindi", score:91, color:"#2e2a0d", platform:"ZEE5", tmdbId:91649 },
    { title:"Sunflower", year:2021, lang:"Hindi", score:82, color:"#2e2e0a", platform:"ZEE5", tmdbId:130393 },
    { title:"Grahan", year:2021, lang:"Hindi", score:85, color:"#0a0a1a", platform:"ZEE5", tmdbId:136680 }
  ]
};

const ottSeries = {
  netflix: [
    { title:"IC 814: The Kandahar Hijack", year:2024, lang:"Hindi", score:91, color:"#1a1a2e", platform:"Netflix", tmdbId:242074, type:'tv' },
    { title:"Squid Game S2", year:2024, lang:"Korean", score:92, color:"#0a0a1e", platform:"Netflix", tmdbId:93405, type:'tv' },
    { title:"Sacred Games", year:2018, lang:"Hindi", score:93, color:"#1a0d0d", platform:"Netflix", tmdbId:78387, type:'tv' },
    { title:"Delhi Crime", year:2019, lang:"Hindi", score:89, color:"#0d1a2e", platform:"Netflix", tmdbId:89187, type:'tv' },
    { title:"Mismatched", year:2020, lang:"Hindi", score:82, color:"#1a0d2e", platform:"Netflix", tmdbId:106968, type:'tv' }
  ],
  prime: [
    { title:"Panchayat S3", year:2024, lang:"Hindi", score:93, color:"#1a2e0d", platform:"Prime Video", tmdbId:94954, type:'tv' },
    { title:"Mirzapur S3", year:2024, lang:"Hindi", score:88, color:"#2e1a0d", platform:"Prime Video", tmdbId:99966, type:'tv' },
    { title:"The Family Man S2", year:2021, lang:"Hindi", score:94, color:"#0d1a1a", platform:"Prime Video", tmdbId:95557, type:'tv' },
    { title:"Four More Shots Please!", year:2019, lang:"Hindi", score:80, color:"#2e0d1a", platform:"Prime Video", tmdbId:83867, type:'tv' },
    { title:"Bandish Bandits", year:2020, lang:"Hindi", score:88, color:"#1a2e2e", platform:"Prime Video", tmdbId:110491, type:'tv' }
  ],
  hotstar: [
    { title:"Aarya S3", year:2023, lang:"Hindi", score:86, color:"#1a0d2e", platform:"Hotstar", tmdbId:94605, type:'tv' },
    { title:"Human", year:2022, lang:"Hindi", score:84, color:"#0d1a2e", platform:"Hotstar", tmdbId:131808, type:'tv' },
    { title:"Rudra", year:2022, lang:"Hindi", score:83, color:"#2e0d0d", platform:"Hotstar", tmdbId:131616, type:'tv' },
    { title:"Dil Dosti Dilemma", year:2024, lang:"Hindi", score:81, color:"#1a2e0d", platform:"Hotstar", tmdbId:242074, type:'tv' },
    { title:"Criminal Justice", year:2019, lang:"Hindi", score:87, color:"#0d0d2e", platform:"Hotstar", tmdbId:88478, type:'tv' }
  ],
  sony: [
    { title:"Scam 1992", year:2020, lang:"Hindi", score:97, color:"#2e2e0d", platform:"SonyLIV", tmdbId:113855, type:'tv' },
    { title:"Aspirants", year:2021, lang:"Hindi", score:89, color:"#1a2e1a", platform:"SonyLIV", tmdbId:112130, type:'tv' },
    { title:"Rocket Boys S2", year:2023, lang:"Hindi", score:87, color:"#0d0d2e", platform:"SonyLIV", tmdbId:120168, type:'tv' },
    { title:"Farzi", year:2023, lang:"Hindi", score:86, color:"#2e0d1a", platform:"SonyLIV", tmdbId:209764, type:'tv' },
    { title:"Paatal Lok S2", year:2024, lang:"Hindi", score:91, color:"#1a0d2e", platform:"SonyLIV", tmdbId:125925, type:'tv' }
  ],
  zee5: [
    { title:"Kaala Paani", year:2023, lang:"Hindi", score:85, color:"#0d1a2e", platform:"ZEE5", tmdbId:229268, type:'tv' },
    { title:"Raktanchal", year:2020, lang:"Hindi", score:83, color:"#2e0d0d", platform:"ZEE5", tmdbId:108978, type:'tv' },
    { title:"Gullak S4", year:2024, lang:"Hindi", score:91, color:"#2e2a0d", platform:"ZEE5", tmdbId:91649, type:'tv' },
    { title:"Sunflower S2", year:2023, lang:"Hindi", score:82, color:"#2e2e0a", platform:"ZEE5", tmdbId:130393, type:'tv' },
    { title:"Grahan", year:2021, lang:"Hindi", score:85, color:"#0a0a1a", platform:"ZEE5", tmdbId:136680, type:'tv' }
  ]
};


/* ---- Rankings data ---- */
const rankingsData = {
  top:[
    {rank:1,title:"Mughal-E-Azam",year:1960,lang:"Hindi",score:99,color:"#2e2e0d"},
    {rank:2,title:"Pather Panchali",year:1955,lang:"Bengali",score:99,color:"#0d1a2e"},
    {rank:3,title:"Dilwale Dulhania Le Jayenge",year:1995,lang:"Hindi",score:98,color:"#1a0d2e"},
    {rank:4,title:"Drishyam",year:2013,lang:"Malayalam",score:97,color:"#0d2e1a"},
    {rank:5,title:"Lagaan",year:2001,lang:"Hindi",score:97,color:"#2e2e0d"}
  ],
  bollywood:[
    {rank:1,title:"Mughal-E-Azam",year:1960,lang:"Hindi",score:99,color:"#2e2e0d"},
    {rank:2,title:"Dilwale Dulhania Le Jayenge",year:1995,lang:"Hindi",score:98,color:"#1a0d2e"},
    {rank:3,title:"Lagaan",year:2001,lang:"Hindi",score:97,color:"#2e2e0d"},
    {rank:4,title:"Taare Zameen Par",year:2007,lang:"Hindi",score:97,color:"#0d2e1a"},
    {rank:5,title:"Dangal",year:2016,lang:"Hindi",score:96,color:"#1a2e0d"}
  ],
  south:[
    {rank:1,title:"Nayakan",year:1987,lang:"Tamil",score:98,color:"#2e0d0d"},
    {rank:2,title:"Drishyam",year:2013,lang:"Malayalam",score:97,color:"#0d2e1a"},
    {rank:3,title:"96",year:2018,lang:"Tamil",score:96,color:"#1a1a2e"},
    {rank:4,title:"RRR",year:2022,lang:"Telugu",score:95,color:"#2e0d1a"},
    {rank:5,title:"Baahubali 2",year:2017,lang:"Telugu",score:92,color:"#2e1a0d"}
  ],
  ott:[
    {rank:1,title:"Scam 1992",year:2020,lang:"Hindi",score:97,color:"#2e2e0d"},
    {rank:2,title:"Panchayat",year:2020,lang:"Hindi",score:95,color:"#1a2e0d"},
    {rank:3,title:"The Family Man",year:2019,lang:"Hindi",score:94,color:"#0d1a1a"},
    {rank:4,title:"Paatal Lok",year:2020,lang:"Hindi",score:93,color:"#1a0d1a"},
    {rank:5,title:"IC 814",year:2024,lang:"Hindi",score:91,color:"#1a1a2e"}
  ]
};

/* ---- LOAD FUNCTIONS ---- */

/* In cinemas — Indian films only */
/* In cinemas — curated current releases, guaranteed language mix */
const currentInCinemas = [
  { id:1356901, lang:'hi' },   // Saiyaara (Hindi)
  { id:1100782, lang:'hi' },   // Stree 2 (Hindi)
  { id:1172034, lang:'hi' },   // Shaitaan (Hindi)
  { id:1244933, lang:'ta' },   // Vidaamuyarchi (Tamil)
  { id:824055,  lang:'ta' },   // Vikram (Tamil)
  { id:1064213, lang:'te' },   // Kalki 2898-AD (Telugu)
  { id:1087822, lang:'te' },   // Devara (Telugu)
  { id:1350457, lang:'ml' },   // Lokah (Malayalam)
  { id:1186532, lang:'ml' },   // Manjummel Boys (Malayalam)
  { id:763215,  lang:'kn' },   // KGF Chapter 2 (Kannada)
];

async function loadCinemas() {
  const grid = document.getElementById('cinemasGrid');
  if (!grid) return;

  // Fetch all curated films by ID in parallel — correct posters + language mix
  const results = await Promise.all(
    currentInCinemas.map(async ({ id }) => {
      try {
        const data = await TMDB.get(`/movie/${id}`, {});
        if (data && !data.status_code && !data.success === false) return data;
        return null;
      } catch { return null; }
    })
  );

  const valid = results.filter(Boolean);

  if (valid.length) {
    grid.innerHTML = valid.map(f => renderCinemaCard(f, 'movie')).join('');
  } else {
    // Fallback to now playing
    const fallback = await TMDB.get('/movie/now_playing', { region: 'IN' });
    const films = (fallback?.results || [])
      .filter(f => INDIAN_LANGS.includes(f.original_language))
      .slice(0, 10);
    grid.innerHTML = films.map(f => renderCinemaCard(f, 'movie')).join('');
  }
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

/* OTT — fetch real posters from TMDb by ID */
async function loadOttWithPosters(platform) {
  const grid = document.getElementById('ottGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="poster-skeleton"></div>'.repeat(4);

  const films = (ottFilms[platform] || []).slice(0, 6);

  // Fetch posters for each film by TMDb ID
  const withPosters = await Promise.all(films.map(async f => {
    try {
      const data = await TMDB.get(`/movie/${f.tmdbId}`, {});
      return { f, film: data };
    } catch {
      return { f, film: null };
    }
  }));

  grid.innerHTML = withPosters.map(({ f, film }) => renderOttCard(f, film)).join('');
}

/* Coming soon — Indian upcoming */
async function loadComingSoon() {
  const grid = document.getElementById('comingGrid');
  if (!grid) return;

  // Fetch upcoming Indian films
  const [upcoming, hiUpcoming] = await Promise.all([
    TMDB.get('/movie/upcoming', { region: 'IN' }),
    TMDB.get('/discover/movie', {
      with_original_language: 'ta,te,ml,kn',
      sort_by: 'release_date.asc',
      'primary_release_date.gte': new Date().toISOString().slice(0,10),
      'primary_release_date.lte': new Date(Date.now() + 60*24*60*60*1000).toISOString().slice(0,10)
    })
  ]);

  let results = [
    ...(upcoming?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language)),
    ...(hiUpcoming?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language))
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
  const indianTV = (data?.results || []).filter(f => INDIAN_LANGS.includes(f.original_language));
  const allTV = data?.results || [];

  // Mix Indian + global for TV
  const mixed = [...indianTV, ...allTV.filter(f => !INDIAN_LANGS.includes(f.original_language))]
    .filter((f,i,arr) => arr.findIndex(x=>x.id===f.id)===i)
    .slice(0,6);

  if (grid) grid.innerHTML = mixed.map(f => renderCinemaCard(f, 'tv')).join('');
  if (list) list.innerHTML = mixed.slice(0,4).map(f => renderReviewRow(f,'tv')).join('');
}

/* Rankings */
function renderRankRow(f) {
  const rc = f.rank===1?'gold':f.rank===2?'silver':f.rank===3?'bronze':'';
  return `
    <a href="pages/movie.html" class="rank-row">
      <div class="rank-num ${rc}">${f.rank}</div>
      <div class="rank-poster" style="background:linear-gradient(160deg,${f.color},${f.color}aa);"></div>
      <div class="rank-info">
        <div class="rank-title">${f.title}</div>
        <div class="rank-meta">${f.lang} · ${f.year}</div>
        <div class="rank-rasas">${f.rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
      </div>
      <div class="rank-score" style="color:${scoreColorHex(f.score)};">${f.score}</div>
    </a>`;
}

/* ---- Init tabs and interactive elements ---- */
function initOttTabs() {
  document.querySelectorAll('.ott-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ott-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadOttWithPosters(btn.dataset.platform);
    });
  });
  loadOttWithPosters('netflix');
}

function initRankingTabs() {
  const list = document.getElementById('rankingsList');
  if (!list) return;
  const load = k => { list.innerHTML = (rankingsData[k]||[]).map(renderRankRow).join(''); loadRankingWithPosters(k); };
  document.querySelectorAll('.rtab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rtab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      load(btn.dataset.rank);
    });
  });
  load('top');
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
  initOttTabs();
  initRankingTabs();
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

/* ---- Load real posters for rankings ---- */
const rankingTmdbIds = {
  top: [390043, 12477, 19330, 95765, 20453],
  bollywood: [390043, 19330, 20453, 194662, 363676],
  south: [95765, 95765, 759244, 515001, 346364],
  ott: [113855, 94954, 95557, 125925, 242074]
};

async function loadRankingWithPosters(key) {
  const list = document.getElementById('rankingsList');
  if (!list) return;

  const films = rankingsData[key] || [];
  const ids = rankingTmdbIds[key] || [];

  // Fetch posters in parallel
  const posters = await Promise.all(ids.map(async (id, i) => {
    try {
      const data = await TMDB.get(`/movie/${id}`, {});
      return data?.poster_path ? TMDB.poster(data.poster_path, 'w92') : null;
    } catch { return null; }
  }));

  list.innerHTML = films.map((f, i) => {
    const rc = f.rank===1?'gold':f.rank===2?'silver':f.rank===3?'bronze':'';
    const posterUrl = posters[i];
    const sc = scoreColorHex(f.score);
    return `
      <a href="pages/movie.html" class="rank-row">
        <div class="rank-num ${rc}">${f.rank}</div>
        ${posterUrl
          ? `<img src="${posterUrl}" class="rank-poster" alt="${f.title}" loading="lazy" onerror="this.style.display='none'" />`
          : `<div class="rank-poster" style="background:linear-gradient(160deg,${f.color},${f.color}aa);"></div>`}
        <div class="rank-info">
          <div class="rank-title">${f.title}</div>
          <div class="rank-meta">${f.lang} · ${f.year}</div>
          <div class="rank-rasas">${f.rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
        </div>
        <div class="rank-score" style="color:${sc};">${f.score}</div>
      </a>`;
  }).join('');
}

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
    TMDB.get('/discover/movie', {
      with_original_language: 'ta,te,ml,kn',
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
    const southFilms = (southMovies?.results || [])
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
  awards: 'Awards'
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
    explorerListsData = index.map((entry, i) => ({
      id: entry.slug,
      filter: entry.category === 'evergreen' ? 'alltime' : entry.category,
      category: explorerCategoryLabel[entry.category] || entry.category,
      title: entry.title,
      count: (fullLists[i]?.entries || []).length,
      entries: fullLists[i]?.entries || []
    })).filter(l => l.entries.length);
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

  if (variant === 'featured') {
    return `
      <a href="pages/lists.html" class="elc-featured" data-filter="${list.filter}" data-id="${list.id}">
        <div class="elc-featured-collage">${cells}</div>
        <div class="elc-featured-body">
          <div class="elc-category">${list.category} · ${list.count} films</div>
          <div class="elc-title">${list.title}</div>
          <div class="elc-preview">
            ${preview.map((title, i) => `
              <div class="elc-preview-item">
                <span class="elc-preview-rank">#${i+1}</span>
                <span class="elc-preview-title">${title}</span>
              </div>`).join('')}
          </div>
        </div>
      </a>`;
  }

  return `
    <a href="pages/lists.html" class="elc-small" data-filter="${list.filter}" data-id="${list.id}">
      <div class="elc-small-collage">${cells}</div>
      <div class="elc-small-body">
        <div class="elc-category">${list.category}</div>
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

/* No editorialStories entry sets a score — every curated film in
   data/films/*.json is currently score_status:"placeholder", and
   placeholders never display a badge (see score display rule). */
const editorialStories = [
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
    category: 'Best of List',
    title: '50 Greatest Bollywood Films of All Time — The CineRaaga Canon',
    meta: 'Curated list · Updated 2025',
    score: null,
    tmdbId: 363676, type: 'movie',
    link: 'pages/lists.html'
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
   =========================== */
async function loadOttPosterGrid(platform) {
  const grid = document.getElementById('ottPosterGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="poster-skeleton"></div>'.repeat(6);

  const films = (ottFilms[platform] || []).slice(0, 8);

  // Fetch each film's real poster + vote data by TMDb ID — use /tv/ for series, /movie/ for films
  const results = [];
  for (const f of films) {
    try {
      const endpoint = f.type === 'tv' ? 'tv' : 'movie';
      const res = await fetch(
        `https://api.themoviedb.org/3/${endpoint}/${f.tmdbId}?api_key=${window.NAVRAS_CONFIG.TMDB_KEY}&language=en-US`
      );
      const data = await res.json();
      const score = TMDB.audienceRating(data.vote_average, data.vote_count);
      results.push({ f, posterPath: data.poster_path || null, score });
    } catch {
      results.push({ f, posterPath: null, score: null });
    }
  }

  grid.innerHTML = results.map(({ f, posterPath, score }) => {
    const sc = score >= 75 ? 'green' : score >= 55 ? 'amber' : 'red';
    const bg = f.color || '#1a1a2e';
    const posterUrl = posterPath
      ? `https://image.tmdb.org/t/p/w342${posterPath}`
      : null;
    return `
      <a href="pages/movie.html?id=${f.tmdbId}" class="cinema-card">
        <div class="cinema-poster" style="${!posterUrl ? `background:linear-gradient(160deg,${bg},${bg}aa)` : ''}">
          ${posterUrl
            ? `<img src="${posterUrl}" alt="${f.title}" loading="lazy"
                onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(160deg,${bg},${bg}aa)'" />`
            : `<div style="padding:8px;font-size:11px;color:var(--text-muted);text-align:center;margin-top:30px;">${f.title}</div>`}
          <div class="cinema-lang">${f.lang}</div>
          ${score ? `<div class="cinema-score ${sc}">${score}</div>` : ''}
        </div>
        <div class="cinema-info">
          <div class="cinema-title">${f.title}</div>
          <div class="cinema-meta">${f.year}</div>
        </div>
      </a>`;
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
   Upcoming OTT releases
   =========================== */
const ottComingSoon = [
  { title:"Pushpa 2: The Rule", lang:"Telugu", date:"5 Jul", platform:"Netflix" },
  { title:"Vettaiyan", lang:"Tamil", date:"8 Jul", platform:"Prime" },
  { title:"Bhool Bhulaiyaa 3", lang:"Hindi", date:"12 Jul", platform:"Netflix" },
  { title:"Amaran", lang:"Tamil", date:"15 Jul", platform:"Hotstar" },
  { title:"Kanguva", lang:"Tamil", date:"18 Jul", platform:"Prime" },
  { title:"Singham Again", lang:"Hindi", date:"20 Jul", platform:"Prime" },
  { title:"Sookshmadarshini", lang:"Malayalam", date:"22 Jul", platform:"SonyLIV" },
  { title:"Game Changer", lang:"Telugu", date:"25 Jul", platform:"Netflix" }
];

function loadOttComingList() {
  const list = document.getElementById('ottComingList');
  if (!list) return;
  list.innerHTML = ottComingSoon.slice(0, 5).map((f, i) => `
    <a href="pages/browse.html" class="trending-list-item">
      <div class="tli-rank">${i+1}</div>
      <div class="tli-title">${f.title}</div>
      <div class="tli-lang">${f.lang}</div>
      <div class="tli-score">
        <div class="tli-score-num" style="color:var(--text-muted);font-size:11px;white-space:nowrap;">${f.date}</div>
      </div>
    </a>
  `).join('');
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
