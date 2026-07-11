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

  // Navras rasa tags based on genre
  rasaFromGenres(genres = []) {
    const ids = genres.map(g => g.id);
    const tags = [];
    if (ids.includes(10749)) tags.push('Shringara'); // Romance
    if (ids.includes(35)) tags.push('Hasya');        // Comedy
    if (ids.includes(18)) tags.push('Karuna');       // Drama
    if (ids.includes(28) || ids.includes(12)) tags.push('Veera'); // Action/Adventure
    if (ids.includes(27) || ids.includes(53)) tags.push('Bhayanaka'); // Horror/Thriller
    if (ids.includes(878) || ids.includes(14)) tags.push('Adbhuta'); // Sci-Fi/Fantasy
    if (ids.includes(80)) tags.push('Raudra');       // Crime
    if (ids.includes(99)) tags.push('Shanta');       // Documentary
    return tags.length ? tags.slice(0, 2) : ['Adbhuta'];
  },

  // Navras /100 score from vote average
  navrasScore(voteAvg, voteCount) {
    if (!voteAvg || !voteCount) return null;
    // Base score: TMDb 7.0 = Navras 75, 8.0 = 85, 9.0 = 94
    const base = Math.pow(voteAvg / 10, 0.7) * 88;
    // Volume bonus: up to 8 points for widely-rated films
    const vol = Math.min((Math.log10(voteCount + 1) / 5) * 8, 8);
    // Desi cultural bonus: 3-4 points
    const desi = 3 + Math.round((voteAvg / 10) * 1);
    return Math.round(Math.min(base + vol + desi, 99));
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
