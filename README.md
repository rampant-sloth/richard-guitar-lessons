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
| `src/pages/*.astro` | The main site pages (migrated from the old `.html` files) |
| `src/layouts/Layout.astro` | Shared page shell (head, nav, footer, scripts) |
| `src/content/news/` | News posts (managed by Decap CMS) |
| `src/pages/news/[slug].astro` | Dynamic route that renders each news post |
| `src/content.config.ts` | Astro content-collections schema for `news` |
| `public/admin/` | Decap CMS admin UI + config |

## Content management (Decap CMS)

- Admin UI: `/admin/`
- Backend: GitHub (`rampant-sloth/richard-guitar-lessons`)
- The "News" collection stores markdown in `src/content/news/` with fields: `title`, `date`, `body`, and an optional `youtubeId`.

### GitHub OAuth authentication

Decap's GitHub backend needs a server-side OAuth gateway (GitHub won't do the token exchange from the browser). Two Cloudflare Pages Functions implement it:

- `functions/api/auth.js` — redirects to GitHub's authorization page.
- `functions/api/callback.js` — exchanges the code for a token and posts it back to the admin UI.

**Environment variables** (set in the Cloudflare Pages dashboard):

- `GITHUB_OAUTH_CLIENT_SECRET` — **required** (your GitHub OAuth app client secret; keep private).
- `GITHUB_OAUTH_CLIENT_ID` — optional; defaults to `Ov23li6duCdaQWAPpend` (already baked into the functions).

**GitHub OAuth app settings:**

- Authorization callback URL: `https://richardguitarlessons.com/api/callback`

> Note: news posts live in `src/content/news/` rather than `src/pages/news/`. Files in `src/pages/` are auto-routed by Astro and would conflict with the `[slug].astro` dynamic route — content collections are the idiomatic Astro pattern for CMS-managed markdown.

## Deployment (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`

## TODO before going live

- [ ] Set `GITHUB_OAUTH_CLIENT_SECRET` in Cloudflare Pages (client ID `Ov23li6duCdaQWAPpend` is already baked in)
- [ ] Confirm the GitHub OAuth app callback URL is `https://richardguitarlessons.com/api/callback`
- [ ] Replace `YOUR_FORM_ID` in `src/pages/book-trial-lesson.astro` with your real Formspree form ID
- [ ] Set up the `hello@richardguitarlessons.com` mailbox
- [ ] Add real `og:image` social share images

Canonical/OG URLs point at the live domain: `https://richardguitarlessons.com`.

