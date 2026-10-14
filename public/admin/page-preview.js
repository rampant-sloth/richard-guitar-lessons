/*
 * Live previews for the "Website pages" files in Decap CMS.
 *
 * Renders each page roughly the way the site does — hero, section blocks, closing call to
 * action, the booking form and the news listing — including the foreground-image position
 * rules. Filler copy is Lorem Ipsum where the entry has none.
 *
 * Colours come from /theme.json, which is emitted at build time, so previews use the theme
 * of the last deploy. Until that arrives (or if the fetch fails) the built-in defaults are
 * used. Registered per file, because these are file-collection entries.
 */
(function () {
  'use strict';

  var CMS = window.CMS;
  if (!CMS || typeof CMS.registerPreviewTemplate !== 'function') return;

  var h = window.h || (window.React && window.React.createElement);
  if (typeof h !== 'function') return;

  var P = window.PREVIEW;
  if (!P) return;

  var themeJson = null;
  try {
    window
      .fetch('theme.json')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (json) { if (json) themeJson = json; })
      .catch(function () {});
  } catch (err) {}

  var LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  function str(value) {
    return typeof value === 'string' ? value : '';
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function paragraphs(text) {
    return str(text)
      .split(/\r?\n\s*\r?\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean);
  }

  function entryValue(entry, path) {
    try {
      return entry.getIn(['data'].concat(path));
    } catch (err) {
      return undefined;
    }
  }

  function theme() {
    return P.resolveTheme(function (path) { return P.getIn(themeJson || {}, path); });
  }

  // Same rules as src/components/{Hero,Sections}.astro: left/right are two columns from
  // `lg` (1024px) up and stack below that; centre never goes side by side.
  function positionOf(value) {
    return value === 'left' || value === 'centre' ? value : 'right';
  }

  CMS.registerPreviewStyle(
    'html, body { margin: 0; padding: 0; } body { font-size: 14px; line-height: 1.55; }' +
      '.page-preview * { box-sizing: border-box; }' +
      '.page-preview img { max-width: 100%; }',
    { raw: true }
  );

  function PagePreview(props) {
    var t = theme();
    var a = t.accent;
    var L = t.light;
    var D = t.dark;
    var r = t.radius;
    var rSm = Math.max(4, parseFloat(r) * 0.5) + 'px';
    var v = function (path) { return entryValue(props.entry, path); };

    var wrap = { maxWidth: 760, margin: '0 auto', padding: '0 22px' };
    var h1 = { fontFamily: t.fontHeading, fontWeight: 800, letterSpacing: '-0.02em', fontSize: 29, lineHeight: 1.15, margin: '10px 0 0' };
    var h2 = { fontFamily: t.fontHeading, fontWeight: 800, letterSpacing: '-0.02em', fontSize: 21, margin: 0 };
    var h3 = { fontFamily: t.fontHeading, fontWeight: 700, fontSize: 15, margin: '12px 0 0' };
    var eyebrowStyle = { margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: a[600] };
    var btnSolid = { display: 'inline-block', background: a[600], color: '#ffffff', padding: '11px 20px', borderRadius: rSm, fontWeight: 600, fontSize: 13.5, textDecoration: 'none' };
    var btnGhost = { display: 'inline-block', background: L.surface, color: L.text, border: '1px solid ' + L.border, padding: '11px 20px', borderRadius: rSm, fontWeight: 600, fontSize: 13.5, textDecoration: 'none' };

    function coverStyle(src) {
      return { display: 'block', width: '100%', height: '100%', objectFit: 'cover' };
    }

    function mediaStyle(colour) {
      return { display: 'block', width: '100%', borderRadius: r, border: '1px solid ' + (colour || L.border) };
    }

    /*
     * A position can be chosen before an image exists. Rather than silently doing nothing
     * (which looks like the preview is broken), show where the image will land.
     */
    function imagePlaceholder(key, pos, pal, extra) {
      var where = pos === 'centre' ? 'centred, above the rest of the text' : pos === 'left' ? 'left of the text' : 'right of the text';
      return h(
        'div',
        {
          key: key,
          style: Object.assign(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 92,
              padding: '12px',
              borderRadius: r,
              border: '2px dashed ' + pal.border,
              background: pal.surface,
              color: pal.muted,
              fontSize: 12,
              lineHeight: 1.4,
              textAlign: 'center',
            },
            extra
          ),
        },
        'No image yet — add one and it will sit ' + where + '.'
      );
    }

    function bodyParas(text, colour) {
      return paragraphs(text).map(function (p, i) {
        return h('p', { key: 'p' + i, style: { margin: '10px 0 0', color: colour || L.muted } }, p);
      });
    }

    function headingBlock(heading, intro, colour) {
      if (!heading && !intro) return null;
      return h('div', { key: 'text', style: { maxWidth: 560 } }, [
        heading ? h('h2', { key: 'h', style: Object.assign({}, h2, { color: colour || L.text }) }, heading) : null,
        intro ? h('p', { key: 'i', style: { margin: '10px 0 0', color: colour || L.muted } }, intro) : null,
      ]);
    }

    function fontLink() {
      var href = P.fontHref([t.fontHeadingKey, t.fontBodyKey]);
      return href ? h('link', { key: 'fonts', rel: 'stylesheet', href: href }) : null;
    }

    // ---- hero ---------------------------------------------------------------
    var heroImage = str(v(['hero', 'image']));
    var heroPos = positionOf(v(['hero', 'imagePosition']));
    var heroPlaceholder = !heroImage && heroPos !== 'right';
    var heroSplit = (Boolean(heroImage) || heroPlaceholder) && heroPos !== 'centre';
    var heroFirst = heroPos === 'left';
    var heroCentred = (Boolean(heroImage) || heroPlaceholder) && heroPos === 'centre';
    var heroBg = str(v(['hero', 'backgroundImage']));
    var heroButtons = arr(v(['hero', 'buttons'])).map(function (b, i) {
      return h('span', { key: 'b' + i, style: str(b.variant) === 'secondary' ? btnGhost : btnSolid }, str(b.label));
    });

    function coverEl(src, key, opacity, colour) {
      return [
        h('img', { key: key + '-img', src: src, alt: '', style: Object.assign({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, coverStyle()) }),
        h('div', { key: key + '-ov', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: colour, opacity: opacity } }),
      ];
    }

    var heroText = h('div', { key: 'text', style: heroFirst && heroSplit ? { flex: '1 1 300px', order: 2 } : { flex: '1 1 300px' } }, [
      str(v(['hero', 'eyebrow'])) ? h('p', { key: 'e', style: eyebrowStyle }, str(v(['hero', 'eyebrow']))) : null,
      h('h1', { key: 'h', style: h1 }, str(v(['hero', 'title'])) || '(page heading)'),
      str(v(['hero', 'intro'])) ? h('p', { key: 'i', style: { margin: '14px 0 0', fontSize: 15, color: L.muted } }, str(v(['hero', 'intro']))) : null,
      heroButtons.length > 0 ? h('div', { key: 'b', style: { marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 } }, heroButtons) : null,
    ]);

    var heroSection = h('div', { key: 'hero', style: { position: 'relative', overflow: 'hidden', background: L.band, padding: '34px 0' } },
      (heroBg ? coverEl(heroBg, 'hero-bg', 0.85, L.background) : []).concat([
        h('div', { key: 'in', style: Object.assign({ position: 'relative' }, wrap) }, [
          heroSplit
            ? h('div', { key: 'row', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22 } }, [
                heroText,
                heroImage
                  ? h('img', { key: 'img', src: heroImage, alt: str(v(['hero', 'imageAlt'])), style: Object.assign({ flex: '1 1 240px', order: heroFirst ? 1 : 3 }, mediaStyle()) })
                  : imagePlaceholder('hero-ph', heroPos, L, { flex: '1 1 240px', order: heroFirst ? 1 : 3 }),
              ])
            : heroText,
          heroCentred
            ? heroImage
              ? h('img', { key: 'img', src: heroImage, alt: str(v(['hero', 'imageAlt'])), style: Object.assign({ marginTop: 20, marginLeft: 'auto', marginRight: 'auto', maxWidth: 560 }, mediaStyle()) })
              : imagePlaceholder('hero-ph', heroPos, L, { marginTop: 20, marginLeft: 'auto', marginRight: 'auto', maxWidth: 560 })
            : null,
        ]),
      ]));

    // ---- section helpers ----------------------------------------------------
    function palette(section) {
      var bg = str(section.background) || 'white';
      if (bg === 'dark') return { base: D.background, text: D.text, muted: D.muted, surface: D.surface, border: D.border, isDark: true };
      if (bg === 'gray') return { base: L.band, text: L.text, muted: L.muted, surface: L.surface, border: L.border };
      if (bg === 'emerald') return { base: a[50], text: L.text, muted: L.muted, surface: L.surface, border: L.border };
      return { base: L.background, text: L.text, muted: L.muted, surface: L.surface, border: L.border };
    }

    function itemCard(key, it, pal, wide) {
      var img = str(it.image);
      var pad = wide ? '18px 18px 20px' : '16px 16px 18px';
      return h('div', { key: key, style: { flex: wide ? '1 1 250px' : '1 1 190px', background: pal.surface, border: '1px solid ' + pal.border, borderRadius: r, overflow: 'hidden', padding: img ? 0 : pad } }, [
        img ? h('img', { key: 'img', src: img, alt: str(it.imageAlt), style: { display: 'block', width: '100%', height: 150, objectFit: 'cover' } }) : null,
        h('div', { key: 'body', style: { padding: img ? (wide ? '16px 16px 18px' : '14px 14px 16px') : 0 } }, [
          !img && str(it.icon) ? h('span', { key: 'ic', style: { display: 'block', fontSize: 20 } }, str(it.icon)) : null,
          str(it.title) ? h('h3', { key: 't', style: Object.assign({}, h3, { color: pal.text, fontSize: wide ? 16 : 15, margin: img ? '0' : '12px 0 0' }) }, str(it.title)) : null,
          str(it.text) ? h('p', { key: 'p', style: { margin: '8px 0 0', fontSize: 13, color: pal.muted, whiteSpace: wide ? 'pre-line' : 'normal' } }, str(it.text)) : null,
          str(it.href) && str(it.linkLabel)
            ? h('span', { key: 'l', style: { display: 'inline-block', marginTop: 10, color: a[600], fontWeight: 600, fontSize: 13 } }, str(it.linkLabel))
            : null,
        ]),
      ]);
    }

    function inlineRow(key, it, pal) {
      return h('div', { key: key, style: { flex: '1 1 210px', display: 'flex', gap: 8, background: pal.surface, border: '1px solid ' + pal.border, borderRadius: r, padding: '12px 14px' } }, [
        str(it.icon) ? h('span', { key: 'ic' }, str(it.icon)) : null,
        h('span', { key: 't', style: { fontSize: 13, color: pal.muted } }, [
          str(it.title) ? h('strong', { key: 'b', style: { color: pal.text } }, str(it.title)) : null,
          str(it.title) && str(it.text) ? ' - ' : '',
          str(it.text),
        ]),
      ]);
    }

    function renderSection(section, index) {
      var pal = palette(section);
      var layout = str(section.layout) || 'cards';
      var image = str(section.image);
      var pos = positionOf(section.imagePosition);
      var placeholder = !image && pos !== 'right';
      var split = (Boolean(image) || placeholder) && pos !== 'centre';
      var imageFirst = pos === 'left';
      var centred = (Boolean(image) || placeholder) && pos === 'centre';
      var bgImage = str(section.backgroundImage);
      var items = arr(section.items);
      var extras = [];

      if (layout === 'videos') {
        extras.push(h('div', { key: 'grid', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 } },
          items.map(function (it, i) {
            return h('div', { key: 'v' + i, style: { flex: '1 1 190px', border: '1px solid ' + pal.border, borderRadius: r, overflow: 'hidden', background: pal.surface } }, [
              h('div', { key: 'ph', style: { position: 'relative', paddingTop: '56.25%', background: pal.border } },
                str(it.youtubeId)
                  ? h('span', { key: 'id', style: { position: 'absolute', top: '50%', left: 0, right: 0, marginTop: -8, textAlign: 'center', fontSize: 11, color: pal.muted } }, 'YouTube ' + str(it.youtubeId))
                  : null),
              h('div', { key: 'cap', style: { padding: '10px 12px 12px' } }, [
                str(it.title) ? h('p', { key: 't', style: { margin: 0, fontWeight: 600, fontSize: 13, color: pal.text } }, str(it.title)) : null,
                str(it.caption) ? h('p', { key: 'c', style: { margin: '4px 0 0', fontSize: 12, color: pal.muted } }, str(it.caption)) : null,
              ]),
            ]);
          })));
      } else if (layout === 'lessons') {
        extras.push(h('p', { key: 'note', style: { margin: '14px 0 0', fontSize: 12, color: pal.muted, fontStyle: 'italic' } },
          'The price cards here come from the Lesson types collection, in order.'));
        if (items.length > 0) {
          extras.push(h('div', { key: 'li', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 } },
            items.map(function (it, i) { return inlineRow('i' + i, it, pal); })));
        }
      } else if (layout === 'list') {
        extras.push(h('div', { key: 'li', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 } },
          items.map(function (it, i) { return inlineRow('i' + i, it, pal); })));
      } else if (layout === 'articles') {
        extras.push(h('div', { key: 'grid', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 } },
          items.map(function (it, i) { return itemCard('a' + i, it, pal, true); })));
      } else if (layout === 'alternate') {
        extras.push(h('div', { key: 'alt', style: { marginTop: 20 } },
          items.map(function (it, i) {
            var img = str(it.image);
            var order = i % 2 === 1;
            return h('div', { key: 'a' + i, style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22, padding: '18px 0' } }, [
              h('div', { key: 'img', style: { flex: '1 1 240px', order: order ? 2 : 1 } },
                img
                  ? h('img', { src: img, alt: str(it.imageAlt), style: { display: 'block', width: '100%', borderRadius: r, border: '1px solid ' + pal.border } })
                  : h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, borderRadius: r, border: '2px dashed ' + pal.border, color: pal.muted, fontSize: 12, padding: 12, textAlign: 'center' } }, 'No image yet - add one and it will sit here.')),
              h('div', { key: 'txt', style: { flex: '1 1 260px', order: order ? 1 : 2 } }, [
                str(it.title) ? h('h3', { key: 't', style: h3 }, str(it.title)) : null,
                str(it.text) ? h('p', { key: 'p', style: { margin: '8px 0 0', color: pal.muted } }, str(it.text)) : null,
              ]),
            ]);
          })));
      } else if (layout === 'gallery') {
        extras.push(h('div', { key: 'gal', style: { marginTop: 20, columnCount: 3, columnGap: 14 } },
          items.map(function (it, i) {
            return h('div', { key: 'g' + i, style: { breakInside: 'avoid', marginBottom: 14, border: '1px solid ' + pal.border, borderRadius: r, overflow: 'hidden', background: pal.surface } }, [
              str(it.image)
                ? h('img', { src: str(it.image), alt: str(it.imageAlt), style: { display: 'block', width: '100%', height: i % 2 === 0 ? 140 : 190, objectFit: 'cover' } })
                : h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 90, color: pal.muted, fontSize: 12, padding: 12, textAlign: 'center' } }, 'No image yet'),
              str(it.title) || str(it.caption) || str(it.text)
                ? h('div', { key: 'cap', style: { padding: '10px 12px 12px' } }, [
                    str(it.title) ? h('p', { key: 't', style: { margin: 0, fontWeight: 600, fontSize: 13, color: pal.text } }, str(it.title)) : null,
                    str(it.caption) || str(it.text) ? h('p', { key: 'c', style: { margin: '4px 0 0', fontSize: 12, color: pal.muted } }, str(it.caption) || str(it.text)) : null,
                  ])
                : null,
            ]);
          })));
      } else {
        extras.push(h('div', { key: 'grid', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 } },
          items.map(function (it, i) { return itemCard('c' + i, it, pal, false); })));
      }

      var textColumn = h('div', { key: 'text', style: imageFirst && split ? { flex: '1 1 300px', order: 2 } : { flex: '1 1 300px' } }, [
        headingBlock(str(section.heading), str(section.intro), pal.text),
        centred ? null : bodyParas(section.body, pal.muted),
      ]);

      var inner = [];
      if (split) {
        inner.push(h('div', { key: 'row', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22 } }, [
          textColumn,
          image
            ? h('img', { key: 'img', src: image, alt: str(section.imageAlt), style: Object.assign({ flex: '1 1 240px', order: imageFirst ? 1 : 3 }, mediaStyle(pal.border)) })
            : imagePlaceholder('ph', pos, pal, { flex: '1 1 240px', order: imageFirst ? 1 : 3 }),
        ]));
      } else {
        inner.push(textColumn);
        if (centred) {
          inner.push(
            image
              ? h('img', { key: 'img', src: image, alt: str(section.imageAlt), style: Object.assign({ marginTop: 18, marginLeft: 'auto', marginRight: 'auto', maxWidth: 560 }, mediaStyle(pal.border)) })
              : imagePlaceholder('ph', pos, pal, { marginTop: 18, marginLeft: 'auto', marginRight: 'auto', maxWidth: 560 })
          );
          inner.push(h('div', { key: 'after' }, bodyParas(section.body, pal.muted)));
        }
      }
      extras.forEach(function (extra) { inner.push(extra); });

      return h('div', { key: 's' + index, style: { position: 'relative', overflow: 'hidden', background: pal.base, color: pal.text, padding: '30px 0' } },
        (bgImage ? coverEl(bgImage, 'sbg' + index, pal.isDark ? 0.8 : 0.85, pal.base) : []).concat([
          h('div', { key: 'in', style: Object.assign({ position: 'relative' }, wrap) }, inner),
        ]));
    }

    // ---- booking form -------------------------------------------------------
    var formData = v(['form']);
    var formSection = null;
    if (formData) {
      formSection = h('div', { key: 'form', style: { background: L.background, padding: '30px 0' } }, [
        h('div', { key: 'in', style: wrap }, [
          h('div', { key: 'card', style: { background: L.surface, border: '1px solid ' + L.border, borderRadius: r, padding: '22px' } }, [
            h('h2', { key: 'h', style: h2 }, str(formData.heading) || '(form heading)'),
            str(formData.intro) ? h('p', { key: 'i', style: { margin: '10px 0 0', color: L.muted } }, str(formData.intro)) : null,
            h('div', { key: 'fields', style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 } },
              arr(formData.fields).map(function (f, i) {
                var options = arr(f.options);
                return h('div', { key: 'f' + i, style: { flex: str(f.width) === 'full' ? '1 1 100%' : '1 1 240px' } }, [
                  h('label', { key: 'l', style: { display: 'block', fontSize: 12, fontWeight: 600, color: L.text } },
                    str(f.label) + (f.required ? ' *' : '')),
                  h('div', { key: 'box', style: { marginTop: 5, padding: '9px 12px', borderRadius: rSm, border: '1px solid ' + L.border, background: L.background, color: L.muted, fontSize: 13, minHeight: 38 } },
                    options.length > 0 ? 'Choose... / ' + options.join(' / ') : str(f.placeholder)),
                  h('span', { key: 'n', style: { fontSize: 10.5, color: L.muted } }, str(f.name) + ' (' + (str(f.type) || 'text') + ')'),
                ]);
              })),
            h('div', { key: 'sub', style: { marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 } }, [
              h('span', { key: 'btn', style: btnSolid }, str(formData.submitLabel) || 'Send'),
              h('span', { key: 'to', style: { fontSize: 11, color: L.muted } }, 'sends to ' + (str(formData.action) || '(form address)')),
            ]),
          ]),
        ]),
      ]);
    }

    // ---- news listing labels ------------------------------------------------
    var labels = v(['labels']);
    var labelsSection = null;
    if (labels) {
      labelsSection = h('div', { key: 'labels', style: { background: L.background, padding: '30px 0' } }, [
        h('div', { key: 'in', style: wrap }, [
          h('div', { key: 'box', style: { background: L.surface, border: '1px solid ' + L.border, borderRadius: r, padding: '18px', color: L.muted } },
            str(labels.empty) || '(nothing published yet message)'),
          h('p', { key: 'rm', style: { margin: '14px 0 0', color: a[600], fontWeight: 600 } },
            (str(labels.readMore) || 'Read more') + '  <- shown on every post'),
          h('p', { key: 'bh', style: { margin: '6px 0 0', color: a[600], fontWeight: 600 } },
            str(labels.backToHome) || 'Back to home'),
        ]),
      ]);
    }

    // ---- closing call to action --------------------------------------------
    var cta = v(['cta']);
    var ctaSection = null;
    if (cta) {
      ctaSection = h('div', { key: 'cta', style: { position: 'relative', overflow: 'hidden', background: D.background, padding: '28px 0', textAlign: 'center' } }, [
        h('div', { key: 'in', style: wrap }, [
          h('h2', { key: 'h', style: Object.assign({}, h2, { color: D.text }) }, str(cta.heading) || '(call to action heading)'),
          str(cta.body) ? h('p', { key: 'p', style: { margin: '10px auto 0', maxWidth: 460, color: D.muted } }, str(cta.body)) : null,
          str(cta.buttonLabel) ? h('div', { key: 'b', style: { marginTop: 16 } }, h('span', { style: btnSolid }, str(cta.buttonLabel))) : null,
        ]),
      ]);
    }

    // ---- search-listing strip ----------------------------------------------
    var seo = v(['seo']);
    var seoStrip = seo
      ? h('div', { key: 'seo', style: { background: L.band, borderBottom: '1px solid ' + L.border, padding: '10px 22px' } }, [
          h('p', { key: 't', style: { margin: 0, fontSize: 12.5, fontWeight: 600, color: a[600] } }, str(seo.title) || '(page title)'),
          h('p', { key: 'd', style: { margin: '3px 0 0', fontSize: 12, color: L.muted } }, str(seo.description) || '(meta description)'),
        ])
      : null;

    // ---- assembly -----------------------------------------------------------
    var children = [fontLink(), seoStrip, heroSection];
    arr(v(['sections'])).forEach(function (section, i) { children.push(renderSection(section, i)); });
    children.push(formSection);
    children.push(labelsSection);
    children.push(ctaSection);

    return h('div', { className: 'page-preview', style: { background: L.background, color: L.text, fontFamily: t.fontBody } }, children);
  }

  ['home', 'about', 'adults', 'kids', 'booking', 'news'].forEach(function (name) {
    CMS.registerPreviewTemplate(name, PagePreview);
  });
})();
