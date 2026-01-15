// docs/js/utils/normalizeGameId.js
export function normalizeGameId(id) {
  return String(id || '').toLowerCase().trim();
}
