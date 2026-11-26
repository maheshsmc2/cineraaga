/* ===========================
   Shared: our own record of every film in the lists
   Loaded before home.js / lists.js / list.js.

   data/film-db.json is built by scripts/build-film-db.py, which matches each
   list entry to one TMDb record once — automatically only when unambiguous,
   otherwise by an editor's decision. Pages read the answer from that file
   instead of searching TMDb by title on every visit and trusting the first
   result, which is how wrong posters got onto the site.

   Images are still served by TMDb's image host from the stored paths.
   =========================== */

const filmDbRequests = {};

/* root: path from the current page to frontend/navras ('' or '../'). */
function loadFilmDb(root = '') {
  if (!filmDbRequests[root]) {
    filmDbRequests[root] = fetch(`${root}data/film-db.json`)
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return filmDbRequests[root];
}

/* The stored record for a list entry's film, or null.

   A film added to a list since the script last ran is not in the file yet.
   If the entry pins a tmdb_id that is exact, so ask TMDb for it. With only a
   title, return nothing: a blank poster is better than someone else's. */
async function filmRecord(film, root = '') {
  const db = await loadFilmDb(root);
  const stored = db[`${film.title}|${film.year}|${film.language}`];
  if (stored && (!film.tmdb_id || stored.tmdb_id === film.tmdb_id || stored.match === 'no-record')) {
    return stored;
  }
  if (!film.tmdb_id) return null;

  const key = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${film.tmdb_id}?api_key=${key}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
