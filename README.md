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
| **Theme** | `src/content/theme/theme.yml` | Preset or custom accent, background/text/border colours, corner radius, fonts |
| **Site settings** | `src/content/site/settings.yml` | Site title, tagline, contact email, streaming platforms, social media links |

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

### Theme: colours, fonts, corners — with a live preview

**Theme → Colours & fonts** controls the whole look and feel. The preview pane beside it renders a
miniature of the real pages (header, hero, cards, pricing, CTA and footer, with Lorem Ipsum filler
copy) that redraws as each control changes.

| Control | What it does |
| --- | --- |
| **Preset colour scheme** | A ready-made accent palette: emerald, teal, blue, indigo, violet, rose, amber, slate |
| **Accent colours** (4 hex) | Override the preset: main, hover/darker, light, pale |
| **Light appearance** (6 hex) | Page background, cards/panels, section bands, headings, body text, borders |
| **Dark appearance** (6 hex) | The same six, for dark mode and the footer |
| **Corner radius** | Sharp / subtle / rounded / pill |
| **Heading & body font** | System, Inter, Poppins, Nunito, Lora, Merriweather |
| **Dark / light switch** | Show or hide the header button, what visitors see first, and the tooltip wording |

Every colour box is optional — leave it blank to fall back to the preset scheme (accents) or the
built-in default (neutrals). Boxes accept the colour picker *or* a typed hex code like `#059669`.

How it is wired:

- The accent (preset **or** custom hex) is injected as Tailwind's `emerald` palette, so every
  existing `text-emerald-600` / `bg-emerald-50` utility follows it with no page edits.
- The neutrals become CSS custom properties (`--theme-bg`, `--theme-surface`, `--theme-band`,
  `--theme-text`, `--theme-muted`, `--theme-border`, `--theme-deep`) that switch automatically
  under `.dark`; components reference them as `bg-[var(--theme-surface)]` etc.
- `cornerRadius` overrides Tailwind's `rounded-lg` / `rounded-xl` / `rounded-2xl` scale.
- Non-system fonts load from Google Fonts at build time (and in the admin preview).

The preview lives in `public/admin/theme-preview.js`, registered with
`CMS.registerPreviewTemplate('theme', …)`; `public/admin/index.html` loads it. It mirrors the same
preset/default tables as `src/layouts/Layout.astro` — **keep those two in sync**.

`node scripts/smoke-theme-preview.mjs` stubs Decap's React `h` global and checks the preview renders
and honours custom hexes. The admin UI itself needs GitHub OAuth, so it can't be driven headlessly.

#### The dark / light switch

A sun/moon button sits in the header of every page (desktop and mobile). Behaviour:

- A visitor's click is saved to `localStorage` under `rgl-theme` and re-applied **before first paint**
  by an inline script in `<head>`, so there is never a flash of the wrong theme.
- **Auto** (default) — visitors who have never chosen follow their device's `prefers-color-scheme`,
  and keep following it if they change it. Falls back to dark when the device is unsure, which is the
  site's original behaviour.
- **Always start in light / dark** — that mode is used until the visitor picks otherwise.
- Turning **Show the switch** off removes the button *and* ignores any previously saved choice, so
  every visitor gets the mode selected above.

The preview pane shows the same button, and clicking it flips the preview between the light and dark
palettes — so both sets of colours can be checked without leaving the CMS.

- **Images** upload into `public/images` (Decap's media folder) and are referenced by URL.
  Any page hero and any section can take a background and/or foreground image.

### Social media links (footer)

**Site settings → Social media links** holds one box per platform. Paste a full URL to show that
icon in the footer; clear the box to hide it. No reordering or new platforms without a code change.

| Platform | Current value |
| --- | --- |
| Facebook | `https://facebook.com/richardguitartuition` |
| Instagram | `https://instagram.com/richtearoo` |
| TikTok | `https://tiktok.com/@livegarflove` |
| Twitch | `https://twitch.tv/richtearoo` |
| WhatsApp | *(blank — hidden, ready to switch on)* |

Icons are the official [Simple Icons](https://simpleicons.org) brand glyphs (CC0), inlined in
`src/components/SocialLinks.astro` so the footer makes **no** third-party requests. Each one also
gets its brand colour on hover. WhatsApp is intentionally blank — paste a `https://wa.me/<number>`
link to reveal it later.

> Adding a *new* platform (e.g. YouTube, Bluesky) is a one-line change in
> `src/components/SocialLinks.astro`: the SVG path plus a brand hover colour. The schema in
> `src/content.config.ts` and the CMS field list need the matching new key.

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

