// docs/js/data/loader.js

export async function loadGame(gameId) {
  // ❗ DO NOT normalize here
  const gameUrl = `./data/games/${gameId}.json`;

  console.log('[LOAD GAME]', gameId, '→', gameUrl);

  const gameRes = await fetch(gameUrl);
  if (!gameRes.ok) {
    throw new Error(`Failed to load game JSON (${gameRes.status}): ${gameUrl}`);
  }

  const game = await gameRes.json();

  const indexRes = await fetch('./data/pokemon/index.json');
  if (!indexRes.ok) {
    throw new Error('Failed to load Pokémon index');
  }

  const pokemonIndex = await indexRes.json();

  const pokemon = await Promise.all(
    pokemonIndex.map(async file => {
      const res = await fetch(`./data/pokemon/${file}`);
      if (!res.ok) {
        throw new Error(`Failed to load Pokémon JSON: ${file}`);
      }
      return res.json();
    })
  );

  game.pokemon = pokemon;
  return game;
}

