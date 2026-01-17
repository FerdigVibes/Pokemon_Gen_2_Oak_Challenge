const STORAGE_KEY = 'oak:lang';

let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
window.__LANG__ = currentLang; // ✅ make it globally accessible

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  currentLang = lang;
  window.__LANG__ = lang; // ✅ also update global ref
  localStorage.setItem(STORAGE_KEY, lang);

  window.dispatchEvent(new CustomEvent('language-changed', {
    detail: { lang }
  }));
}
