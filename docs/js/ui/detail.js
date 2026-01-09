import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';

/* =========================
   Section 3 main renderer
   ========================= */

export function renderPokemonDetail(pokemon, game) {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  const dex = String(pokemon.dex).padStart(3, '0');
  const spritePath = `./assets/sprites/normal/${dex}-${pokemon.slug}.gif`;

  const gameData = pokemon.games?.[game.id];
  const caught = isCaught(game.id, pokemon.dex);

  const pokeballPath = `./assets/icons/${
    caught ? 'pokeball-full.png' : 'pokeball-empty.png'
  }`;

  panel.innerHTML = `
    <div class="detail-sprite">
      <img
        src="${spritePath}"
        alt="${pokemon.names.en}"
        data-cry
        style="cursor:pointer"
      />
    </div>

    <button
      id="detail-caught"
      class="caught-toggle"
      style="background-image:url(${pokeballPath})"
    ></button>

    <h2>${pokemon.names.en}</h2>

    <p>
      <strong>National Dex:</strong> #${dex}
    </p>

    ${
      gameData
        ? renderGameInfo(gameData)
        : `<p style="opacity:.6">Not obtainable in this game.</p>`
    }
  `;

  // Sprite cry
  const sprite = panel.querySelector('[data-cry]');
  if (sprite) {
    sprite.addEventListener('click', () => {
      playPokemonCry(pokemon);
    });
  }

  // Pokéball toggle + cry
  const ball = panel.querySelector('#detail-caught');
  if (ball) {
    ball.addEventListener('click', () => {
      const newState = toggleCaught(game.id, pokemon.dex);

      ball.style.backgroundImage = `url(./assets/icons/${
        newState ? 'pokeball-full.png' : 'pokeball-empty.png'
      })`;

      playPokemonCry(pokemon);
    });
  }
}

/* =========================
   Game-specific rendering
   ========================= */

function renderGameInfo(gameData) {
  const obtainHtml = (gameData.obtain || [])
    .map(o => renderObtainEntry(o))
    .join('');

  return `
    <h3>How to Obtain</h3>
    <ul>
      ${obtainHtml || '<li>—</li>'}
    </ul>
  `;
}

function renderObtainEntry(o) {
  const locations = Array.isArray(o.locations)
    ? o.locations.join(', ')
    : o.location ?? null;

  const time = Array.isArray(o.time)
    ? o.time.join(', ')
    : null;

  return `
    <li style="margin-bottom:8px;">
      ${locations ? `<strong>Locations:</strong> ${locations}<br/>` : ''}
      ${time ? `<strong>Time:</strong> ${time}<br/>` : ''}
      ${o.notes ? `<em>${o.notes}</em>` : ''}
    </li>
  `;
}





