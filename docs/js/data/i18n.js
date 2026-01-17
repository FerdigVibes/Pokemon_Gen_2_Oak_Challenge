// docs/js/data/i18n.js

import { getLanguage } from '../state/language.js';

let translations = {};

/* =========================================================
   LOAD LANGUAGE FILE
   ========================================================= */

export async function loadLanguage(lang) {
  const tryLoad = async (code) => {
    const res = await fetch(`./js/data/lang/${code}.json`);
    if (!res.ok) return null;
    return await res.json();
  };

  translations = await tryLoad(lang);

  if (!translations && lang !== 'en') {
    console.warn(`Falling back to English`);
    translations = await tryLoad('en');
  }

  if (!translations) {
    console.error('Failed to load any language data.');
    translations = {};
  }

  // Expose for debugging
  window.__I18N__ = translations;
}

/* =========================================================
   TRANSLATION LOOKUP (UI STRINGS)
   ========================================================= */

export function t(key, vars = {}) {
  let str = translations[key] ?? key;

  // simple {{var}} interpolation
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replaceAll(`{{${k}}}`, v);
  });

  return str;
}

/* =========================================================
   DATA FIELD LANGUAGE RESOLUTION (Pokémon JSON)
   ========================================================= */

export function resolveLangField(field, lang = getLanguage()) {
  if (!field) return null;

  // Already a plain string → assume English
  if (typeof field === 'string') return field;

  // Array (legacy data) → return as-is
  if (Array.isArray(field)) return field;

  // Language object → resolve safely
  return field[lang] ?? field.en ?? null;
}

// Expose for debugging in dev tools
window.t = t;
window.resolveLangField = resolveLangField;
window.__I18N__ = translations;
