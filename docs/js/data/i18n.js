let translations = {};

export async function loadLanguage(lang) {
  const res = await fetch(`./data/lang/${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load language: ${lang}`);
  translations = await res.json();
}

export function t(key, vars = {}) {
  let str = translations[key] || key;

  // simple interpolation: {{count}}
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{{${k}}}`, v);
  });

  return str;
}
