# Richard's Guitar Lessons

A static website for Richard, a UK-based guitar, bass and ukulele teacher. Built with plain HTML and Tailwind CSS (loaded via CDN) — no build tools, no npm, no framework.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage (hero, features, routing cards) |
| `online-guitar-lessons-kids.html` | Kids & Exam students |
| `adult-online-guitar-lessons.html` | Adults & Hobbyists |
| `about-richard.html` | About Richard & technical setup |
| `book-trial-lesson.html` | Contact / booking (Calendly/Cal.com placeholder) |

## Local preview

Open any `.html` file directly in a browser, or serve the folder:

```
npx serve .
```

## Deployment (Cloudflare Pages)

- Build command: _none_ (static files)
- Publish directory: `/` (project root)

## TODO before going live

- [ ] Set up the `hello@richardguitarlessons.com` mailbox
- [ ] Embed the Calendly / Cal.com booking widget on `book-trial-lesson.html`
- [ ] Add real `og:image` social share images

Canonical/OG URLs already point at the live domain: `https://richardguitarlessons.com`.
