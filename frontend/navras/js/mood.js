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

const filmDatabase = {
  shringara: [
    { title: "Dilwale Dulhania Le Jayenge", year: 1995, lang: "hindi", ott: "prime", score: 98, color: "#1a0d2e", rasas: ["Shringara","Veera"], verdict: "The definitive Indian romance. Timeless.", era: "classic" },
    { title: "Jab We Met", year: 2007, lang: "hindi", ott: "prime", score: 92, color: "#0d1a2e", rasas: ["Shringara","Hasya"], verdict: "Kareena Kapoor at her most magnetic.", era: "2000s" },
    { title: "OK Kanmani", year: 2015, lang: "tamil", ott: "hotstar", score: 90, color: "#2e1a0d", rasas: ["Shringara","Shanta"], verdict: "Mani Ratnam's most tender film in decades.", era: "2010s" },
    { title: "Ek Ladki Ko Dekha Toh Aisa Laga", year: 2019, lang: "hindi", ott: "prime", score: 82, color: "#1a0d1a", rasas: ["Shringara","Veera"], verdict: "A quietly revolutionary love story.", era: "new" },
    { title: "Premam", year: 2015, lang: "malayalam", ott: "prime", score: 94, color: "#0d2e1a", rasas: ["Shringara","Hasya"], verdict: "The Malayalam film that redefined a generation.", era: "2010s" },
    { title: "96", year: 2018, lang: "tamil", ott: "zee5", score: 96, color: "#1a1a2e", rasas: ["Shringara","Karuna"], verdict: "Nostalgia and longing distilled to perfection.", era: "2010s" },
    { title: "Rockstar", year: 2011, lang: "hindi", ott: "netflix", score: 88, color: "#2e0d0d", rasas: ["Shringara","Raudra"], verdict: "Ranbir Kapoor's greatest performance.", era: "2010s" },
    { title: "Barfi!", year: 2012, lang: "hindi", ott: "prime", score: 89, color: "#1a2e0d", rasas: ["Shringara","Hasya"], verdict: "Charming, wordless, and deeply moving.", era: "2010s" }
  ],
  hasya: [
    { title: "3 Idiots", year: 2009, lang: "hindi", ott: "netflix", score: 95, color: "#1a2e0d", rasas: ["Hasya","Veera"], verdict: "The most rewatched Indian film of the century.", era: "2000s" },
    { title: "Stree 2", year: 2024, lang: "hindi", ott: "prime", score: 87, color: "#1a0d2e", rasas: ["Hasya","Bhayanaka"], verdict: "Funnier, scarier, smarter than the original.", era: "new" },
    { title: "Golmaal: Fun Unlimited", year: 2006, lang: "hindi", ott: "prime", score: 82, color: "#2e2e0d", rasas: ["Hasya"], verdict: "The blueprint for Rohit Shetty's comedy empire.", era: "2000s" },
    { title: "Panchayat", year: 2020, lang: "hindi", ott: "prime", score: 93, color: "#1a2e1a", rasas: ["Hasya","Shanta"], verdict: "The most wholesome Indian series ever made.", era: "new" },
    { title: "Jaane Tu... Ya Jaane Na", year: 2008, lang: "hindi", ott: "prime", score: 84, color: "#0d1a2e", rasas: ["Hasya","Shringara"], verdict: "Light as air, sweet as mithai.", era: "2000s" },
    { title: "Drishyam", year: 2013, lang: "malayalam", ott: "prime", score: 94, color: "#0d2e2e", rasas: ["Hasya","Bhayanaka"], verdict: "Mohanlal's masterclass in tension and timing.", era: "2010s" },
    { title: "Andhadhun", year: 2018, lang: "hindi", ott: "netflix", score: 93, color: "#1a1a1a", rasas: ["Hasya","Bhayanaka"], verdict: "The darkest comedy India has ever produced.", era: "2010s" },
    { title: "Khosla Ka Ghosla!", year: 2006, lang: "hindi", ott: "zee5", score: 88, color: "#2e1a0d", rasas: ["Hasya","Raudra"], verdict: "A masterpiece of middle-class Indian humour.", era: "2000s" }
  ],
  karuna: [
    { title: "Taare Zameen Par", year: 2007, lang: "hindi", ott: "hotstar", score: 97, color: "#0d2e1a", rasas: ["Karuna","Veera"], verdict: "The most important Indian film about childhood.", era: "2000s" },
    { title: "Masaan", year: 2015, lang: "hindi", ott: "netflix", score: 95, color: "#1a1a2e", rasas: ["Karuna","Shanta"], verdict: "Grief, love and Varanasi rendered breathtakingly.", era: "2010s" },
    { title: "All We Imagine as Light", year: 2024, lang: "malayalam", ott: "netflix", score: 96, color: "#0d2e0d", rasas: ["Karuna","Shanta"], verdict: "India's most celebrated film of this decade.", era: "new" },
    { title: "Drishyam 2", year: 2021, lang: "malayalam", ott: "prime", score: 91, color: "#0d1a2e", rasas: ["Karuna","Bhayanaka"], verdict: "A sequel that surpasses the original.", era: "new" },
    { title: "Kapoor & Sons", year: 2016, lang: "hindi", ott: "prime", score: 87, color: "#2e1a1a", rasas: ["Karuna","Raudra"], verdict: "The most honest Indian family drama in years.", era: "2010s" },
    { title: "96", year: 2018, lang: "tamil", ott: "zee5", score: 96, color: "#1a1a2e", rasas: ["Karuna","Shringara"], verdict: "Every frame is a memory you feel was yours.", era: "2010s" },
    { title: "Mughal-E-Azam", year: 1960, lang: "hindi", ott: "prime", score: 99, color: "#2e2e0d", rasas: ["Karuna","Veera"], verdict: "The greatest Indian epic ever committed to film.", era: "classic" },
    { title: "Piku", year: 2015, lang: "hindi", ott: "prime", score: 89, color: "#1a2e1a", rasas: ["Karuna","Hasya"], verdict: "Amitabh Bachchan's most human performance.", era: "2010s" }
  ],
  veera: [
    { title: "Dangal", year: 2016, lang: "hindi", ott: "hotstar", score: 96, color: "#1a2e0d", rasas: ["Veera","Karuna"], verdict: "The greatest sports film India has produced.", era: "2010s" },
    { title: "RRR", year: 2022, lang: "telugu", ott: "netflix", score: 95, color: "#2e0d1a", rasas: ["Veera","Raudra"], verdict: "Pure cinematic adrenaline from start to finish.", era: "new" },
    { title: "Lagaan", year: 2001, lang: "hindi", ott: "sony", score: 97, color: "#2e2e0d", rasas: ["Veera","Shringara"], verdict: "The film that took Indian cinema to the Oscars.", era: "2000s" },
    { title: "Kanguva", year: 2024, lang: "tamil", ott: "prime", score: 91, color: "#1a0d2e", rasas: ["Veera","Adbhuta"], verdict: "Tamil cinema's most ambitious spectacle.", era: "new" },
    { title: "Uri: The Surgical Strike", year: 2019, lang: "hindi", ott: "netflix", score: 85, color: "#0d1a2e", rasas: ["Veera","Raudra"], verdict: "How's the josh? High, sir. Very high.", era: "new" },
    { title: "Baahubali 2", year: 2017, lang: "telugu", ott: "netflix", score: 92, color: "#2e1a0d", rasas: ["Veera","Adbhuta"], verdict: "India's answer to Game of Thrones.", era: "2010s" },
    { title: "Chak De! India", year: 2007, lang: "hindi", ott: "hotstar", score: 93, color: "#0d2e1a", rasas: ["Veera","Karuna"], verdict: "Shah Rukh Khan's finest hour.", era: "2000s" },
    { title: "Manjummel Boys", year: 2024, lang: "malayalam", ott: "hotstar", score: 91, color: "#0d2e2e", rasas: ["Veera","Bhayanaka"], verdict: "Brotherhood and survival, stunningly realised.", era: "new" }
  ],
  bhayanaka: [
    { title: "Tumbbad", year: 2018, lang: "hindi", ott: "prime", score: 94, color: "#2e0d0d", rasas: ["Bhayanaka","Bibhatsa"], verdict: "The most original Indian horror film ever made.", era: "2010s" },
    { title: "IC 814: The Kandahar Hijack", year: 2024, lang: "hindi", ott: "netflix", score: 91, color: "#1a1a2e", rasas: ["Bhayanaka","Veera"], verdict: "India's most gripping series in years.", era: "new" },
    { title: "Drishyam 2", year: 2021, lang: "malayalam", ott: "prime", score: 91, color: "#0d1a2e", rasas: ["Bhayanaka","Karuna"], verdict: "The perfect follow-up to a perfect thriller.", era: "new" },
    { title: "Andhadhun", year: 2018, lang: "hindi", ott: "netflix", score: 93, color: "#1a1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "You will not see any of it coming.", era: "2010s" },
    { title: "Kahaani", year: 2012, lang: "hindi", ott: "prime", score: 92, color: "#1a0d1a", rasas: ["Bhayanaka","Veera"], verdict: "Vidya Balan's Kolkata masterpiece.", era: "2010s" },
    { title: "The Family Man", year: 2019, lang: "hindi", ott: "prime", score: 94, color: "#0d1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "The best Indian thriller series ever made.", era: "new" },
    { title: "Stree", year: 2018, lang: "hindi", ott: "prime", score: 88, color: "#1a0d2e", rasas: ["Bhayanaka","Hasya"], verdict: "Horror-comedy that actually delivers on both.", era: "2010s" },
    { title: "Vikram", year: 2022, lang: "tamil", ott: "hotstar", score: 90, color: "#2e0d1a", rasas: ["Bhayanaka","Raudra"], verdict: "Kamal Haasan back at his most dangerous.", era: "new" }
  ],
  adbhuta: [
    { title: "Baahubali 2: The Conclusion", year: 2017, lang: "telugu", ott: "netflix", score: 92, color: "#2e1a0d", rasas: ["Adbhuta","Veera"], verdict: "India's most spectacular blockbuster.", era: "2010s" },
    { title: "Kalki 2898-AD", year: 2024, lang: "telugu", ott: "hotstar", score: 74, color: "#1a1a0d", rasas: ["Adbhuta","Veera"], verdict: "Mythology meets sci-fi in an ambitious gamble.", era: "new" },
    { title: "Enthiran", year: 2010, lang: "tamil", ott: "hotstar", score: 88, color: "#0d1a2e", rasas: ["Adbhuta","Raudra"], verdict: "Rajinikanth as a robot. That's the pitch.", era: "2010s" },
    { title: "Brahmastra", year: 2022, lang: "hindi", ott: "hotstar", score: 68, color: "#1a0d2e", rasas: ["Adbhuta","Shringara"], verdict: "Visually stunning, narratively ambitious.", era: "new" },
    { title: "Kanguva", year: 2024, lang: "tamil", ott: "prime", score: 91, color: "#1a0d2e", rasas: ["Adbhuta","Veera"], verdict: "World-building on a scale Tamil cinema hasn't seen.", era: "new" },
    { title: "Mughal-E-Azam", year: 1960, lang: "hindi", ott: "prime", score: 99, color: "#2e2e0d", rasas: ["Adbhuta","Karuna"], verdict: "India's most visually magnificent classic.", era: "classic" },
    { title: "Kantara", year: 2022, lang: "kannada", ott: "prime", score: 91, color: "#0d2e1a", rasas: ["Adbhuta","Bhayanaka"], verdict: "A primal, spiritual, unforgettable experience.", era: "new" },
    { title: "2.0", year: 2018, lang: "tamil", ott: "hotstar", score: 75, color: "#0d0d2e", rasas: ["Adbhuta","Raudra"], verdict: "Rajinikanth vs Akshay Kumar. Pure spectacle.", era: "2010s" }
  ],
  raudra: [
    { title: "Gangs of Wasseypur", year: 2012, lang: "hindi", ott: "netflix", score: 97, color: "#2e0d0d", rasas: ["Raudra","Bibhatsa"], verdict: "India's most complete crime epic.", era: "2010s" },
    { title: "Vikram", year: 2022, lang: "tamil", ott: "hotstar", score: 90, color: "#1a0d2e", rasas: ["Raudra","Bhayanaka"], verdict: "Three legends. One unstoppable collision.", era: "new" },
    { title: "Article 15", year: 2019, lang: "hindi", ott: "zee5", score: 88, color: "#0d1a1a", rasas: ["Raudra","Karuna"], verdict: "The most important Indian social thriller in years.", era: "new" },
    { title: "RRR", year: 2022, lang: "telugu", ott: "netflix", score: 95, color: "#2e0d1a", rasas: ["Raudra","Veera"], verdict: "Rage, brotherhood, and revolution.", era: "new" },
    { title: "Mirzapur", year: 2018, lang: "hindi", ott: "prime", score: 86, color: "#2e1a0d", rasas: ["Raudra","Bibhatsa"], verdict: "Ruthless, addictive, impossible to stop watching.", era: "2010s" },
    { title: "Jai Bhim", year: 2021, lang: "tamil", ott: "prime", score: 95, color: "#0d0d2e", rasas: ["Raudra","Karuna"], verdict: "Suriya's most powerful performance. Required viewing.", era: "new" },
    { title: "Andhadhun", year: 2018, lang: "hindi", ott: "netflix", score: 93, color: "#1a1a1a", rasas: ["Raudra","Bhayanaka"], verdict: "Dark comedy twisted into something genuinely dangerous.", era: "2010s" },
    { title: "Khakee", year: 2023, lang: "hindi", ott: "netflix", score: 87, color: "#1a1a0d", rasas: ["Raudra","Bhayanaka"], verdict: "The cat-and-mouse thriller India needed.", era: "new" }
  ],
  shanta: [
    { title: "All We Imagine as Light", year: 2024, lang: "malayalam", ott: "netflix", score: 96, color: "#0d2e1a", rasas: ["Shanta","Karuna"], verdict: "The most quietly beautiful Indian film in decades.", era: "new" },
    { title: "Piku", year: 2015, lang: "hindi", ott: "prime", score: 89, color: "#1a2e1a", rasas: ["Shanta","Hasya"], verdict: "A road trip that feels like a warm hug.", era: "2010s" },
    { title: "Masaan", year: 2015, lang: "hindi", ott: "netflix", score: 95, color: "#1a1a2e", rasas: ["Shanta","Karuna"], verdict: "Grief and rebirth on the banks of the Ganga.", era: "2010s" },
    { title: "October", year: 2018, lang: "hindi", ott: "prime", score: 84, color: "#0d1a2e", rasas: ["Shanta","Karuna"], verdict: "Shoojit Sircar's most delicate film. Breathtaking.", era: "2010s" },
    { title: "Panchayat", year: 2020, lang: "hindi", ott: "prime", score: 93, color: "#1a2e0d", rasas: ["Shanta","Hasya"], verdict: "Rural India, rendered with warmth and truth.", era: "new" },
    { title: "Aankhon Dekhi", year: 2013, lang: "hindi", ott: "zee5", score: 90, color: "#2e2e1a", rasas: ["Shanta","Adbhuta"], verdict: "A small film with an enormous soul.", era: "2010s" },
    { title: "Lootera", year: 2013, lang: "hindi", ott: "prime", score: 87, color: "#1a1a2e", rasas: ["Shanta","Shringara"], verdict: "Visually ravishing. Emotionally devastating.", era: "2010s" },
    { title: "Kadvi Hawa", year: 2017, lang: "hindi", ott: "netflix", score: 88, color: "#2e1a0d", rasas: ["Shanta","Karuna"], verdict: "Climate change and human dignity, perfectly balanced.", era: "2010s" }
  ],
  bibhatsa: [
    { title: "Tumbbad", year: 2018, lang: "hindi", ott: "prime", score: 94, color: "#2e0d0d", rasas: ["Bibhatsa","Bhayanaka"], verdict: "Greed and mythology fused into something nightmarish.", era: "2010s" },
    { title: "Ugly", year: 2013, lang: "hindi", ott: "netflix", score: 91, color: "#1a1a1a", rasas: ["Bibhatsa","Raudra"], verdict: "Anurag Kashyap's darkest and most honest film.", era: "2010s" },
    { title: "Article 15", year: 2019, lang: "hindi", ott: "zee5", score: 88, color: "#0d1a1a", rasas: ["Bibhatsa","Raudra"], verdict: "Caste, power, and the ugliness India hides.", era: "new" },
    { title: "Gangs of Wasseypur", year: 2012, lang: "hindi", ott: "netflix", score: 97, color: "#2e0d0d", rasas: ["Bibhatsa","Raudra"], verdict: "Five hours of unrelenting darkness and brilliance.", era: "2010s" },
    { title: "Newton", year: 2017, lang: "hindi", ott: "netflix", score: 88, color: "#0d2e1a", rasas: ["Bibhatsa","Shanta"], verdict: "Democracy in India's most forgotten corners.", era: "2010s" },
    { title: "Andhadhun", year: 2018, lang: "hindi", ott: "netflix", score: 93, color: "#1a1a1a", rasas: ["Bibhatsa","Bhayanaka"], verdict: "Wickedness has never been this entertaining.", era: "2010s" },
    { title: "Raat Akeli Hai", year: 2020, lang: "hindi", ott: "netflix", score: 84, color: "#1a0d1a", rasas: ["Bibhatsa","Raudra"], verdict: "Nawazuddin in a murder mystery soaked in class tension.", era: "new" },
    { title: "Mirzapur", year: 2018, lang: "hindi", ott: "prime", score: 86, color: "#2e1a0d", rasas: ["Bibhatsa","Raudra"], verdict: "Power, violence, and loyalty in the badlands.", era: "2010s" }
  ]
};

let currentRasa = null;
let currentFilms = [];
let displayedCount = 6;

function selectRasa(rasa, el) {
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

function renderFeatured(film) {
  if (!film) return;
  const container = document.getElementById('mrpFeatured');
  const scoreColor = film.score >= 85 ? '#2ECC71' : film.score >= 70 ? '#F39C12' : '#E74C3C';
  container.innerHTML = `
    <div class="featured-pick-card">
      <div class="fp-poster" style="background:linear-gradient(160deg,${film.color},${film.color}88);"></div>
      <div class="fp-info">
        <div class="fp-badge">✦ Top Navras Pick</div>
        <div class="fp-title">${film.title}</div>
        <div class="fp-meta">${film.lang.charAt(0).toUpperCase()+film.lang.slice(1)} · ${film.year} · ${film.rasas.join(' · ')}</div>
        <div class="fp-verdict">${film.verdict}</div>
        <div class="fp-bottom">
          <div class="fp-score" style="color:${scoreColor};">${film.score}<span>/100 Navras</span></div>
          <a href="movie.html" class="fp-watch-btn">View full review →</a>
          <span class="navras-score-pill" style="font-size:11px;">${film.ott.charAt(0).toUpperCase()+film.ott.slice(1)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderFilms(films) {
  const grid = document.getElementById('mrpFilmsGrid');
  grid.innerHTML = films.map(f => {
    const scoreColor = f.score >= 85 ? '#2ECC71' : f.score >= 70 ? '#F39C12' : '#E74C3C';
    const dotClass = f.score >= 85 ? 'green' : f.score >= 70 ? 'amber' : 'red';
    return `
      <a href="movie.html" class="film-card">
        <div class="film-poster" style="background:linear-gradient(160deg,${f.color},${f.color}88);">
          <span class="film-lang">${f.lang.charAt(0).toUpperCase()+f.lang.slice(1)}</span>
          <span class="film-score-badge"><span class="sdot ${dotClass}"></span>${f.score}</span>
        </div>
        <div class="film-info">
          <div class="film-title">${f.title}</div>
          <div class="film-meta">${f.year} · ${f.rasas[0]}</div>
          <div class="film-rasatags">${f.rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
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
  const allFilms = filmDatabase[currentRasa] || [];
  applyFilters();
}

function applyFilters() {
  if (!currentRasa) return;
  const lang = document.getElementById('langFilter').value;
  const ott = document.getElementById('ottFilter').value;
  const era = document.getElementById('eraFilter').value;

  let filtered = [...(filmDatabase[currentRasa] || [])];

  if (lang !== 'all') filtered = filtered.filter(f => f.lang === lang);
  if (ott !== 'all') filtered = filtered.filter(f => f.ott === ott);
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

  if (by === 'navras') currentFilms.sort((a,b) => b.score - a.score);
  else if (by === 'year') currentFilms.sort((a,b) => b.year - a.year);
  else if (by === 'popular') currentFilms.sort((a,b) => b.score - a.score);

  renderFeatured(currentFilms[0]);
  renderFilms(currentFilms.slice(1, displayedCount + 1));
}

function searchByPrompt() {
  const input = document.getElementById('moodPromptInput').value.trim();
  if (!input) return;
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
