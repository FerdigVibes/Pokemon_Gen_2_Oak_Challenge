import { isCaught } from './caught.js';

export function getGlobalProgress(game, pokemon) {
  // Prefer explicit total, fallback to section sum
  const total =
    game.total ??
    game.sections
      ?.filter(s => s.requiredCount)
      .reduce((sum, s) => sum + s.requiredCount, 0) ??
    0;

  let caught = 0;

  pokemon.forEach(p => {
    if (isCaught(game.id, p.dex)) caught++;
  });

  return {
    caught,
    total,
    percent: total ? Math.floor((caught / total) * 100) : 0
  };
}
