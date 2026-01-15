export function normalizeGameId(id) {
  return id
    .replace('_gbc', '')
    .replace('_vc', '');
}
