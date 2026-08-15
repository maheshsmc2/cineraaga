# CineRaaga

Editorial site about Indian cinema — reviews, ranked lists, rasa-based discovery.
Hand-curated, not algorithmically generated. That distinction drives most of the
rules below.

Read `docs/LEARNING_LOG.md` before non-trivial work. It is the record of what has
already gone wrong here and why the current design is the way it is.

## The non-negotiable rule: never fabricate editorial content

Most of this project's history is cleaning up invented content. Do not add to it.

- **Navras Scores and rasa tags are hand-assigned editorial judgments.** Never
  derive them, never estimate them, never carry one over from a similar film.
  A score badge renders only when `score_status === "official"`.
- **Never invent film metadata** — counts, rankings, dates, blurbs, "top 5"
  orders, platform availability. If it isn't in the data files or a live API
  response, it doesn't go on the page.
- **A template field that looks like it just needs data is not a field that was
  supplied.** Leave placeholders alone rather than filling them with plausible
  numbers. Say what you left unfilled.
- **When a section's label makes a claim ("new on OTT", "coming soon",
  "most searched"), the source must actually support that claim.** TMDb
  popularity data does not track Indian OTT windows. Where no reliable source
  exists, use a hand-maintained file under `data/` seeded empty.
- **Empty is fine; fake is not.** Hide the section or show an honest empty
  state. Never fall back to stale catalog content.

Fabrication lives in the render path too, not just the data. Deleting a JSON file
doesn't remove the generator that would refill it. Dead code targeting a
non-existent element is one `<div>` away from going live again.

## Layout

- **`frontend/navras/` is the only frontend that deploys** (Vercel). The old
  `frontend/js|css|pages` were deleted as stale duplicates — don't recreate them.
- `data/lists/*.json` + `index.json` — ranked lists. `count` in the index is a
  hand-maintained mirror and drifts; **count real `entries` arrays**, never the
  index field.
- `data/mood/*.json` — the nine rasas.
- `data/coming_to_ott.json`, `data/new_on_ott.json` — hand-maintained, seeded
  empty. TMDb can't source these.
- `pages/review-template.html` — locked structure:
  **Mood → Story → Direction → Performances → CineRaaga Take**. Don't add sections.
- `css/style.css` loads before `home.css` — check for a duplicate selector in the
  later file before adding specificity or `!important`.

## Naming: "Navras" means two things

- **Site brand → CineRaaga.** Page titles, meta, headers, footer, bylines.
- **Scoring methodology → stays "Navras".** `navras_score`, `NAVRAS_CONFIG`,
  `.navras-*` CSS classes, "Navras Score" labels, the `frontend/navras/` path,
  and `hello@navras.app` / `navras.vercel.app`.

Never blanket-regex across this distinction. Classify each occurrence.

## Working style

- **One commit per file or concern**, not one big commit.
- **Append to files, don't overwrite.** A spec giving "the full contents" of a
  file usually means "add this" — check what's there first. This nearly deleted
  13 lists once.
- **New pages must handle old data shapes.** Lists have two schema generations
  (with and without `tmdb_id`); there's a title-search poster fallback for the
  older one.
- **A file marked "already fixed" in a previous pass may not be.** Re-grep for
  `score:`, `Navras`, and hardcoded numbers rather than trusting the label.
- **Check whether "leftover" code is still *called*,** not just whether its
  markup exists. An unguarded write to a missing element threw and silently
  killed the hamburger menu, language switcher, and search on every page load.
- **Log substantive passes to `docs/LEARNING_LOG.md`** — What happened / Concept /
  Traps.

## Verification gotchas

- Browser HTTP caching has faked failures repeatedly. Hard-reload or serve from a
  fresh port before believing a fix didn't work.
- `preview_start`'s named-server launcher sandbox breaks `python3 -m http.server`.
  Start static servers via Bash, then `preview_start({url})`.
- Before assuming you caused a rendering artifact, `git stash` and check whether
  it predates your change.
