# Richard's Guitar Lessons

An [Astro](https://astro.build) website for Richard, a UK-based guitar, bass and ukulele teacher. Styled with Tailwind CSS (loaded via CDN — no build-time Tailwind setup), with content managed via [Decap CMS](https://decapcms.org) and deployed on Cloudflare Pages.

## Getting started

Requires Node.js (18+) and npm.

```bash
npm install
npm run dev      # local dev server
npm run build    # static build → dist/
npm run preview  # preview the production build
```

## Project structure

| Path | Purpose |
| --- | --- |
| `src/pages/*.astro` | The main site pages |
| `src/layouts/Layout.astro` | Shared page shell (head, nav, footer, cal.com, scripts) |
| `src/content/news/` | News posts (Decap CMS) |
| `src/content/lessons/` | Lesson types — prices, durations, cal.com links (Decap CMS) |
| `src/pages/news/[slug].astro` | Dynamic route that renders each news post |
| `src/content.config.ts` | Astro content-collections schemas |
| `public/admin/` | Decap CMS admin UI + generated config |
| `cms/config.template.yml` | Source template for the Decap config |
| `scripts/generate-cms-config.mjs` | Generates `public/admin/config.yml` per branch |
| `workers/decap-oauth/` | Cloudflare Worker that handles the GitHub OAuth handshake |

## Content management (Decap CMS)

- Admin UI: `/admin/`
- Backend: GitHub (`rampant-sloth/richard-guitar-lessons`)
- **Collections**
  - **News** — `src/content/news/*.md` (`title`, `date`, `body`, optional `youtubeId`)
  - **Lesson types** — `src/content/lessons/*.yml` (`title`, `instrument`, `audience`, `durationMinutes`, `price`, `summary`, `calLink`, `order`)

> Content lives in `src/content/` rather than `src/pages/`. Files in `src/pages/` are auto-routed by Astro and would conflict with the `[slug].astro` dynamic route — content collections are the idiomatic Astro pattern.

### GitHub OAuth (Cloudflare Worker)

Decap's GitHub backend needs a server-side OAuth gateway. This lives in its own Worker (`workers/decap-oauth/`):

- `/auth` — redirects to GitHub's authorization page.
- `/callback` — exchanges the code for a token and hands it back to the admin UI.

Deploy it:

```bash
cd workers/decap-oauth
npm install
npx wrangler login
npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET   # paste the OAuth app secret (never commit it)
npx wrangler deploy                                   # note the printed *.workers.dev URL
```

Then wire it up:

- **Cloudflare Pages** → env var `DECAP_OAUTH_BASE_URL` = your Worker URL (e.g. `https://decap-oauth.abc.workers.dev`).
- **GitHub OAuth App** → Authorization callback URL = `<worker-url>/callback`.
- The public client ID lives in `workers/decap-oauth/wrangler.toml` (safe to commit).

### Production / develop

`public/admin/config.yml` is generated at build time by `scripts/generate-cms-config.mjs`:

- Cloudflare Pages branch `main` → production (`branch: main`).
- Any other branch (e.g. `develop`) → that branch's preview deploy (`branch: develop`).

This means the CMS always commits to the branch being edited. Source of truth: `cms/config.template.yml`.

## Scheduling (cal.com)

Live availability and bookings are handled by **cal.com** (not Git):

- The embed is initialised once in `src/layouts/Layout.astro`.
- Primary CTAs use `data-cal-link="richard/30min"` to open the booking popup.
- The booking page (`src/pages/book-trial-lesson.astro`) renders an inline calendar (`#cal-inline`) with the Formspree form as a fallback.

Replace `richard` with the real cal.com username in the Layout and page buttons.

## Deployment (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`; all other branches deploy as previews (e.g. `develop`).
- The OAuth Worker is deployed separately (see above).

## TODO before going live

- [ ] Deploy the OAuth Worker; set `DECAP_OAUTH_BASE_URL` in Cloudflare Pages
- [ ] Set the Worker secret `GITHUB_OAUTH_CLIENT_SECRET`
- [ ] Point the GitHub OAuth app callback at `<worker-url>/callback`
- [ ] Replace the cal.com username `richard` (Layout + buttons) with the real one
- [ ] Set up the `hello@richardguitarlessons.com` mailbox
- [ ] Add real `og:image` social share images

Canonical/OG URLs point at the live domain: `https://richardguitarlessons.com`.

