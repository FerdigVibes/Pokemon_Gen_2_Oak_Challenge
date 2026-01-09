const keyForGame = (gameId) => `oak:${gameId}:caught`;

export function getCaught(gameId) {
  return JSON.parse(localStorage.getItem(keyForGame(gameId)) || '{}');
}

export function isCaught(gameId, dex) {
  const caught = getCaught(gameId);
  return !!caught[dex];
}

export function toggleCaught(gameId, dex) {
  const caught = getCaught(gameId);
  caught[dex] = !caught[dex];
  localStorage.setItem(keyForGame(gameId), JSON.stringify(caught));
  return caught[dex];
}
