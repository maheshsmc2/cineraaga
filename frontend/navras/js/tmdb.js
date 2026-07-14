/* ===========================
   NAVRAS — TMDb API Module
   Real posters, real data
   =========================== */

const TMDB = {
  get key() { return (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || ''; },
  base: 'https://api.themoviedb.org/3',
  img: 'https://image.tmdb.org/t/p/',

  // Poster sizes: w92 w154 w185 w342 w500 w780 original
  poster(path, size = 'w342') {
    if (!path) return null;
    return `${this.img}${size}${path}`;
  },

  // Backdrop sizes: w300 w780 w1280 original
  backdrop(path, size = 'w1280') {
    if (!path) return null;
    return `${this.img}${size}${path}`;
  },

  async get(endpoint, params = {}) {
    const url = new URL(`${this.base}${endpoint}`);
    url.searchParams.set('api_key', this.key);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('TMDb fetch failed:', e);
      return null;
    }
  },

  // Search for a film
  async search(query, page = 1) {
    return this.get('/search/multi', { query, page, include_adult: false });
  },

  // Get movie details
  async movie(id) {
    return this.get(`/movie/${id}`, { append_to_response: 'credits,videos,similar' });
  },

  // Get trending this week
  async trending(type = 'movie', time = 'week') {
    return this.get(`/trending/${type}/${time}`);
  },

  // Discover with filters
  async discover(params = {}) {
    return this.get('/discover/movie', {
      sort_by: 'popularity.desc',
      include_adult: false,
      ...params
    });
  },

  // Indian language codes for TMDb
  langCodes: {
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    malayalam: 'ml',
    kannada: 'kn',
    bengali: 'bn',
    marathi: 'mr',
    punjabi: 'pa',
    english: 'en'
  },

  // Real TMDb genre names — NOT rasa tags. Rasas are hand-assigned by Mahe
  // and only ever come from the curated backend export (film.rasas). This
  // function is only used as a fallback label for films that AREN'T yet
  // in that curated set, so it must never borrow rasa vocabulary.
  genreIdToName: {
    28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
    99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
    27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance',
    878:'Science Fiction', 10770:'TV Movie', 53:'Thriller', 10752:'War', 37:'Western'
  },
  genreTags(genres = []) {
    const ids = genres.map(g => g.id);
    return ids.map(id => this.genreIdToName[id]).filter(Boolean).slice(0, 2);
  },

  // Audience Rating /100 — TMDb's own average, scaled up for display.
  // This is deliberately NOT called a Navras Score: a real Navras Score
  // only exists when Mahe has hand-scored the film (see film.navras_score +
  // film.score_status in the curated export). No formula, curve, or bonus
  // is applied here — it's a plain scale-up of TMDb's number, kept honest.
  audienceRating(voteAvg, voteCount) {
    if (!voteAvg || !voteCount) return null;
    return Math.round(voteAvg * 10);
  },

  scoreColor(score) {
    if (!score) return '#A09890';
    if (score >= 85) return '#1A7A3C';
    if (score >= 70) return '#B87000';
    return '#C0392B';
  },

  scoreDotClass(score) {
    if (!score) return 'amber';
    if (score >= 85) return 'green';
    if (score >= 70) return 'amber';
    return 'red';
  }
};
