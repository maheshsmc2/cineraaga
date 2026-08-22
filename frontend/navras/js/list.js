/* ===========================
   SINGLE RANKED LIST PAGE
   Reads ?slug= and renders data/lists/<slug>.json
   =========================== */

const CATEGORY_LABEL = {
  evergreen: 'All time',
  ott: 'OTT picks',
  trending: 'Trending',
  language: 'By language',
  awards: 'Awards',
  genre: 'By genre',
  actor: 'By actor',
  director: 'By director',
  setting: 'By setting'
};

const RASAS = ['shringara', 'hasya', 'karuna', 'raudra', 'bhayanaka',
               'bibhatsa', 'adbhuta', 'shanta', 'veera'];

function cap(s) {
  return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Score display rule — identical to the rest of the site: only a film whose
   score_status is "official" shows a real Navras Score. Anything else shows
   a dash, in muted colours, so a placeholder can never be mistaken for an
   editorial verdict. */
function scoreParts(film) {
  const official = film.score_status === 'official' && typeof film.navras_score === 'number';
  if (!official) return { show: false, display: '—', bg: 'rgba(255,255,255,0.10)' };
  const s = film.navras_score;
  return {
    show: true,
    display: s,
    bg: s >= 85 ? '#1A7A3C' : s >= 65 ? '#C47A00' : '#C0392B'
  };
}

function renderRow(entry, i) {
  const f = entry.film || {};
  const rank = entry.rank || i + 1;
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
  const sc = scoreParts(f);
  const lang = f.language ? f.language.charAt(0).toUpperCase() + f.language.slice(1) : '';
  const meta = [lang, f.year].filter(Boolean).join(' · ');
  const bg = f.color || '#1a1a2e';
  const why = (entry.why_it_ranks || '').trim();

  return `
    <div class="lp-row" data-tmdb-id="${f.tmdb_id || ''}" data-rank="${rank}">
      <div class="lp-rank ${rankClass}">${rank}</div>
      <div class="lp-poster" id="lp-poster-${rank}"
           style="background:linear-gradient(160deg,${bg},${bg}88);">
        ${sc.show ? `<div class="lp-poster-score" style="background:${sc.bg}">${sc.display}</div>` : ''}
      </div>
      <div class="lp-info">
        <div class="lp-film-title">${escapeHtml(f.title)}</div>
        ${meta ? `<div class="lp-film-meta">${escapeHtml(meta)}</div>` : ''}
        ${entry.blurb ? `<div class="lp-blurb">${escapeHtml(entry.blurb)}</div>` : ''}
        ${(f.rasas || []).length
          ? `<div class="lp-rasas">${f.rasas.map(r => `<span class="rtag">${escapeHtml(r)}</span>`).join('')}</div>`
          : ''}
        ${why ? `
          <div class="lp-why">
            <button class="lp-why-toggle" type="button">Why it ranks here ↓</button>
            <div class="lp-why-body" hidden>${escapeHtml(why)}</div>
          </div>` : ''}
      </div>
    </div>`;
}

/* Posters come from TMDb by tmdb_id — the new list schema carries one.
   The older curated lists (bollywood50, best2025, …) predate that field and
   only have title + year, so those fall back to a title search, matching
   what the homepage list cards already do. Either way a failed lookup just
   leaves the entry's colour block, so a curated list is never blocked on TMDb. */
async function posterPathFor(film) {
  if (film.tmdb_id) {
    const data = await TMDB.get(`/movie/${film.tmdb_id}`, {});
    if (data?.poster_path) return data.poster_path;
  }
  if (film.title) {
    const params = { query: film.title };
    if (film.year) params.year = film.year;
    const search = await TMDB.get('/search/movie', params);
    return search?.results?.[0]?.poster_path || null;
  }
  return null;
}

async function loadPosters(entries) {
  await Promise.all(entries.map(async (entry, i) => {
    const f = entry.film || {};
    const rank = entry.rank || i + 1;
    try {
      const path = await posterPathFor(f);
      if (!path) return;
      const holder = document.getElementById(`lp-poster-${rank}`);
      if (!holder) return;
      const img = document.createElement('img');
      img.src = TMDB.poster(path, 'w185');
      img.alt = f.title || '';
      img.loading = 'lazy';
      holder.prepend(img);
    } catch {}
  }));
}

function bindWhyToggles() {
  document.querySelectorAll('.lp-why-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.parentElement.querySelector('.lp-why-body');
      const open = !body.hidden;
      body.hidden = open;
      btn.textContent = open ? 'Why it ranks here ↓' : 'Why it ranks here ↑';
    });
  });
}

