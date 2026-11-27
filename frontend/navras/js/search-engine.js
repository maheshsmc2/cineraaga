/* ===========================
   CineRaaga search — stage 1 (no AI, no server)

   Searches only what CineRaaga has curated: the films in the ranked lists,
   the editor's note on each, published reviews, and editor-written
   "bridges" between films (data/bridges.json). Director, cast and genres
   come from data/film-db.json.

   Every result carries the reasons it was picked. Nothing is shown that
   cannot be explained from those sources.

   Moods are matched to the editor's own lists and to words in the editor's
   notes. The rasa tags in data/mood/*.json are deliberately not used until
   the editor has confirmed them (Drishyam is tagged comedy there).

   Pure logic, no DOM: js/search.js draws the results.
   =========================== */

const CRSearch = (() => {
  /* word(s) a visitor types -> the editor's list that answers it */
  const MOODS = [
    { label: 'Comedy',        list: 'great-indian-comedies',            words: ['funny', 'comedy', 'comedies', 'comic', 'laugh', 'laughs', 'hilarious', 'humour', 'humor', 'hasya'] },
    { label: 'Romance',       list: 'great-indian-romances',            words: ['romantic', 'romance', 'romances', 'love', 'shringara'] },
    { label: 'Thriller',      list: 'great-indian-thrillers',           words: ['thriller', 'thrillers', 'suspense', 'suspenseful', 'tense', 'mystery', 'twist', 'twists'] },
    { label: 'Horror',        list: 'great-indian-horror-films',        words: ['horror', 'scary', 'ghost', 'fear', 'frightening', 'bhayanaka'] },
    { label: 'Crime',         list: 'great-indian-crime-films',         words: ['crime', 'gangster', 'underworld'] },
    { label: 'Action',        list: 'great-indian-action-films',        words: ['action', 'fight', 'fights'] },
    { label: 'Sports',        list: 'best-indian-sports-films',         words: ['sport', 'sports', 'cricket', 'boxing', 'hockey', 'wrestling'] },
    { label: 'Family drama',  list: 'best-indian-family-dramas',        words: ['family'] },
    { label: 'Coming of age', list: 'best-indian-coming-of-age-films',  words: ['coming', 'teen', 'teenage', 'youth', 'school', 'college', 'childhood'] },
    { label: 'War',           list: 'great-indian-war-films',           words: ['war', 'army', 'soldier', 'soldiers', 'military', 'patriotic'] },
    { label: 'Spy',           list: 'great-indian-spy-films',           words: ['spy', 'espionage', 'agent'] },
    { label: 'Political',     list: 'great-indian-political-films',     words: ['political', 'politics'] },
    { label: 'Social',        list: 'great-indian-social-films',        words: ['social', 'society', 'caste'] },
    { label: 'Music',         list: 'great-indian-music-films',         words: ['music', 'musical', 'songs'] },
  ];

  /* Feelings with no list of their own: look for these words in the notes. */
  const FEELINGS = {
    sad: ['sad', 'tragic', 'tragedy', 'grief', 'loss', 'heartbreaking', 'emotional', 'moving'],
    cry: ['tragic', 'grief', 'loss', 'heartbreaking', 'emotional', 'moving'],
    emotional: ['emotional', 'moving', 'heartfelt', 'tender'],
    happy: ['joyful', 'joyous', 'cheerful', 'warm', 'charming', 'feelgood'],
    feelgood: ['joyful', 'joyous', 'cheerful', 'warm', 'charming', 'uplifting'],
    inspiring: ['inspiring', 'inspirational', 'uplifting', 'triumph'],
    calm: ['gentle', 'quiet', 'tender', 'restrained'],
    peaceful: ['gentle', 'quiet', 'tender'],
    dark: ['dark', 'grim', 'brutal', 'violent', 'bleak'],
    angry: ['anger', 'angry', 'revenge', 'rage'],
    revenge: ['revenge', 'vengeance'],
  };

  const LANGUAGES = ['hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'marathi', 'bengali', 'assamese', 'english', 'punjabi', 'gujarati', 'odia', 'bhojpuri'];
  const ALIASES = { srk: 'shah rukh khan', ar: 'a r' };

  const STOP = new Set(('a an and are as at be been but by can for from has have in into is it its of on or more most much one only so than that the their them then there these they this those to was what when where which while who whose why will with without would very also even still just about after all any because being between both could does each ever every first here how like made make makes making many may might must never new not now other our out over own same should some such through too under up us use way well were your he she his her him i me my we you ' +
    'film films movie movies cinema story stories indian india show shows watch watching something anything good great best similar please want find give feel mood tonight performance performances character characters audience director directed screenplay ' +
    'deliver delivers delivered delivering remains remain become becomes became brilliant excellent superb outstanding strong powerful particularly perhaps genuinely remarkably extremely entire whole turns turn gives given genre classic major modern work works').split(' '));

  const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
  const squash = s => norm(s).replace(/ /g, '');
  const words = s => norm(s).split(' ').filter(Boolean);
  const contentWords = s => words(s).filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const keep = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = keep;
      }
    }
    return row[b.length];
  }

  /* data: { lists: [list json], filmDb, reviews, bridges } */
  function build({ lists, filmDb = {}, reviews = [], bridges = [] }) {
    const films = new Map();
    const keyOf = f => `${f.title}|${f.year}|${String(f.language).toLowerCase()}`;

    const add = f => {
      const key = keyOf(f);
      if (!films.has(key)) {
        const rec = filmDb[`${f.title}|${f.year}|${f.language}`] || {};
        films.set(key, {
          key, title: f.title, year: f.year, language: String(f.language).toLowerCase(),
          tmdbId: f.tmdb_id || rec.tmdb_id || null, poster: rec.poster_path || null,
          director: rec.director || [], cast: rec.cast || [], genres: rec.genres || [],
          appearances: [], review: null,
        });
      }
      return films.get(key);
    };

    lists.filter(Boolean).forEach(list => (list.entries || []).forEach(e => {
      add(e.film).appearances.push({
        slug: list.slug, list: list.title, rank: e.rank,
        note: [e.blurb, e.why_it_ranks].filter(t => t && t.trim()).join(' '),
      });
    }));

    reviews.forEach(r => {
      const existing = [...films.values()].find(f => f.tmdbId === r.tmdb_id);
      const film = existing || add({ title: r.title, year: r.year, language: r.language.toLowerCase(), tmdb_id: r.tmdb_id });
      film.review = r;
    });

    /* word weights across all notes: rare words say more than common ones */
    const all = [...films.values()];
    const df = new Map();
    all.forEach(f => {
      const text = f.appearances.map(a => a.note).concat(f.review ? [f.review.verdict || f.review.tagline || ''] : []).join(' ');
      const own = new Set(contentWords(f.title));
      f.terms = new Map();
      contentWords(text).filter(w => !own.has(w)).forEach(w => f.terms.set(w, (f.terms.get(w) || 0) + 1));
      f.terms.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1));
    });
    const idf = w => Math.log((all.length + 1) / ((df.get(w) || 0) + 1));
    all.forEach(f => {
      f.vector = new Map([...f.terms].map(([w, n]) => [w, (1 + Math.log(n)) * idf(w)]));
      f.length = Math.hypot(...f.vector.values()) || 1;
    });

    const people = new Map();
    all.forEach(f => [...f.director, ...f.cast].forEach(p => people.set(norm(p), p)));

    return { films: all, idf, df, people, bridges, keyOf };
  }

  /* ---------- "films like X" ---------- */

  function findFilm(index, text) {
    const q = squash(text);
    if (!q) return [];
    const best = list => list.sort((a, b) => b.appearances.length - a.appearances.length || a.year - b.year);
    const exact = index.films.filter(f => squash(f.title) === q);
    if (exact.length) return best(exact);
    if (q.length < 4) return [];
    const starts = index.films.filter(f => squash(f.title).startsWith(q));
    if (starts.length) return best(starts);
    if (q.length < 5) return [];
    return best(index.films.filter(f => editDistance(squash(f.title), q) <= (q.length > 7 ? 2 : 1)));
  }

  const sameFilm = (index, ref, film) => ref && squash(ref.title) === squash(film.title) && Number(ref.year) === film.year;

  function similarTo(index, seed) {
    const scored = [];
    for (const f of index.films) {
      if (f === seed) continue;
      let score = 0;
      let strong = false;
      const reasons = [];

      const bridge = index.bridges.find(b =>
        (sameFilm(index, b.from, seed) && sameFilm(index, b.to, f)) ||
        (sameFilm(index, b.to, seed) && sameFilm(index, b.from, f)));
      if (bridge) { score += 100; strong = true; reasons.push({ type: 'bridge', text: bridge.why }); }

      const shared = f.appearances.filter(a => seed.appearances.some(s => s.slug === a.slug));
      if (shared.length) {
        score += shared.reduce((n, a) => n + 12 + Math.max(0, 26 - a.rank) / 10, 0);
        strong = true;
        shared.forEach(a => reasons.push({ type: 'list', text: `Also in ${a.list} (#${a.rank})` }));
      }

      const directors = f.director.filter(d => seed.director.includes(d));
      if (directors.length) { score += 14; strong = true; reasons.push({ type: 'director', text: `Same director: ${directors.join(', ')}` }); }

      const sharedGenres = f.genres.filter(g => seed.genres.includes(g));
      const actors = f.cast.filter(c => seed.cast.includes(c)).slice(0, 3);
      /* an actor in common only counts as likeness if the kind of film matches too */
      if (actors.length) { score += actors.length * 4; if (sharedGenres.length) strong = true; reasons.push({ type: 'cast', text: `Shares ${actors.join(', ')}` }); }

      let dot = 0;
      const common = [];
      for (const [w, v] of f.vector) {
        if (!seed.vector.has(w)) continue;
        dot += v * seed.vector.get(w);
        common.push([w, v * seed.vector.get(w)]);
      }
      const likeness = dot / (f.length * seed.length);
      if (likeness >= 0.08) {
        score += likeness * 40;
        if (likeness >= 0.14) strong = true;
        const top = common.sort((a, b) => b[1] - a[1]).slice(0, 2).map(c => `“${c[0]}”`);
        reasons.push({ type: 'note', text: `Both CineRaaga notes mention ${top.join(' and ')}` });
      }

      const genres = sharedGenres.slice(0, 3);
      if (genres.length) { score += genres.length * 2; reasons.push({ type: 'genre', text: `Both ${genres.join(', ').toLowerCase()}` }); }

      if (f.language === seed.language) score += 1.5;

      /* sharing a genre or a language alone is not a reason to recommend */
      if (strong) scored.push({ film: f, score, reasons });
    }
    return scored.sort((a, b) => b.score - a.score || a.film.title.localeCompare(b.film.title));
  }

  /* ---------- mood / keyword search ---------- */

  function parseFilters(text) {
    const filters = { languages: [], from: null, to: null, labels: [] };
    let rest = ` ${norm(text)} `;

    LANGUAGES.forEach(l => {
      if (rest.includes(` ${l} `)) { filters.languages.push(l); filters.labels.push(cap(l)); rest = rest.replace(` ${l} `, ' '); }
    });

    const decade = rest.match(/ (19\d0|20\d0|[2-9]0)s /);
    const year = rest.match(/ (19\d\d|20\d\d) /);
    if (decade) {
      const start = decade[1].length === 4 ? Number(decade[1]) : 1900 + Number(decade[1]);
      Object.assign(filters, { from: start, to: start + 9 });
      filters.labels.push(`${start}s`);
      rest = rest.replace(decade[0], ' ');
    } else if (year) {
      Object.assign(filters, { from: Number(year[1]), to: Number(year[1]) });
      filters.labels.push(year[1]);
      rest = rest.replace(year[0], ' ');
    } else if (/ (old|classic|classics) /.test(rest)) {
      Object.assign(filters, { from: 1900, to: 1989 });
      filters.labels.push('Before 1990');
      rest = rest.replace(/ (old|classic|classics) /, ' ');
    } else if (/ (new|recent|latest) /.test(rest)) {
      Object.assign(filters, { from: 2020, to: 2100 });
      filters.labels.push('2020 onwards');
      rest = rest.replace(/ (new|recent|latest) /, ' ');
    }
    return { filters, rest: rest.trim() };
  }

  const passes = (f, filters) =>
    (!filters.languages.length || filters.languages.includes(f.language)) &&
    (filters.from === null || (f.year >= filters.from && f.year <= filters.to));

  function discover(index, text, ignoreYears = false) {
    const parsed = parseFilters(text);
    const filters = ignoreYears ? { ...parsed.filters, from: null, to: null } : parsed.filters;
    let rest = ` ${parsed.rest} `.replace(/ feel good /g, ' feelgood ');
    Object.entries(ALIASES).forEach(([a, full]) => { rest = rest.replace(` ${a} `, ` ${full} `); });
    const understood = [...filters.labels];

    /* people: a full name, or a distinctive surname/first name */
    const people = [];
    index.people.forEach((display, name) => {
      if (name.includes(' ') && rest.includes(` ${name} `)) { people.push(display); rest = rest.replace(` ${name} `, ' '); }
    });
    contentWords(rest).filter(w => w.length >= 5 && !FEELINGS[w] && !MOODS.some(m => m.words.includes(w))).forEach(w => {
      const hits = index.people.has(w) ? [index.people.get(w)]
        : [...index.people].filter(([name]) => name.split(' ').includes(w)).map(([, display]) => display);
      if (hits.length && hits.length <= 3) { people.push(...hits); rest = rest.replace(` ${w} `, ' '); }
    });
    people.forEach(p => understood.push(p));

    const tokens = rest.trim().split(' ').filter(Boolean);
    const moods = MOODS.filter(m => tokens.some(t => m.words.includes(t)));
    moods.forEach(m => understood.push(m.label));

    const moodWords = new Set(MOODS.flatMap(m => m.words));
    const terms = [];
    tokens.forEach(t => {
      if (FEELINGS[t]) { terms.push({ asked: t, any: FEELINGS[t] }); understood.push(cap(t === 'feelgood' ? 'feel-good' : t)); }
      else if (t.length > 2 && !STOP.has(t) && !moodWords.has(t) && !/^\d+$/.test(t) && t !== 'age') {
        terms.push({ asked: t, any: [t, t.replace(/s$/, ''), `${t}s`] });
        understood.push(`“${t}”`);
      }
    });

    const wantsContent = people.length || moods.length || terms.length;
    const hasFilter = filters.languages.length || filters.from !== null;
    if (!wantsContent && !hasFilter) return { understood, results: [] };

    const results = [];
    for (const f of index.films) {
      if (!passes(f, filters)) continue;
      let score = 0;
      const reasons = [];
      let moodHits = 0;

      moods.forEach(m => {
        const a = f.appearances.find(x => x.slug === m.list);
        if (a) { moodHits++; score += 30 + Math.max(0, 31 - a.rank) / 3; reasons.push({ type: 'list', text: `#${a.rank} in ${a.list}` }); }
      });

      people.forEach(p => {
        if (f.director.includes(p)) { score += 28; reasons.push({ type: 'director', text: `Directed by ${p}` }); }
        else if (f.cast.includes(p)) { score += 24; reasons.push({ type: 'cast', text: `With ${p}` }); }
      });

      terms.forEach(term => {
        const inTitle = words(f.title).some(w => term.any.includes(w));
        const found = term.any.find(w => f.terms.has(w));
        if (inTitle) { score += 12; reasons.push({ type: 'title', text: `“${term.asked}” is in the title` }); }
        if (found) { score += 4 + index.idf(found) * 2; reasons.push({ type: 'note', text: `CineRaaga note mentions “${found}”` }); }
      });

      /* a named person must actually be in the film */
      if (people.length && !people.some(p => f.director.includes(p) || f.cast.includes(p))) continue;
      if (wantsContent && !score) continue;
      if (!wantsContent) {
        score = f.appearances.length * 10 + Math.max(0, ...f.appearances.map(a => 31 - a.rank)) / 3;
        f.appearances.slice(0, 2).forEach(a => reasons.push({ type: 'list', text: `#${a.rank} in ${a.list}` }));
        if (f.review) reasons.push({ type: 'list', text: 'Reviewed by CineRaaga' });
      }
      results.push({ film: f, score: score + moodHits * 10, reasons });
    }
    if (!results.length && !ignoreYears && filters.from !== null && wantsContent) {
      const wider = discover(index, text, true);
      if (wider.results.length) {
        const years = filters.from === filters.to ? `${filters.from}` : `${filters.from}–${Math.min(filters.to, new Date().getFullYear())}`;
        return { ...wider, relaxed: `Nothing from ${years} matches yet. Here are matches from other years.` };
      }
    }
    return { understood, results: results.sort((a, b) => b.score - a.score || b.film.year - a.film.year) };
  }

  /* ---------- entry point ---------- */

  function search(index, query) {
    const q = norm(query);
    if (!q) return { mode: 'empty', understood: [], results: [] };

    /* "Drishyam like movies" first, or its "like movies" reads as the request */
    const like = q.match(/^(.+?) (?:similar|type|like)(?: films?| movies?)$/) ||
      q.match(/(?:^| )(?:similar(?: (?:movies?|films?))? (?:to|like|as)|like|such as) (.+)$/) ||
      q.match(/^(.+?) similar$/);
    const bare = !like && findFilm(index, q).filter(f => squash(f.title) === squash(q));

    if (like || (bare && bare.length)) {
      const { filters, rest } = like ? parseFilters(like[1]) : { filters: parseFilters('').filters, rest: q };
      /* languages typed before "like": "tamil films like drishyam" */
      if (like) {
        const before = parseFilters(q.slice(0, q.indexOf(like[0]))).filters;
        filters.languages.push(...before.languages);
        filters.labels.push(...before.labels);
        if (filters.from === null) { filters.from = before.from; filters.to = before.to; }
      }
      const names = (like ? rest : q).replace(/\b(?:movies?|films?)\b/g, ' ').split(/ (?:or|and) /).map(s => s.trim()).filter(Boolean);
      const seeds = [];
      const unknown = [];
      names.forEach(n => {
        const found = findFilm(index, n);
        if (found.length) seeds.push(found[0]); else unknown.push(n);
      });

      if (seeds.length) {
        const merged = new Map();
        seeds.forEach(seed => similarTo(index, seed).forEach(r => {
          if (seeds.includes(r.film) || !passes(r.film, filters)) return;
          const was = merged.get(r.film.key);
          if (!was) merged.set(r.film.key, { ...r, because: [seed.title] });
          else { was.score += r.score * 0.5; was.because.push(seed.title); }
        }));
        return {
          mode: 'similar', seeds, unknown, understood: filters.labels,
          results: [...merged.values()].sort((a, b) => b.score - a.score),
        };
      }
      if (like) return { mode: 'unknown-film', unknown, understood: [], results: [] };
    }

    return { mode: 'discover', ...discover(index, q) };
  }

  return { build, search, norm };
})();

if (typeof module !== 'undefined') module.exports = CRSearch;
