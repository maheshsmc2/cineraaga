"""Site-wide constants shared by the generator scripts.

BASE_URL is the one canonical public origin. cineraaga.com redirects to it.
Two other hosts serve this codebase and must never appear in a sitemap,
robots.txt or canonical tag:

  cineraaga.vercel.app  — Vercel's default alias for the same deployment
  navras.vercel.app     — a stale pre-rebrand deployment; most current URLs
                          404 there

The sitemap and robots.txt pointed at navras.vercel.app until 2026-11, which
meant search engines were handed 25 URLs on a host where 24 did not exist.
"""

BASE_URL = "https://www.cineraaga.com"
