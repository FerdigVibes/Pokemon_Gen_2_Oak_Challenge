// docs/js/data/loader.js

import { normalizeGameId } from '../utils/normalizeGameId.js';

export async function loadGame(gameId) {
  const normalizedId = normalizeGameId(gameId);
  const gameUrl = `./data/games/${normalizedId}.json`;

  console.log('[LOAD GAME]', gameId, '→', gameUrl);

  // 1️⃣ Load game JSON
  const gameRes = await fetch(gameUrl);
  if (!gameRes.ok) {
    throw new Error(`Failed to load game JSON (${gameRes.status}): ${gameUrl}`);
  }

  const game = await gameRes.json();

  // 2️⃣ Load Pokémon index
  const indexRes = await fetch('./data/pokemon/index.json');
  if (!indexRes.ok) {
    throw new Error('Failed to load Pokémon index');
  }

  const pokemonIndex = await indexRes.json();

  // 3️⃣ Load each Pokémon JSON
  const pokemon = await Promise.all(
    pokemonIndex.map(async file => {
      const res = await fetch(`./data/pokemon/${file}`);
      if (!res.ok) {
        throw new Error(`Failed to load Pokémon JSON: ${file}`);
      }
      return res.json();
    })
  );

  // 4️⃣ Attach Pokémon list to game
  game.pokemon = pokemon;

  return game;
}

