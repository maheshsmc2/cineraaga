# Learning Log

## 2026-07-19 — Purged fabricated scores and dead legacy code from frontend/navras

**What happened:**

A full audit of `frontend/navras/` turned up fabricated editorial content in far more places than the one file (`movie.html`) that prompted the pass. Fixed, one commit per file/concern:

- `pages/movie.html` — deleted the "Desi Score™ breakdown," six identical hardcoded sub-scores (cultural resonance, music, performances, direction, family viewability, rewatch value) shown on every film regardless of what film it was. Cleaned up the matching `animateBars()` call in `js/movie.js`.
- `frontend/js`, `frontend/css`, `frontend/pages` — deleted outright. Stale duplicates of the pre-Navras frontend; Vercel only ever deploys `frontend/navras`.
- `js/home.js` (previously believed fixed) — three separate live fabrications survived an earlier pass:
  - `editorialStories` hardcoded "Navras 72/100" style badges. Every curated film is currently `score_status:"placeholder"`, so none should show a badge at all.
  - `loadOttPosterGrid` rendered a hand-typed fake number as the score badge instead of the real `vote_average`/`vote_count` TMDb had already returned in the same request.
  - The homepage "Explore lists" section used a hardcoded array with invented counts ("50 Greatest Bollywood Films" when only 10 are actually curated) and fake preview titles, totally disconnected from `data/lists/*.json`. Rewired to fetch the real data.
- `js/mood.js` — the entire mood-search page ran on a hand-typed `filmDatabase` with fabricated Navras scores per film, and the nine rasa cards showed fake film counts ("142 films" for Shringara; the real number is 16). Rewrote to fetch `data/mood/*.json` for all nine rasas and apply the score display rule.
- `pages/article.html` — a "Best Malayalam Films of 2025" article with hardcoded "NAVRAS" score badges (91/88/85/83/72) for films that are curated-but-placeholder or not curated at all.
- `pages/review-template.html` — same "Desi Score breakdown" fabrication as `movie.html`, in the hand-editing review template. The single Navras-score field in that template is legitimate (real schema, editor fills it in); the six-dimension breakdown is not — that concept doesn't exist anywhere in the data model.
- `pages/lists.html` + `js/lists.js` — the "Featured list" banner at the top of the Lists page hardcoded a "50 films" count (real: 10) and a top-5 order (Mughal-E-Azam, DDLJ, Lagaan, Dangal, 3 Idiots) that didn't even match the real ranked order in `data/lists/bollywood50.json`. Rewired to render from the actually-loaded list data.
- `js/main.js` — `rasaData` and `ottData`, two more hand-typed fabricated-score objects, turned out to be pure dead code: the `.mood-card`, `#moodResultsLabel`, and `#ottCardsGrid` elements they targeted don't exist anywhere in the current `index.html`. Worse, the init call `selectMood('shringara')` threw an uncaught `TypeError` on every homepage load, which silently killed the rest of that `DOMContentLoaded` handler — breaking the hamburger menu, the language switcher, and the hero search's Enter-to-browse. Confirmed the crash with a direct console reproduction, removed the dead code, confirmed the hamburger menu works again.

**Concept:**

The project's non-negotiable rule is that Navras Scores and rasa tags are hand-assigned editorial judgments, never derived algorithmically, and a score badge only renders when `score_status === "official"` — which, as of this pass, is zero films in the entire curated dataset. Any numeric "Navras" badge visible anywhere on the site right now is therefore fabricated by construction, whether it's baked into JS as a data object or typed directly into HTML.

**Traps:**

- A file being labeled "already fixed" in a previous pass doesn't mean it's fully fixed — `home.js` and `main.js` were both marked done and both still had live fabrication. Worth re-grepping fixed files for `score:`, `Navras`, and hardcoded numbers rather than trusting the label.
- Dead code isn't harmless. `main.js`'s unused mood-card feature wasn't just clutter — an unguarded `document.getElementById(...).textContent = ...` on a missing element threw and silently broke unrelated same-handler functionality (hamburger, language switcher, search). Always check whether a "leftover" function is still being *called*, not just whether its target markup still exists.
- Browser HTTP caching made local verification unreliable — editing a JS file and reloading the same `localhost` origin kept serving the old cached script even across new tabs. Confirmed fixes by serving from a fresh port instead of fighting the cache.
- Two independent CSS files (`movie.css`, `review.css`) still contain orphaned `.desi-bar-*` / `.rv-desi-*` rules after the matching HTML was deleted. Left untouched per explicit instruction not to touch CSS — dead but harmless (no matching elements left to select).

