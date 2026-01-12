// docs/js/data/loader.js
// Loads a single game and all of its Pokémon data
function normalizeGameId(id) {
  if (id === 'crystal_gbc' || id === 'crystal_vc') {
    return 'crystal';
  }
  return id;
}

export async function loadGame(gameId) {
  // 1️⃣ Load game JSON
  const gameRes = await fetch(`./data/games/${gameId}.json`);
  if (!gameRes.ok) {
    throw new Error(`Failed to load game: ${gameId}`);
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
        throw new Error(`Failed to load Pokémon: ${file}`);
      }
      return res.json();
    })
  );

  // 4️⃣ Attach Pokémon list to game
  game.pokemon = pokemon;

  return game;
}
