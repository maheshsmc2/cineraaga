/* ===========================
   NAVRAS — Configuration
   ===========================
   
   ⚠️  THE ONLY PLACE YOUR TMDB KEY LIVES
   
   To change your API key:
   1. Get a key from themoviedb.org → Settings → API
   2. Replace the value below
   3. Save and upload — done
   
   This is a free TMDb read-only key. It is safe for
   client-side use (TMDb designed it this way), but if
   you ever notice unusual usage, just generate a new
   key here and replace this one line.
   =========================== */

const NAVRAS_CONFIG = {
  // Your TMDb API key — change here only
  TMDB_KEY: '8d1f8757e50b58da6831c4d97093eea0',

  // TMDb endpoints (don't change these)
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMG: 'https://image.tmdb.org/t/p/'
};

// Make it available everywhere
window.NAVRAS_CONFIG = NAVRAS_CONFIG;
