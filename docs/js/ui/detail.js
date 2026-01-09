// docs/js/ui/detail.js
// Renders Section 3 Pokémon detail (game-aware, minimal display)

import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';

export function renderPokemonDetail(pokemon, game) {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  const dex = String(pokemon.dex).padStart(3, '0');
  const spritePath = `./assets/sprites/normal/${dex}-${pokemon.slug}.gif`;

  const gameId = game.id;
  const gameData = pokemon.games?.[gameId];
  const caught = isCaught(game.id, pokemon.dex);
  const pokeballPath = `./assets/icons/${
    caught ? 'pokeball-full3D.png' : 'pokeball-empty3D.png'
  }`;

  panel.innerHTML = `
    <div class="detail-sprite">
      <img
        src="${spritePath}"
        alt="${pokemon.names.en}"
        data-cry
        style="cursor: pointer;"
      />
    </div>

      <!-- Section 3 Pokéball -->
    <button
      id="detail-caught"
      style="
        background-image: url(${pokeballPath});
        width: 48px;
        height: 48px;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
        border: none;
        cursor: pointer;
        margin: 8px 0;
      "
    ></button>

    <h2>${pokemon.names.en}</h2>

    <p>
      <strong>National Dex:</strong> #${dex}
    </p>

    ${
      gameData
        ? renderGameInfo(gameData)
        : `<p style="opacity:0.6">Not obtainable in this game.</p>`
    }
  `;
  
  // Pokéball toggle (Section 3)
  const ball = panel.querySelector('#detail-caught');
  if (ball) {
    ball.addEventListener('click', () => {
      const newState = toggleCaught(game.id, pokemon.dex);
  
      ball.style.backgroundImage = `url(./assets/icons/${
        newState ? 'pokeball-full3D.png' : 'pokeball-empty3D.png'
      })`;
    });
  }
  
  // Play cry on sprite click
  const sprite = panel.querySelector('[data-cry]');
  if (sprite) {
    sprite.addEventListener('click', () => {
      playPokemonCry(pokemon);
    });
  }
}

/* =========================
   Game-specific rendering
   ========================= */

function renderGameInfo(gameData) {
  const obtain = gameData.obtain || [];

  if (!obtain.length) {
    return `<p style="opacity:0.6">No obtain data.</p>`;
  }

  return `
    <div class="obtain-info">
      ${obtain.map(renderObtainEntry).join('')}
    </div>
  `;
}

function renderObtainEntry(o) {
  const locations = Array.isArray(o.locations)
    ? o.locations.join(', ')
    : o.location ?? null;

  const time = Array.isArray(o.time)
    ? o.time.join(', ')
    : o.time ?? null;

  return `
    <div style="margin-top: 10px;">
      ${locations ? `<p><strong>Location:</strong> ${locations}</p>` : ''}

      ${time ? `<p><strong>Time:</strong> ${time}</p>` : ''}

      ${o.notes ? `<p style="opacity:0.7;"><em>${o.notes}</em></p>` : ''}
    </div>
  `;
}