async function initListPage() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const root = document.getElementById('listRoot');
  if (!root) return;

  if (!slug) {
    root.innerHTML = `
      <div class="lp-empty">
        <div class="lp-empty-title">No list selected</div>
        <div class="lp-empty-sub">Head back to <a href="lists.html">all CineRaaga lists</a>.</div>
      </div>`;
    return;
  }

  let list;
  try {
    const res = await fetch(`../data/lists/${slug}.json`);
    if (!res.ok) throw new Error('not found');
    list = await res.json();
  } catch {
    root.innerHTML = `
      <div class="lp-empty">
        <div class="lp-empty-title">List not found</div>
        <div class="lp-empty-sub">We couldn't find a list called "${escapeHtml(slug)}".
          Browse <a href="lists.html">all CineRaaga lists</a> instead.</div>
      </div>`;
    return;
  }

  const entries = list.entries || [];
  const updated = list.updated_at || list.updated;
  document.title = `${list.title} | CineRaaga`;
  const crumb = document.getElementById('lpCrumb');
  if (crumb) crumb.textContent = list.title;

  /* A list may name the rasa it belongs to. Only the nine are accepted —
     an unknown value renders nothing rather than a broken image path. The
     rasa is an editorial assignment like any other: it appears only when
     the list file says so, never inferred from the category or title. */
  /* Films the editor considered and left out. Deliberately unranked and
     unlinked — they are context for where the cut fell, not list entries. */
  const mentions = Array.isArray(list.honourable_mentions) ? list.honourable_mentions : [];

  const rasa = RASAS.includes(list.rasa) ? list.rasa : null;
  const rasaArt = rasa
    ? `<figure class="lp-rasa">
         <img src="../images/rasas/${rasa}.png" alt="${escapeHtml(cap(rasa))} — the rasa this list belongs to" />
         <figcaption class="lp-rasa-name">${escapeHtml(cap(rasa))}</figcaption>
       </figure>`
    : '';

  root.innerHTML = `
    <div class="lp-head">
      <div class="lp-head-top">
        <div class="lp-head-text">
          <div class="lp-category">${escapeHtml(CATEGORY_LABEL[list.category] || list.category || 'List')}</div>
          <h1 class="lp-title">${escapeHtml(list.title)}</h1>
          ${list.description ? `<div class="lp-desc">${escapeHtml(list.description)}</div>` : ''}
        </div>
        ${rasaArt}
      </div>
      <div class="lp-meta">
        <span>Curated by CineRaaga</span>
        ${entries.length ? `<span>·</span><span>${entries.length} films</span>` : ''}
        ${updated ? `<span>·</span><span>Updated ${escapeHtml(updated)}</span>` : ''}
      </div>
    </div>
    ${list.intro ? `<div class="lp-intro">${escapeHtml(list.intro)}</div>` : ''}
    ${entries.length
      ? `<div class="lp-films">${entries.map(renderRow).join('')}</div>`
      : `<div class="lp-empty">
           <div class="lp-empty-title">This list is being curated</div>
           <div class="lp-empty-sub">No films have been added yet — CineRaaga hand-ranks every entry,
             so this one is still being written. Check back soon.</div>
         </div>`}
    ${mentions.length
      ? `<div class="lp-mentions">
           <div class="lp-mentions-head">Just outside the top ${entries.length}</div>
           <div class="lp-mentions-list">${mentions.map(m =>
             `<span class="lp-mention">${escapeHtml(m.title)}${m.year ? ` <span class="lp-mention-year">${escapeHtml(String(m.year))}</span>` : ''}</span>`
           ).join('')}</div>
         </div>`
      : ''}`;

  if (entries.length) {
    bindWhyToggles();
    loadPosters(entries);
  }
}

document.addEventListener('DOMContentLoaded', initListPage);
