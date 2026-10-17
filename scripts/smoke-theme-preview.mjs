// Smoke test for the Decap theme preview (public/admin/theme-preview.js).
//
// The admin UI needs GitHub OAuth, so it can't be driven from CI. Instead this stubs
// Decap's globals (CMS + React's `h`) and an Immutable-style `entry`, then checks the
// preview component renders and honours custom hex colours.
//
// Run with: node scripts/smoke-theme-preview.mjs

import { readFileSync } from 'node:fs';

const templates = {};

const win = {
  CMS: {
    registerPreviewTemplate(name, component) {
      templates[name] = component;
    },
    registerPreviewStyle() {},
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children }),
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  console,
};

const read = (name) => readFileSync(new URL(`../public/admin/${name}`, import.meta.url), 'utf8');

new Function('window', read('preview-shared.js'))(win);
new Function('window', read('theme-preview.js'))(win);
new Function('window', read('page-preview.js'))(win);

const registered = templates.theme;
if (!registered) throw new Error('the theme preview template was not registered');

function entry(data) {
  return {
    getIn(path) {
      let node = data;
      for (const key of path.slice(1)) {
        if (node === null || typeof node !== 'object') return undefined;
        node = node[key];
      }
      return node;
    },
  };
}

function collectStyles(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectStyles(child, out);
    return out;
  }
  for (const value of Object.values(node.props.style || {})) out.push(String(value));
  collectStyles(node.children, out);
  return out;
}

function collectInlineCss(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectInlineCss(child, out);
    return out;
  }
  const injected = node.props && node.props.dangerouslySetInnerHTML;
  if (injected && typeof injected.__html === 'string') out.push(injected.__html);
  collectInlineCss(node.children, out);
  return out;
}

function collectButtons(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectButtons(child, out);
    return out;
  }
  if (node.type === 'button') out.push({ props: node.props, children: node.children });
  collectButtons(node.children, out);
  return out;
}

function collectStyleObjects(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectStyleObjects(child, out);
    return out;
  }
  if (node.props && node.props.style) out.push(node.props.style);
  collectStyleObjects(node.children, out);
  return out;
}

function collectText(node, out = []) {
  if (node === null || node === undefined) return out;
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out);
    return out;
  }
  if (typeof node !== 'object') return out;
  collectText(node.children, out);
  return out;
}

const render = (data) => registered({ entry: entry(data) });

const plainTree = render({});
const plainCss = collectInlineCss(plainTree).join('');

const customTree = render({
  colourScheme: 'emerald',
  accent: { main: '#123456', hover: '#0f2d4a' },
  light: { background: '#fffbe6', band: '#fff3c4' },
  dark: { background: '#101820' },
  cornerRadius: 'pill',
  fontHeading: 'lora',
  fontBody: 'inter',
});
const customStyles = collectStyles(customTree);
const customCss = collectInlineCss(customTree).join('');

const toggleOn = collectButtons(render({}));
const toggleOff = collectButtons(render({ appearance: { showToggle: false } }));
const defaultDark = collectButtons(render({ appearance: { defaultMode: 'dark' } }));

// ---- website-page previews -------------------------------------------------
const pagePreview = templates.home || (() => null);

const pageTree = pagePreview({
  entry: entry({
    seo: { title: 'SEO title here', description: 'SEO description here' },
    hero: {
      eyebrow: 'Hero eyebrow',
      title: 'Hero title',
      intro: 'Hero intro',
      image: '/images/hero.png',
      imagePosition: 'centre',
      buttons: [{ label: 'Go', href: '/', variant: 'primary' }],
    },
    sections: [
      { layout: 'cards', heading: 'Cards heading', background: 'gray', items: [{ icon: '🎸', title: 'Card one', text: 'Card text' }] },
      {
        layout: 'list',
        heading: 'List heading',
        image: '/images/side.png',
        imagePosition: 'left',
        body: 'Para one.\n\nPara two.',
        items: [{ icon: '🎯', title: 'Row title', text: 'row text' }],
      },
    ],
    cta: { heading: 'CTA heading', body: 'CTA body', buttonLabel: 'Book now' },
  }),
});
const pageText = collectText(pageTree).join(' | ');
const pageStyles = collectStyleObjects(pageTree);

const bookingText = collectText(
  pagePreview({
    entry: entry({
      seo: { title: 'Booking', description: 'Booking description' },
      hero: { title: 'Book a trial' },
      form: { heading: 'Form heading', submitLabel: 'Send it', fields: [{ label: 'Name', name: 'name', required: true }] },
    }),
  })
).join(' | ');

const newsText = collectText(
  pagePreview({ entry: entry({ seo: { title: 'News' }, labels: { empty: 'Nothing yet', readMore: 'Keep reading' } }) })
).join(' | ');

// A position can be chosen before an image exists — the preview should say where it will go.
const noImageText = collectText(
  pagePreview({
    entry: entry({
      seo: { title: 'No image', description: 'No image' },
      hero: { title: 'No image hero', imagePosition: 'left' },
      sections: [
        { layout: 'markdown', heading: 'No image block', imagePosition: 'centre', body: 'Body below the gap.' },
      ],
    }),
  })
).join(' | ');
const noImageStyles = collectStyleObjects(
  pagePreview({ entry: entry({ hero: { title: 'H', imagePosition: 'left' } }) })
);

