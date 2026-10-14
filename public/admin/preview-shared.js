/*
 * Shared data + helpers for the Decap CMS preview panes (theme + website pages).
 * Loaded before theme-preview.js and page-preview.js.
 *
 * NOTE: the presets / defaults / radius / fonts here mirror src/layouts/Layout.astro.
 * If you change them there, change them here too — Layout.astro runs at build time and
 * cannot import this file, so the duplication is unavoidable.
 */
(function () {
  'use strict';

  var PRESETS = {
    emerald: { 50: '#ecfdf5', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46' },
    teal: { 50: '#f0fdfa', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59' },
    blue: { 50: '#eff6ff', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af' },
    indigo: { 50: '#eef2ff', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3' },
    violet: { 50: '#f5f3ff', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6' },
    rose: { 50: '#fff1f2', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239' },
    amber: { 50: '#fffbeb', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e' },
    slate: { 50: '#f8fafc', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b' },
  };

  var DEFAULT_LIGHT = { background: '#ffffff', surface: '#ffffff', band: '#f9fafb', text: '#0f172a', muted: '#475569', border: '#e2e8f0' };
  var DEFAULT_DARK = { background: '#020617', surface: '#1e293b', band: '#0f172a', text: '#ffffff', muted: '#cbd5e1', border: '#334155' };

  var RADIUS = { sharp: '4px', subtle: '8px', rounded: '16px', pill: '28px' };

  var FONTS = {
    system: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
    poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    nunito: "'Nunito', ui-sans-serif, system-ui, sans-serif",
    lora: "'Lora', ui-serif, Georgia, serif",
    merriweather: "'Merriweather', ui-serif, Georgia, serif",
  };

  var FONT_QUERIES = {
    inter: 'Inter:wght@400;600;700;800',
    poppins: 'Poppins:wght@400;600;700;800',
    nunito: 'Nunito:wght@400;600;700;800',
    lora: 'Lora:wght@400;600;700',
    merriweather: 'Merriweather:wght@400;700;900',
  };

  function pick(value, fallback) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  // Read a nested plain object by path, e.g. getIn(data, ['light', 'band']).
  function getIn(obj, path) {
    var node = obj;
    for (var i = 0; i < path.length; i++) {
      if (node === null || node === undefined || typeof node !== 'object') return undefined;
      node = node[path[i]];
    }
    return node;
  }

  /*
   * Turn theme fields into resolved values.
   * `get(path)` maps a path relative to the theme's data object to a value, so callers
   * can back it with an Immutable entry or a plain object.
   */
  function resolveTheme(get) {
    var scheme = get(['colourScheme']) || 'emerald';
    var preset = PRESETS[scheme] || PRESETS.emerald;

    var accent = {
      50: pick(get(['accent', 'pale']), preset[50]),
      300: pick(get(['accent', 'light']), preset[300]),
      400: pick(get(['accent', 'light']), preset[400]),
      500: pick(get(['accent', 'main']), preset[500]),
      600: pick(get(['accent', 'main']), preset[600]),
      700: pick(get(['accent', 'hover']), preset[700]),
      800: pick(get(['accent', 'hover']), preset[800]),
    };

    function neutral(key, fallback) {
      return {
        background: pick(get([key, 'background']), fallback.background),
        surface: pick(get([key, 'surface']), fallback.surface),
        band: pick(get([key, 'band']), fallback.band),
        text: pick(get([key, 'text']), fallback.text),
        muted: pick(get([key, 'muted']), fallback.muted),
        border: pick(get([key, 'border']), fallback.border),
      };
    }

    var radiusKey = get(['cornerRadius']) || 'rounded';
    var headingKey = get(['fontHeading']) || 'system';
    var bodyKey = get(['fontBody']) || 'system';

    return {
      scheme: scheme,
      accent: accent,
      light: neutral('light', DEFAULT_LIGHT),
      dark: neutral('dark', DEFAULT_DARK),
      radius: RADIUS[radiusKey] || RADIUS.rounded,
      fontHeading: FONTS[headingKey] || FONTS.system,
      fontBody: FONTS[bodyKey] || FONTS.system,
      fontHeadingKey: headingKey,
      fontBodyKey: bodyKey,
      showToggle: get(['appearance', 'showToggle']) !== false,
      defaultMode: get(['appearance', 'defaultMode']) || 'auto',
    };
  }

  function fontHref(keys) {
    var seen = {};
    var needed = [];
    for (var i = 0; i < keys.length; i++) {
      var query = FONT_QUERIES[keys[i]];
      if (query && !seen[query]) {
        seen[query] = true;
        needed.push('family=' + query);
      }
    }
    return needed.length > 0 ? 'https://fonts.googleapis.com/css2?' + needed.join('&') + '&display=swap' : null;
  }

  window.PREVIEW = {
    PRESETS: PRESETS,
    DEFAULT_LIGHT: DEFAULT_LIGHT,
    DEFAULT_DARK: DEFAULT_DARK,
    RADIUS: RADIUS,
    FONTS: FONTS,
    FONT_QUERIES: FONT_QUERIES,
    pick: pick,
    getIn: getIn,
    resolveTheme: resolveTheme,
    fontHref: fontHref,
  };
})();
