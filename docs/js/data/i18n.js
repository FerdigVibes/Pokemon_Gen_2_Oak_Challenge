// docs/js/data/i18n.js

import { getLanguage } from '../state/language.js';

let translations = {};

/* =========================================================
   LOAD LANGUAGE FILE
   ========================================================= */

export async function loadLanguage(lang) {
  const res = await fetch(`./js/data/lang/${lang}.json`);
  if (!res.ok) {
    console.warn(`Language file not found: ${lang}, falling back to en`);
    return;
  }
  translations = await res.json();
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
