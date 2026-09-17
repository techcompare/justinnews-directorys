# Daily Tools HQ — showcase site

A static, no-build tool catalog site. Everything you'll ever want to change day-to-day
lives in two JSON files — you never need to touch the HTML, CSS, or JS.

## Files you edit

- **`tools.json`** — add, remove, or update tools. Each entry:
  ```json
  {
    "name": "PDF Compressor",
    "category": "PDF",
    "description": "One sentence on what it does.",
    "url": "https://github.com/you/pdf-compressor",
    "status": "live",
    "icon": "PDF"
  }
  ```
  - `status`: `"live"` makes it clickable; anything else (e.g. `"coming soon"`) greys it
    out and disables the link.
  - `category` drives the filter pills automatically — add a new category just by using
    a new value here, no other changes needed.
  - `icon`: a short 2–4 letter tag shown in the icon box (e.g. `PDF`, `IMG`, `DEV`).

- **`config.json`** — site name, tagline, hero copy, contact email, GitHub link, and your
  AdSense publisher ID. Every page pulls from this file, so editing it once updates the
  whole site.

## Files you (almost) never touch

- `index.html`, `about.html`, `privacy.html` — structure only, content is injected from
  the JSON files at load time.
- `style.css` — visual design.
- `script.js` — reads the JSON and renders the page.

## Deploying to GitHub Pages

1. Create a new GitHub repo (public repos get free Pages hosting).
2. Push everything in this folder to the repo root.
3. In the repo: **Settings → Pages → Source**, choose the `main` branch and `/ (root)`,
   save.
4. Your site goes live at `https://YOUR-USERNAME.github.io/YOUR-REPO/` within a minute or
   two. To use a custom domain instead, add a `CNAME` file with your domain name, and
   point your domain's DNS at GitHub Pages (see GitHub's docs on custom domains).

From then on, editing a tool is: edit `tools.json` in the GitHub web UI → commit → the
live site updates automatically within a minute, no redeploy step needed.

## Getting AdSense-ready

AdSense reviews the whole site, not just one page. This site ships with the basics
covered, but a few things are on you before you apply:

- [ ] **Real content**: fill `tools.json` with tools that actually work (the ones here
      are placeholders pointing at repos that don't exist yet). AdSense rejects sites
      that look empty or under construction.
  Removed hollow example: none of the sample tools' GitHub links are real yet — replace
  the `url` fields with your actual repos or hosted tool pages before applying.
- [ ] **Custom domain** — a `github.io` subdomain can work, but a custom domain reads
      more credibly to reviewers and is easy to add (see above).
- [ ] **`ads.txt`** — already included with your AdSense publisher ID
      (`pub-9715275055190011`, reused from your existing AdSense account). If this site
      isn't meant to run under that same account, swap the ID in `ads.txt` and in
      `config.json`'s `adsensePublisherId`.
- [ ] **Privacy policy** — included (`privacy.html`), already mentions AdSense/cookies.
      Review the wording once you know exactly what (if any) analytics you'll add.
- [ ] **About + contact** — included (`about.html`, plus an email link in the footer).
- [ ] **Apply** at [adsense.google.com](https://adsense.google.com), add this site's
      domain, and wait for review (can take from a few days to a few weeks).
- [ ] **After approval**: each HTML file has a commented-out `<script>` tag near the top
      for the AdSense auto-ads snippet — uncomment it (or paste the exact snippet AdSense
      gives you) once you're approved. Don't add it before approval; sites with ad code
      but no approved account can get flagged.

## Notes

- All tools are assumed to run client-side (in the visitor's browser) — the privacy
  policy is written on that basis. If any tool actually uploads files to a server,
  update `privacy.html` to say so.
- No external JS frameworks or build tools — just fetch + vanilla JS, so there's nothing
  to install or compile before deploying.
