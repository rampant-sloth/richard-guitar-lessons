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

- **Cloudflare Pages** → env var `DECAP_OAUTH_BASE_URL` (optional — the correct URL is already the default in `scripts/generate-cms-config.mjs`): `https://decap-oauth.rampantsloth-3b0.workers.dev`
- **GitHub OAuth App** → Authorization callback URL = `https://decap-oauth.rampantsloth-3b0.workers.dev/callback`
- The public client ID lives in `workers/decap-oauth/wrangler.toml` (safe to commit).

### Production / develop

`public/admin/config.yml` is generated at build time by `scripts/generate-cms-config.mjs`:

- Cloudflare Pages branch `main` → production (`branch: main`).
- Any other branch (e.g. `develop`) → that branch's preview deploy (`branch: develop`).

This means the CMS always commits to the branch being edited. Source of truth: `cms/config.template.yml`.

## Scheduling (cal.com) — currently disabled

cal.com is **not wired up yet**: Richard (the tutor) doesn't have a cal.com account, so the site
renders **no** scheduling links or third-party scripts. Every "Book a free trial" button links to
the Formspree booking form on `/book-trial-lesson`.

> ⚠️ Do **not** hardcode a cal.com username. `richard` belongs to a real, unrelated cal.com user —
> pointing at it would send students to a stranger's diary.

### Recommended approach at handover

1. Richard registers **his own** cal.com account with a distinctive username
   (e.g. `richardmemczac`, or a brand handle like `richardsguitarlessons`) — never a generic name.
2. Store that username in **one** place — a Cloudflare Pages env var (`PUBLIC_CAL_USERNAME`) or a
   Decap settings field — rather than hardcoding it in components.
3. Re-enable the embed in `src/layouts/Layout.astro` and switch the CTAs to `data-cal-link` **only
   when a username is configured**; otherwise keep the Formspree fallback.
4. The `lessons` collection has an optional `calLink` field for per-lesson event links.

## Deployment (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`; all other branches deploy as previews (e.g. `develop`).
- The OAuth Worker is deployed separately (see above).

## TODO before going live

- [x] Deploy the OAuth Worker (`https://decap-oauth.rampantsloth-3b0.workers.dev`)
- [x] Set the Worker secret `GITHUB_OAUTH_CLIENT_SECRET`
- [ ] Point the GitHub OAuth app callback at `https://decap-oauth.rampantsloth-3b0.workers.dev/callback`
- [ ] Set `DECAP_OAUTH_BASE_URL` in Cloudflare Pages (optional; Production + Preview)
- [ ] Set up cal.com for Richard (own account + distinctive username), then re-enable scheduling
- [ ] Set up the `hello@richardguitarlessons.com` mailbox
- [ ] Add real `og:image` social share images

Canonical/OG URLs point at the live domain: `https://richardguitarlessons.com`.

