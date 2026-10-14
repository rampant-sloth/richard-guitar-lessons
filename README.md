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
| `src/pages/*.astro` | Tiny page shells — each renders one `src/content/pages/*.yml` file |
| `src/layouts/Layout.astro` | Shared page shell (head, theme injection, nav, footer, scripts) |
| `src/components/` | `Hero`, `Sections`, `Cta`, `BookingForm` — the CMS-driven page builder |
| `src/content/pages/` | One YAML file per page — hero, sections, CTA and SEO (Decap CMS) |
| `src/content/news/` | News posts (Decap CMS) |
| `src/content/lessons/` | Lesson types — prices, durations, cal.com links (Decap CMS) |
| `src/content/site/` | Site-wide settings — title, tagline, contact email (Decap CMS) |
| `src/content/theme/` | Accent colour scheme + heading/body fonts (Decap CMS) |
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

| Collection | Files | What it controls |
| --- | --- | --- |
| **Website pages** | `src/content/pages/*.yml` | Every word, image and block on each page |
| **News** | `src/content/news/*.md` | `title`, `date`, `body`, optional `youtubeId` |
| **Lesson types** | `src/content/lessons/*.yml` | `title`, `instrument`, `audience`, `durationMinutes`, `price`, `summary`, `calLink`, `order` |
| **Theme** | `src/content/theme/theme.yml` | Accent colour scheme + heading/body fonts |
| **Site settings** | `src/content/site/settings.yml` | Site title, tagline, contact email, streaming platforms |

### Editing pages (the page builder)

Each page is a single YAML file made of four parts — all editable in the CMS, with labels and
hints explaining what each field does:

1. **Google / search listing** — page title, meta description, and optional social-share overrides.
2. **Top of the page (hero)** — small line above the heading, main heading, intro paragraph,
   an optional image beside the heading, an optional background image, and any number of buttons.
3. **Page sections** — a reorderable list of blocks. Each block has a **block type**:
   - *Card grid* — icon/title/text cards. Give a card a link to make the whole card clickable.
   - *Bullet list* — a row of icon + bold lead-in + text.
   - *Two articles* — two wider cards (line breaks in the text are preserved).
   - *Video gallery* — one card per YouTube video ID.
   - *Lessons & pricing* — pulls straight from the **Lesson types** collection.
   - *Plain text* — heading and body copy only.

   Every block can also set a **background colour** (white / light grey / green tint / dark), a
   **background image** (which overrides the colour), and a **foreground image** shown full width
   inside the block. Icons are simply emoji typed or pasted into the *Icon (emoji)* field.
4. **Closing call to action** — heading, body, button and an optional background image.

The `/book-trial-lesson` page additionally has an editable **Booking form** (labels, placeholders,
required flags, dropdown options and submit text). The Formspree endpoint is pre-filled and only
needs changing if the Formspree account ever moves.

`src/pages/*.astro` are deliberately tiny: they load their YAML file and render `<Hero>`,
`<Sections>` and `<Cta>`. Copy belongs in the CMS, not the page templates.

### Colour scheme, fonts and images

- **Theme → Colours & fonts** swaps the accent palette (emerald, teal, blue, indigo, violet,
  rose, amber, slate) and the heading/body fonts (system, Inter, Poppins, Nunito, Lora,
  Merriweather). Non-system fonts are loaded from Google Fonts at build time.
- The chosen palette is injected as Tailwind's `emerald` scale, so every existing
  `text-emerald-600` / `bg-emerald-50` utility follows the scheme automatically — no page edits.
- **Images** upload into `public/images` (Decap's media folder) and are referenced by URL.
  Any page hero and any section can take a background and/or foreground image.

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