## 2026-07-21 — CineRaaga brand rollout: logo, favicon, site-wide rebrand

**What happened:**

Rolled out the new CineRaaga brand assets and renamed the site across every user-facing surface, one commit per step:

- Added the three supplied brand PNGs (full wordmark, nav wordmark, favicon "C" mark) under the new `frontend/navras/images/brand/`.
- Replaced the SVG-mark + "Navras" text logo in the header with an `<img>` of the new wordmark (`height: 36px`, width auto) on `index.html` and every page in `pages/`, keeping the "Cinema · Music · Art" tagline beside it.
- Discovered the supplied PNGs had no alpha channel — flat RGB with a near-white (~244–254) background baked in, which rendered as a visible white box on the dark navbar. Unblended the near-white background into real transparency (recover true color via `alpha = 255 - min(R,G,B)`, then un-premultiply the RGB channels), confirmed by compositing onto a dark background before shipping.
- Added `<link rel="icon" type="image/png">` favicon tags to every page, path-adjusted for root (`index.html`) vs `pages/` depth.
- Swept every user-facing "Navras" brand mention (page titles, meta descriptions, section headers like "Trending on Navras", footer logo/column/copyright, editorial bylines, "Curated by Navras" copy) to "CineRaaga" — cataloged all ~150 occurrences across HTML/JS first, classified each as brand vs. methodology, then applied as exact literal-string replacements per file (not a blanket regex) so nothing genuinely ambiguous got auto-changed.
- Left untouched, deliberately: `navras_score` fields, `NAVRAS_CONFIG`, any `.navras-*`/`.rv-navras-*` CSS class name, "Navras Score"/"Navras /100"/"72 Navras" style score labels (including the "Navras score guide" widget), the `frontend/navras/` folder and all file names, and the real infrastructure strings `hello@navras.app` / `navras.vercel.app`.

**Concept:**

