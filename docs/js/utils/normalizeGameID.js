// docs/js/utils/normalizeGameId.js
export function normalizeGameId(id) {
  if (id === 'crystal_gbc' || id === 'crystal_vc') {
    return 'crystal';
  }
  return id;
}
