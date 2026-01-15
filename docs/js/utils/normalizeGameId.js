// docs/js/utils/normalizeGameId.js
export function normalizeGameId(id) {
  const key = String(id || '').toLowerCase().trim();

  if (key === 'crystal_vc') return 'crystal';
  if (key === 'crystal_gbc') return 'crystal';

  return key;
}
