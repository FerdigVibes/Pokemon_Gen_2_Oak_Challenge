// docs/js/data/i18n.js

let translations = {};

export async function loadLanguage(lang) {
  const res = await fetch(`./js/data/lang/${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load language: ${lang}`);
  translations = await res.json();
}

export function t(key, vars = {}) {
  let str = translations[key] || key;

  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{{${k}}}`, v);
  });

  return str;
}

export function resolveLangField(field, lang) {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field[lang] || field.en || null;
}