"Navras" now means two different things in this codebase and the task required telling them apart: the **site brand** (renaming to CineRaaga) and the **scoring methodology name** (staying "Navras Score" — it's the hand-assigned rating system, not the site identity, and the task explicitly protected it). Treating every string match the same way would have either left the rebrand half-done or broken the one non-negotiable methodology label from the previous cleanup pass.

**Traps:**

- Supplied "final" brand assets aren't guaranteed to be production-ready — always open image files and check the actual pixel data (`img.mode`, alpha extrema) rather than trusting that a logo PNG is transparent because it looks transparent in a preview tool that renders a checkerboard for missing alpha.
- `preview_start`'s named-server launcher runs child processes in a sandbox where even `os.listdir('.')` and `os.getcwd()` raise `PermissionError` — this broke a plain `python3 -m http.server --directory ...` command in ways that had nothing to do with the command being wrong. `python3 -P` (isolate from cwd) got the process to start, but absolute/relative directory serving still 404'd in that sandbox; starting the same static server via the Bash tool instead worked immediately. When a `.claude/launch.json` server won't start for reasons that look environmental rather than command-related, falling back to Bash + `preview_start({url})` is a faster path than debugging the sandbox.
- Browser HTTP/tab caching (same issue as the previous entry) made two separate pieces of this work look broken when they weren't — the logo transparency fix and the text rebrand both initially "failed" in a screenshot until a hard reload (`location.reload(true)`) proved the served file was already correct.

## 2026-07-25 — First real review published: Dhamaal 4 (2026)

**What happened:**

Published `pages/dhamaal-4-2026.html` — the first piece of real editorial content on CineRaaga, as opposed to template/sample copy. Copied `pages/review-template.html` and filled every "CHANGE THIS" marker (title, TMDb ID, category pills, meta row, rasas, one-line verdict, Navras Score of 42 with the `red` color class, watch status, byline, and the full review body) from Mahe's supplied content, verified it renders correctly (poster loads from the TMDb ID, score badge color, verdict box), then committed and pushed.

Workflow behind this one: Mahe records the review as voice notes, cleans up the transcript into structured copy with Claude (chat), then hands the finished text to Claude Code to slot into the template and publish. This log entry exists to mark that this pipeline produced a real, shipped page for the first time.

**Concept:**

Filling a template isn't the same job as writing one. The task was explicit that nothing should be invented beyond the supplied content — several "CHANGE THIS" markers (the three-word tags, IMDb/RT scores, the "trending" sidebar, related-reviews links) had no corresponding data in this batch, so the instruction was to leave the template's original placeholder values in place rather than guess. A published page can legitimately still contain scaffolding left for a later pass, as long as that's a deliberate, stated choice and not a gap nobody noticed.

**Traps:**

- The template's four generic `.rv-para` slots (opening hook / good / problem / final verdict) don't map onto arbitrarily-named content sections. Mahe's copy came pre-divided into five labeled sections (Mood, Story, Direction, Performances, CineRaaga Take) — one more than the template had paragraph slots for. Resolved by reading where each was explicitly aimed: the first four filled the `.rv-body` paragraphs in the order given, and "CineRaaga Take (final verdict box)" was explicit enough about its destination to justify adding one `<p class="rv-para">` inside `.rv-verdict-box` — reusing an existing class rather than writing new CSS.
- "Do not invent details" cuts both ways: it blocks filling gaps with made-up content, but it doesn't mean deleting or "fixing" content that's merely mismatched to the new film (leftover Saiyaara-era three-word tags, IMDb/RT numbers, and a "More Hindi romance" sidebar all stayed untouched here, exactly as instructed, even though they visibly don't describe a comedy sequel).

## 2026-07-30 — Home page was serving global TMDb data, not Indian films

**What happened:**

Mahe reported the home page showing wrong films — Western titles like Smile 2, Anora, Damsel, Hellboy instead of the expected Indian lineup (Peddi, Maa Inti Bangaram, Dhamaal 4, Alpha, Idhayam Murali, Lenin, Carry On Jatta 4). Root-caused to two separate bugs in `js/home.js`, both fixed:

1. **"In Cinemas Now" ran on a hardcoded ID list that was simply wrong.** `currentInCinemas` had specific TMDb IDs with comments claiming which film each was ("Saiyaara (Hindi)", "Vikram (Tamil)", etc.) — every single one, checked individually against the live TMDb API, resolved to a completely unrelated title. This had been silently masked by an unrelated validation bug fixed in an earlier session; fixing that bug made the (broken) curated path start "succeeding" instead of falling through to the properly-filtered `now_playing` fallback that was already there. Replaced the whole hardcoded list with a live `region=IN` + Indian-language-filtered query, with Dhamaal 4 (our one real review) pinned first by TMDb ID.
2. **TMDb's `/discover` endpoints only accept a single `with_original_language` value.** Several functions (`loadTV`, `loadComingSoon`, `loadPopularNow`) passed comma-separated lists like `'ta,te,ml,kn'` expecting an OR match — TMDb silently returns zero results for that instead of erroring, so every "South Indian supplement" call in the codebase had been contributing nothing. `loadTV()` was explicitly compensating by padding its row with non-Indian trending shows. Added a `discoverByLanguages()` helper that fires one request per language and merges results, and removed the "mix Indian + global" fallback now that the real supplement works.

Also fixed a stale score (62 vs. the correct 42) that had drifted across the homepage hero card and the `dhamaal-4-2026.html` review page itself (poster badge, score row, title, meta description), and removed a Music section that had been added to the review outside the locked Mood → Script → Direction → Acting → CineRaaga Take format.

**Concept:**

A filter that "looks" correct in the code (region: 'IN', a `lang:` comment on every array entry) is not the same as a filter that's actually being exercised. Two completely different failure modes — wrong hardcoded IDs, and a misunderstood API parameter — both produced the identical symptom (non-Indian content on an Indian-only platform), and both had been sitting unnoticed because their broken paths returned *successfully*, just with the wrong data, rather than erroring.

**Traps:**

- Silent wrong-data bugs don't show up in `console.error` — they show up as "why is Anora on my Indian cinema homepage." When a data-quality complaint comes in, verify the actual API responses for the specific IDs/params in use rather than trusting that filter-shaped code is filtering.
- Fixing one bug can unmask another. The `!data.success === false` operator-precedence fix from the previous session was correct in isolation, but it flipped `loadCinemas()` from "always silently fails to the good fallback" to "always succeeds with bad curated data" — a net regression until the curated list itself was replaced.
- TMDb's discover-family endpoints accept `with_genres` as a comma/pipe list (AND/OR) but `with_original_language` as a single value only — an easy assumption to get wrong by analogy, and one that fails without any error, just an empty `results` array.
