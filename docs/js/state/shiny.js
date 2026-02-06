const SHINY_KEY = 'oak:ui:shiny';

export function isShinyEnabled() {
  return localStorage.getItem(SHINY_KEY) === 'true';
}

export function setShinyEnabled(value) {
  localStorage.setItem(SHINY_KEY, String(value));
}

export function toggleShiny() {
  const next = !isShinyEnabled();
  setShinyEnabled(next);
  return next;
}
