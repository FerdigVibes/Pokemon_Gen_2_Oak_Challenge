const STORAGE_KEY = 'oak:shiny';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isShinyEnabled(dex) {
  const data = load();
  return !!data[dex];
}

export function toggleShiny(dex) {
  const data = load();
  data[dex] = !data[dex];
  save(data);
  return data[dex];
}

export function clearAllShiny() {
  localStorage.removeItem(STORAGE_KEY);
}