const defaultText = collectText(
  pagePreview({ entry: entry({ hero: { title: 'Clean hero' }, sections: [{ layout: 'markdown', heading: 'Clean block' }] }) })
).join(' | ');

// Image cards and the two new layout types.
const mediaText = collectText(
  pagePreview({
    entry: entry({
      seo: { title: 'M', description: 'M' },
      hero: { title: 'Media hero' },
      sections: [
        { layout: 'cards', heading: 'Image cards', items: [{ image: '/images/a.png', imageAlt: 'Alt A', title: 'Card with image', text: 'Card with image text' }] },
        { layout: 'alternate', heading: 'Alternating', items: [{ image: '/images/b.png', title: 'Alt one', text: 'Alt one text' }] },
        { layout: 'gallery', heading: 'Gallery', items: [{ image: '/images/c.png', caption: 'Gallery shot' }] },
      ],
    }),
  })
).join(' | ');
const galleryStyles = collectStyleObjects(
  pagePreview({ entry: entry({ sections: [{ layout: 'gallery', items: [{ image: '/images/c.png' }] }] }) })
);

const checks = [
  ['renders a tree without throwing', plainCss.length > 0],
  ['light palette variables are defined', plainCss.includes('.theme-preview{') && plainCss.includes('--tp-bg:#ffffff')],
  ['light defaults match the site (band #f9fafb)', plainCss.includes('--tp-band:#f9fafb')],
  ['a dark palette block is defined', plainCss.includes('.theme-preview.tp-dark{')],
  ['dark defaults match the site (bg #020617)', plainCss.includes('--tp-deep-bg:#020617')],
  ['custom light background is used', customCss.includes('--tp-bg:#fffbe6')],
  ['custom light band is used', customCss.includes('--tp-band:#fff3c4')],
  ['custom dark background is used', customCss.includes('--tp-bg:#101820')],
  ['custom accent hex is used', customStyles.some((v) => v === '#123456')],
  ['custom accent hover hex is used', customStyles.some((v) => v === '#0f2d4a')],
  ['pill corner radius resolves to 28px', customStyles.some((v) => v === '28px')],
  ['heading font resolves to Lora', customStyles.some((v) => v.includes('Lora'))],
  ['body font resolves to Inter', customStyles.some((v) => v.includes('Inter'))],
  ['empty theme falls back to the emerald preset accent', collectStyles(plainTree).some((v) => v === '#059669')],
  ['the dark/light switch renders by default', toggleOn.length === 1],
  ['the switch is hidden when showToggle is false', toggleOff.length === 0],
  ['defaultMode dark starts the switch on the sun glyph', defaultDark[0] && defaultDark[0].children[0] === '☀️'],
  ['the switch toggles the preview palette', typeof toggleOn[0].props.onClick === 'function'],
  ['every website page registers a preview', ['home', 'about', 'adults', 'kids', 'booking', 'news'].every((n) => typeof templates[n] === 'function')],
  ['the theme preview is still separate', typeof templates.theme === 'function'],
  ['page preview renders the search-listing strip', pageText.includes('SEO title here') && pageText.includes('SEO description here')],
  ['page preview renders the hero', pageText.includes('Hero title') && pageText.includes('Hero eyebrow') && pageText.includes('Hero intro')],
  ['page preview renders section headings', pageText.includes('Cards heading') && pageText.includes('List heading')],
  ['page preview renders cards and link rows', pageText.includes('Card one') && pageText.includes('Row title')],
  ['page preview renders both body paragraphs', pageText.includes('Para one.') && pageText.includes('Para two.')],
  ['page preview renders the call to action', pageText.includes('CTA heading') && pageText.includes('Book now')],
  ['centre hero image is centred, not side by side', pageStyles.some((s) => s.maxWidth === 560 && s.marginLeft === 'auto' && typeof s.order === 'undefined')],
  ['left section image puts the media first', pageStyles.some((s) => s.order === 1) && pageStyles.some((s) => s.order === 2)],
  ['booking form renders its labels', bookingText.includes('Form heading') && bookingText.includes('Name') && bookingText.includes('Send it')],
  ['news listing labels render', newsText.includes('Nothing yet') && newsText.includes('Keep reading')],
  ['no image + a chosen position shows a placement hint', noImageText.includes('No image yet')],
  ['the hint names the chosen side', noImageText.includes('left of the text')],
  ['no image + centre still renders the body copy', noImageText.includes('Body below the gap.')],
  ['no image + centre shows a centred hint', noImageText.includes('centred')],
  ['the placement hint is dashed and takes a column order', noImageStyles.some((s) => typeof s.border === 'string' && s.border.indexOf('dashed') >= 0) && noImageStyles.some((s) => s.order === 1)],
  ['the default position with no image shows no hint', !defaultText.includes('No image yet')],
  ['cards render an uploaded image', mediaText.includes('Card with image') && mediaText.includes('Card with image text')],
  ['alternate renders an image and text split', mediaText.includes('Alt one') && mediaText.includes('Alt one text')],
  ['gallery renders a caption', mediaText.includes('Gallery shot')],
  ['gallery uses CSS columns for masonry', galleryStyles.some((s) => s.columnCount === 3)],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(failed === 0 ? '\nAll theme-preview checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
