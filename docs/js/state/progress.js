import { isCaught } from './caught.js';

export function getGlobalProgress(game, pokemon) {
  const total = game.totalPokemon;

  // Count caught Pokémon for THIS game only
  const caught = pokemon.filter(p =>
    p.games?.[game.id] &&
    isCaught(game.id, p.dex)
  ).length;

  const percent = total > 0
    ? Math.min(100, Math.round((caught / total) * 100))
    : 0;

  return { caught, total, percent };
}
