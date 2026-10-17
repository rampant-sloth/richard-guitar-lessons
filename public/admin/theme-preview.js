/*
 * Live preview for the "Theme" file in Decap CMS.
 *
 * Renders a miniature of the real site (header, hero, cards, CTA, footer) using the
 * colours, fonts and corner radius currently selected — so the preview pane shows what
 * the site will actually look like. Filler copy is deliberately Lorem Ipsum.
 *
 * NOTE: PRESETS / DEFAULT_LIGHT / DEFAULT_DARK / RADIUS / FONTS are mirrored from
 * src/layouts/Layout.astro. If you change them there, change them here too.
 */
(function () {
  'use strict';

  var CMS = window.CMS;
  if (!CMS || typeof CMS.registerPreviewTemplate !== 'function') return;

  // Decap exposes React's createElement as the global `h`.
  var h = window.h || (window.React && window.React.createElement);
  if (typeof h !== 'function') {
    if (window.console && window.console.error) {
      window.console.error('[theme-preview] Decap did not expose React createElement (window.h). Theme preview disabled.');
    }
    return;
  }

  // Presets, defaults, radius and fonts come from preview-shared.js (loaded first).
  var P = window.PREVIEW;
  if (!P) return;
  var PRESETS = P.PRESETS;
  var DEFAULT_LIGHT = P.DEFAULT_LIGHT;
  var DEFAULT_DARK = P.DEFAULT_DARK;
  var RADIUS = P.RADIUS;

  var FONTS = P.FONTS;
  var FONT_QUERIES = P.FONT_QUERIES;

  var LOREM_SHORT =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  var LOREM_MED =
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
  var LOREM_CARD =
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  function pick(value, fallback) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  function get(entry, path) {
    try {
      return entry.getIn(path);
    } catch (err) {
      return undefined;
    }
  }

  function resolve(entry) {
    var scheme = get(entry, ['data', 'colourScheme']) || 'emerald';
    var preset = PRESETS[scheme] || PRESETS.emerald;

    var accent = {
      50: pick(get(entry, ['data', 'accent', 'pale']), preset[50]),
      300: pick(get(entry, ['data', 'accent', 'light']), preset[300]),
      400: pick(get(entry, ['data', 'accent', 'light']), preset[400]),
      500: pick(get(entry, ['data', 'accent', 'main']), preset[500]),
      600: pick(get(entry, ['data', 'accent', 'main']), preset[600]),
      700: pick(get(entry, ['data', 'accent', 'hover']), preset[700]),
      800: pick(get(entry, ['data', 'accent', 'hover']), preset[800]),
    };

    var radiusKey = get(entry, ['data', 'cornerRadius']) || 'rounded';
    var headingKey = get(entry, ['data', 'fontHeading']) || 'system';
    var bodyKey = get(entry, ['data', 'fontBody']) || 'system';

    return {
      scheme: scheme,
      accent: accent,
      light: {
        background: pick(get(entry, ['data', 'light', 'background']), DEFAULT_LIGHT.background),
        surface: pick(get(entry, ['data', 'light', 'surface']), DEFAULT_LIGHT.surface),
        band: pick(get(entry, ['data', 'light', 'band']), DEFAULT_LIGHT.band),
        text: pick(get(entry, ['data', 'light', 'text']), DEFAULT_LIGHT.text),
        muted: pick(get(entry, ['data', 'light', 'muted']), DEFAULT_LIGHT.muted),
        border: pick(get(entry, ['data', 'light', 'border']), DEFAULT_LIGHT.border),
      },
      dark: {
        background: pick(get(entry, ['data', 'dark', 'background']), DEFAULT_DARK.background),
        surface: pick(get(entry, ['data', 'dark', 'surface']), DEFAULT_DARK.surface),
        band: pick(get(entry, ['data', 'dark', 'band']), DEFAULT_DARK.band),
        text: pick(get(entry, ['data', 'dark', 'text']), DEFAULT_DARK.text),
        muted: pick(get(entry, ['data', 'dark', 'muted']), DEFAULT_DARK.muted),
        border: pick(get(entry, ['data', 'dark', 'border']), DEFAULT_DARK.border),
      },
      radius: RADIUS[radiusKey] || RADIUS.rounded,
      fontHeading: FONTS[headingKey] || FONTS.system,
      fontBody: FONTS[bodyKey] || FONTS.system,
      fontHeadingKey: headingKey,
      fontBodyKey: bodyKey,
      showToggle: get(entry, ['data', 'appearance', 'showToggle']) !== false,
      defaultMode: get(entry, ['data', 'appearance', 'defaultMode']) || 'auto',
    };
  }

  CMS.registerPreviewStyle(
    'html, body { margin: 0; padding: 0; } body { font-size: 14px; line-height: 1.55; } .theme-preview * { box-sizing: border-box; }',
    { raw: true }
  );

  var LINKED_FONTS = {};

  function fontLink(keys) {
    var needed = [];
    for (var i = 0; i < keys.length; i++) {
      var q = FONT_QUERIES[keys[i]];
      if (q && !LINKED_FONTS[q]) {
        LINKED_FONTS[q] = true;
        needed.push('family=' + q);
      }
    }
    if (needed.length === 0) return null;
    return h('link', {
      key: 'fontlink',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?' + needed.join('&') + '&display=swap',
    });
  }

  function ThemePreview(props) {
    var t = resolve(props.entry);
    var a = t.accent;
    // Neutrals resolve through CSS variables (the same idea as the real site's
    // --theme-* tokens) so the swatch can flip palettes without React state.
    var L = {
      background: 'var(--tp-bg)',
      surface: 'var(--tp-surface)',
      band: 'var(--tp-band)',
      text: 'var(--tp-text)',
      muted: 'var(--tp-muted)',
      border: 'var(--tp-border)',
    };
    var D = {
      background: 'var(--tp-deep-bg)',
      surface: 'var(--tp-deep-surface)',
      border: 'var(--tp-deep-border)',
      text: 'var(--tp-deep-text)',
      muted: 'var(--tp-deep-muted)',
    };
    var r = t.radius;
    var rSm = Math.max(4, parseFloat(r) * 0.5) + 'px';
    var rMd = Math.max(6, parseFloat(r) * 0.75) + 'px';

    function varBlock(bg, surface, band, text, muted, border, deepBg, deepSurface, deepBorder, deepText, deepMuted) {
      return (
        '--tp-bg:' + bg + ';' +
        '--tp-surface:' + surface + ';' +
        '--tp-band:' + band + ';' +
        '--tp-text:' + text + ';' +
        '--tp-muted:' + muted + ';' +
        '--tp-border:' + border + ';' +
        '--tp-deep-bg:' + deepBg + ';' +
        '--tp-deep-surface:' + deepSurface + ';' +
        '--tp-deep-border:' + deepBorder + ';' +
        '--tp-deep-text:' + deepText + ';' +
        '--tp-deep-muted:' + deepMuted + ';'
      );
    }

    var varCss =
      '.theme-preview{' +
      varBlock(t.light.background, t.light.surface, t.light.band, t.light.text, t.light.muted, t.light.border, t.dark.background, t.dark.surface, t.dark.border, t.dark.text, t.dark.muted) +
      '}.theme-preview.tp-dark{' +
      varBlock(t.dark.background, t.dark.surface, t.dark.band, t.dark.text, t.dark.muted, t.dark.border, t.dark.band, t.dark.surface, t.dark.border, t.dark.text, t.dark.muted) +
      '}';
    var styleTag = h('style', { key: 'vars', dangerouslySetInnerHTML: { __html: varCss } });

    var shell = { background: L.background, color: L.text, fontFamily: t.fontBody };
    var wrap = { maxWidth: 760, margin: '0 auto', padding: '0 22px' };
    var h1 = { fontFamily: t.fontHeading, fontWeight: 800, letterSpacing: '-0.02em', fontSize: 30, lineHeight: 1.15, margin: '10px 0 0' };
    var h2 = { fontFamily: t.fontHeading, fontWeight: 800, letterSpacing: '-0.02em', fontSize: 21, margin: 0 };
    var h3 = { fontFamily: t.fontHeading, fontWeight: 700, fontSize: 15, margin: '12px 0 0' };
    var p = { margin: '10px 0 0', color: L.muted };
    var eyebrow = { margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: a[600] };
    var btnPrimary = { display: 'inline-block', background: a[600], color: '#ffffff', padding: '11px 20px', borderRadius: rSm, fontWeight: 600, fontSize: 13.5, textDecoration: 'none' };
    var btnGhost = { display: 'inline-block', background: L.surface, color: L.text, border: '1px solid ' + L.border, padding: '11px 20px', borderRadius: rSm, fontWeight: 600, fontSize: 13.5, textDecoration: 'none' };
    var card = { flex: '1 1 180px', background: L.surface, border: '1px solid ' + L.border, borderRadius: r, padding: '18px 18px 20px' };

    function iconTile(glyph) {
      return h('div', { style: { width: 42, height: 42, borderRadius: rMd, background: a[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 } }, glyph);
    }

    function cardItem(key, glyph, title, body) {
      return h('div', { key: key, style: card }, [iconTile(glyph), h('h3', { key: 't', style: h3 }, title), h('p', { key: 'p', style: Object.assign({}, p, { fontSize: 13 }) }, body)]);
    }

    // The dark/light switch, exactly as it sits in the header of every page.
    // Clicking it flips this preview between the light and dark palettes.
    var themeChip = t.showToggle
      ? h(
          'button',
          {
            key: 'themetoggle',
            type: 'button',
            title: 'Preview the opposite mode',
            style: {
              marginLeft: 2,
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: rMd,
              border: '1px solid ' + L.border,
              background: 'transparent',
              color: L.text,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: 1,
            },
            onClick: function (event) {
              var el = event.currentTarget;
              var shellEl = el.closest('.theme-preview');
              if (!shellEl) return;
              var nowDark = shellEl.classList.toggle('tp-dark');
              el.textContent = nowDark ? '☀️' : '🌙';
            },
          },
          t.defaultMode === 'dark' ? '☀️' : '🌙'
        )
      : null;

    var header = h('div', { key: 'header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '11px 22px', borderBottom: '1px solid ' + L.border, background: L.surface } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', gap: 9 } }, [
        h('span', { key: 'logo', style: { width: 32, height: 32, borderRadius: rMd, background: a[600], color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 } }, '🎸'),
        h('strong', { key: 'name', style: { fontSize: 12.5, lineHeight: 1.15 } }, "Richard's Guitar Lessons"),
      ]),
      h('div', { key: 'nav', style: { display: 'flex', alignItems: 'center', gap: 13, fontSize: 12, color: L.muted } }, [
        h('span', { key: 'n1', style: { color: a[600], fontWeight: 600 } }, 'Home'),
        h('span', { key: 'n2' }, 'Kids & Exams'),
        h('span', { key: 'n3' }, 'Adults'),
        h('span', { key: 'n4' }, 'About'),
        h('span', { key: 'n5', style: { background: a[600], color: '#ffffff', padding: '7px 13px', borderRadius: rSm, fontWeight: 600 } }, 'Book a Trial'),
        themeChip,
      ]),
    ]);

    var hero = h('div', { key: 'hero', style: { background: L.band, padding: '34px 0' } }, [
      h('div', { key: 'w', style: wrap }, [
        h('p', { key: 'e', style: eyebrow }, 'Guitar · Bass · Ukulele — online, over Zoom'),
        h('h1', { key: 'h', style: h1 }, 'Guitar, bass & ukulele lessons from someone who genuinely loves this'),
        h('p', { key: 'p1', style: p }, LOREM_MED),
        h('p', { key: 'p2', style: p }, LOREM_SHORT),
        h('div', { key: 'btns', style: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 } }, [
          h('span', { key: 'b1', style: btnPrimary }, 'Book a Free 30-Minute Trial Lesson'),
          h('span', { key: 'b2', style: btnGhost }, 'Who I teach'),
        ]),
      ]),
    ]);

    var cards = h('div', { key: 'cards', style: { background: L.background, padding: '32px 0' } }, [
      h('div', { key: 'w', style: wrap }, [
        h('h2', { key: 'h', style: h2 }, 'Why learn with me?'),
        h('p', { key: 'p', style: p }, LOREM_MED),
        h('div', { key: 'grid', style: { display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18 } }, [
          cardItem('c1', '🎼', 'Your songs, tabbed out properly', LOREM_CARD),
          cardItem('c2', '📝', 'Grade exams, minus the fear', LOREM_CARD),
          cardItem('c3', '🎙️', "You'll hear every note properly", LOREM_CARD),
        ]),
      ]),
    ]);

    var pricing = h('div', { key: 'pricing', style: { background: L.band, padding: '32px 0' } }, [
      h('div', { key: 'w', style: wrap }, [
        h('h2', { key: 'h', style: h2 }, 'Lessons & pricing'),
        h('p', { key: 'p', style: p }, LOREM_SHORT),
        h('ul', { key: 'ul', style: { margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 12 } }, [
          { g: '💻', t: 'Your platform, your choice' },
          { g: '📄', t: 'Custom tabs every Monday' },
          { g: '📅', t: 'Flexible scheduling' },
        ].map(function (row, i) {
          return h('li', { key: 'li' + i, style: { flex: '1 1 190px', display: 'flex', gap: 8, background: L.surface, border: '1px solid ' + L.border, borderRadius: r, padding: '12px 14px', fontSize: 12.5 } }, [
            h('span', { key: 'g' }, row.g),
            h('span', { key: 't', style: { color: L.muted } }, row.t),
          ]);
        })),
      ]),
    ]);

    var cta = h('div', { key: 'cta', style: { background: D.background, padding: '30px 0', textAlign: 'center' } }, [
      h('div', { key: 'w', style: wrap }, [
        h('h2', { key: 'h', style: Object.assign({}, h2, { color: D.text }) }, 'Fancy a trial lesson?'),
        h('p', { key: 'p', style: { margin: '10px auto 0', maxWidth: 460, color: D.muted } }, LOREM_SHORT),
        h('div', { key: 'b', style: { marginTop: 16 } }, h('span', { style: btnPrimary }, 'Book a Free 30-Minute Trial Lesson')),
      ]),
    ]);

    var footer = h('div', { key: 'footer', style: { background: D.background, borderTop: '1px solid ' + D.border, padding: '20px 0' } }, [
      h('div', { key: 'w', style: Object.assign({}, wrap, { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, fontSize: 12, color: D.muted }) }, [
        h('span', { key: 'c' }, "© Richard's Guitar Lessons"),
        h('div', { key: 's', style: { display: 'flex', gap: 7 } }, ['f', 'ig', 'tt', 'tw'].map(function (k) {
          return h('span', { key: k, style: { width: 26, height: 26, borderRadius: rMd, background: D.surface, border: '1px solid ' + D.border } });
        })),
      ]),
    ]);

    var swatches = [
      { n: 'accent', v: a[600] },
      { n: 'hover', v: a[700] },
      { n: 'light', v: a[400] },
      { n: 'pale', v: a[50] },
      { n: 'bg', v: t.light.background },
      { n: 'surface', v: t.light.surface },
      { n: 'band', v: t.light.band },
      { n: 'text', v: t.light.text },
      { n: 'muted', v: t.light.muted },
      { n: 'border', v: t.light.border },
      { n: 'dark bg', v: t.dark.background },
      { n: 'dark surface', v: t.dark.surface },
      { n: 'dark band', v: t.dark.band },
      { n: 'dark text', v: t.dark.text },
      { n: 'dark muted', v: t.dark.muted },
      { n: 'dark border', v: t.dark.border },
    ];

    var palette = h(
      'div',
      { key: 'palette', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '14px 22px', borderTop: '1px solid ' + L.border, fontSize: 10.5, color: L.muted } },
      [h('strong', { key: 'lbl' }, 'Resolved colours:')].concat(
        swatches.map(function (sw) {
          return h('span', { key: sw.n, style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, [
            h('span', { key: 'd', style: { width: 11, height: 11, borderRadius: 3, background: sw.v, border: '1px solid ' + L.border, display: 'inline-block' } }),
            h('span', { key: 't' }, sw.n + ' ' + sw.v),
          ]);
        })
      )
    );

    return h('div', { className: 'theme-preview', style: shell }, [
      styleTag,
      fontLink([t.fontHeadingKey, t.fontBodyKey]),
      header,
      hero,
      cards,
      pricing,
      cta,
      footer,
      palette,
    ]);
  }

  CMS.registerPreviewTemplate('theme', ThemePreview);
})();
