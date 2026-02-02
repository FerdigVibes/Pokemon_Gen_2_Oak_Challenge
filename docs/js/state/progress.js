import { isCaught } from './caught.js';
import { normalizeGameId } from '../utils/normalizeGameId.js';

export function getGlobalProgress(game, pokemon) {
  const total = game.totalPokemon;

  const gameKey = normalizeGameId(game.id);

  // Count caught Pokémon for THIS game only
  const caught = pokemon.filter(p =>
    p.games?.[gameKey] &&
    isCaught(game.id, p.dex)
  ).length;

  const percent = total > 0
    ? Math.min(100, Math.round((caught / total) * 100))
    : 0;

  return { caught, total, percent };
}
