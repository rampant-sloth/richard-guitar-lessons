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

const plain = collectStyles(registered({ entry: entry({}) }));

const custom = collectStyles(
  registered({
    entry: entry({
      colourScheme: 'emerald',
      accent: { main: '#123456', hover: '#0f2d4a' },
      light: { background: '#fffbe6', band: '#fff3c4' },
      dark: { background: '#101820' },
      cornerRadius: 'pill',
      fontHeading: 'lora',
      fontBody: 'inter',
    }),
  })
);

const checks = [
  ['renders a tree without throwing', plain.length > 0],
  ['empty theme falls back to the emerald preset accent', plain.some((v) => v === '#059669')],
  ['custom accent hex is used', custom.some((v) => v === '#123456')],
  ['custom accent hover hex is used', custom.some((v) => v === '#0f2d4a')],
  ['custom light background is used', custom.some((v) => v === '#fffbe6')],
  ['custom light band is used', custom.some((v) => v === '#fff3c4')],
  ['custom dark background is used', custom.some((v) => v === '#101820')],
  ['pill corner radius resolves to 28px', custom.some((v) => v === '28px')],
  ['heading font resolves to Lora', custom.some((v) => v.includes('Lora'))],
  ['body font resolves to Inter', custom.some((v) => v.includes('Inter'))],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(failed === 0 ? '\nAll theme-preview checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
