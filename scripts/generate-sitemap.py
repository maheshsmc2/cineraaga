#!/usr/bin/env python3
"""Generate frontend/navras/sitemap.xml.

Usage (from repo root):  python3 scripts/generate-sitemap.py

Lists the homepage, pages/lists.html, the real review pages, and one URL
per entry in data/lists/index.json (using its "updated_at" as lastmod) —
so a list added, renamed, or updated later is picked up automatically by
re-running this, rather than the sitemap being a hand-typed file of 21+
URLs that quietly goes stale. lastmod for the fixed pages (homepage,
lists.html, reviews) comes from that file's actual last git commit date —
real data, not a guess.

Re-run this whenever a list is added/removed/updated, or a new review
ships, and commit the output — there's no CI step for this yet.
"""
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
NAVRAS_DIR = REPO_ROOT / "frontend" / "navras"
INDEX_PATH = NAVRAS_DIR / "data" / "lists" / "index.json"
SITEMAP_PATH = NAVRAS_DIR / "sitemap.xml"

# The one real deployed origin — see CLAUDE.md's naming section, which
# names this exact string as the permitted literal.
BASE_URL = "https://navras.vercel.app"

# Real, live review pages only — not the *-template.html scaffolds.
# Add a new review's relative path here the day it ships.
REVIEW_PAGES = [
    "pages/dhamaal-4-2026.html",
    "pages/maa-inti-bangaram-2026.html",
]

FIXED_PAGES = ["index.html", "pages/lists.html", *REVIEW_PAGES]


def git_lastmod(relative_path: str) -> str | None:
    """Real last-commit date for a tracked file — not fabricated."""
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cd", "--date=short", "--",
         str(NAVRAS_DIR / relative_path)],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    date = result.stdout.strip()
    return date or None


def url_entry(loc: str, lastmod: str | None) -> str:
    lines = ["  <url>", f"    <loc>{loc}</loc>"]
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    lines.append("  </url>")
    return "\n".join(lines)


def main() -> None:
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))

    entries = []

    for rel in FIXED_PAGES:
        loc = f"{BASE_URL}/" if rel == "index.html" else f"{BASE_URL}/{rel}"
        entries.append(url_entry(loc, git_lastmod(rel)))

    for item in index:
        slug = item["slug"]
        lastmod = item.get("updated_at")
        loc = f"{BASE_URL}/pages/list-{slug}.html"
        entries.append(url_entry(loc, lastmod))

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries) + "\n"
        "</urlset>\n"
    )

    SITEMAP_PATH.write_text(xml, encoding="utf-8")
    print(f"Wrote {SITEMAP_PATH.relative_to(REPO_ROOT)} — "
          f"{len(FIXED_PAGES)} fixed pages + {len(index)} list pages "
          f"= {len(entries)} URLs")


if __name__ == "__main__":
    main()
