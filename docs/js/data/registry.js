const registry = new Map();

export function registerPokemon(pokemon) {
  registry.set(pokemon.slug, pokemon);
}

export function getAllPokemon() {
  return Array.from(registry.values());
}

export const GAME_REGISTRY = [
  {
    genKey: 'gen1',
    games: [
      { id: 'red', labelKey: 'red' },
      { id: 'blue', labelKey: 'blue' },
      { id: 'yellow', labelKey: 'yellow' }
    ]
  },
  {
    genKey: 'gen2',
    games: [
      { id: 'gold', labelKey: 'gold' },
      { id: "crystal_gbc", labelKey: "crystalGBC" },
      { id: "crystal_vc", labelKey: "crystalVC" }
    ]
  }
];
