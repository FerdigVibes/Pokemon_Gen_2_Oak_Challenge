// docs/js/ui/detail.js

import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';
import { getLanguage } from '../state/language.js';
import { resolveLangField, t } from '../data/i18n.js';

let currentSelection = null; // { pokemon, game }

/* =========================================================
   React to language changes
   ========================================================= */

window.addEventListener('language-changed', () => {
  if (!currentSelection) return;
  renderPokemonDetail(
    currentSelection.pokemon,
    currentSelection.game,
    currentSelection.sectionId
  );
});

function getDetailEntry(pokemon, game, sectionId) {
  const raw = pokemon.games?.[game.id];
  if (!raw) return null;

  const entries = Array.isArray(raw) ? raw : [raw];

  // Prefer entry matching the clicked section
  if (sectionId) {
    const match = entries.find(e =>
      e.sections?.includes(sectionId)
    );
    if (match) return match;
  }

  // Fallback (non-duplicated Pokémon)
  return entries[0] ?? null;
}

/* =========================================================
   SECTION 3 — Pokémon Detail Panel
   ========================================================= */

export function renderPokemonDetail(pokemon, game, sectionId) {
  const entry = getDetailEntry(pokemon, game, sectionId);

  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  currentSelection = { pokemon, game, sectionId };

  const lang = getLanguage();
  const displayName =
    pokemon.names?.[lang] || pokemon.names?.en || pokemon.slug;

  const dex = String(pokemon.dex).padStart(3, '0');
  const spritePath = `./assets/sprites/normal/${dex}-${pokemon.slug}.gif`;

  const caught = isCaught(game.id, pokemon.dex);

  const pokeballPath = `./assets/icons/${
    caught ? 'pokeball-full.png' : 'pokeball-empty.png'
  }`;

  panel.innerHTML = `
    <div class="detail-sprite">
      <img
        src="${spritePath}"
        alt="${displayName}"
        data-cry
        style="cursor:pointer"
      />
    </div>

    <button
      id="detail-caught"
      class="caught-toggle"
      style="background-image:url(${pokeballPath})"
      aria-label="${t('caught')}"
    ></button>

    <h2>${displayName}</h2>

    <p>
      <strong>${t('nationalDex')}:</strong> #${dex}
    </p>

    ${
      entry?.obtain?.length
        ? renderObtainMethods(entry.obtain, lang)
        : `<p style="opacity:.6">${t('notObtainable')}</p>`
    }
  `;

  /* ---------- Sprite → Cry ---------- */

  panel.querySelector('[data-cry]')
    ?.addEventListener('click', () => playPokemonCry(pokemon));

  /* ---------- Pokéball toggle ---------- */

  const ball = panel.querySelector('#detail-caught');
  if (ball) {
    ball.addEventListener('click', () => {
      const newState = toggleCaught(game.id, pokemon.dex);

      ball.style.backgroundImage = `url(./assets/icons/${
        newState ? 'pokeball-full.png' : 'pokeball-empty.png'
      })`;

      if (newState) playPokemonCry(pokemon);

      window.dispatchEvent(
        new CustomEvent('caught-changed', {
          detail: {
            gameId: game.id,
            dex: pokemon.dex,
            caught: newState
          }
        })
      );
    });
  }
}

/* =========================================================
   Game-specific info (translated fields)
   ========================================================= */

function renderObtainMethods(obtain, lang) {
  const items = obtain.map(o => renderObtainEntry(o, lang)).join('');

  return `
    <h3>${t('howToObtain')}</h3>
    <ul>
      ${items || `<li>${t('notObtainable')}</li>`}
    </ul>
  `;
}

export function closePokemonDetail() {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  panel.innerHTML = '';
  currentSelection = null;

  document.getElementById('app')?.classList.remove('has-detail');

  document
    .querySelectorAll('.pokemon-row.is-active')
    .forEach(r => r.classList.remove('is-active'));
}

function renderObtainEntry(o, lang) {
  const method = o.methodKey ? t(o.methodKey) : '';

  const locations = Array.isArray(o.locations)
    ? o.locations.map(l => resolveLangField(l, lang)).join(', ')
    : resolveLangField(o.location, lang);

  const timeRaw = resolveLangField(o.time, lang);
  const time = Array.isArray(timeRaw) ? timeRaw.join(', ') : timeRaw;

  const notes = resolveLangField(o.notes, lang);

  return `
    <li style="margin-bottom:8px;">
      ${method ? `<strong>${method}</strong><br/>` : ''}
      ${locations ? `<strong>${t('locations')}:</strong> ${locations}<br/>` : ''}
      ${time ? `<strong>${t('time')}:</strong> ${time}<br/>` : ''}
      ${notes ? `<em>${notes}</em>` : ''}
    </li>
  `;
}

export function getCurrentDetailSelection() {
  return currentSelection;
}









