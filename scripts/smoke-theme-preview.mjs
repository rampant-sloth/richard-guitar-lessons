// Smoke test for the Decap theme preview (public/admin/theme-preview.js).
//
// The admin UI needs GitHub OAuth, so it can't be driven from CI. Instead this stubs
// Decap's globals (CMS + React's `h`) and an Immutable-style `entry`, then checks the
// preview component renders and honours custom hex colours.
//
// Run with: node scripts/smoke-theme-preview.mjs

import { readFileSync } from 'node:fs';

let registered = null;

const win = {
  CMS: {
    registerPreviewTemplate(name, component) {
      if (name !== 'theme') throw new Error(`unexpected preview registered: ${name}`);
      registered = component;
    },
    registerPreviewStyle() {},
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children }),
  console,
};

const source = readFileSync(new URL('../public/admin/theme-preview.js', import.meta.url), 'utf8');
new Function('window', source)(win);

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
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(failed === 0 ? '\nAll theme-preview checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
