// docs/js/ui/detail.js

import { playPokemonCry } from './cry.js';
import { getLanguage } from '../state/language.js';
import { resolveLangField, t } from '../data/i18n.js';
import { normalizeGameId } from '../utils/normalizeGameId.js';

let currentSelection = null; // { pokemon, game }

const GEN1_IDS = new Set(['red', 'blue', 'yellow']);
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

function buildObtainHTML(entry, generation) {
  const {
    method,
    locations = [],
    time = [],
    days = [],
    notes
  } = entry;

  const timeStr = generation === 2 && time.length
    ? `Time: ${time.join(', ')}`
    : '';

  const dayStr = generation === 2 && days.length
    ? `Days: ${days.join(', ')}`
    : '';

  const locationStr = locations.length
    ? `Locations: ${locations.join(', ')}`
    : '';

  return `
    <div class="obtain-method">
      <strong>Method:</strong> ${method}<br />
      ${locationStr ? `<strong>${locationStr}</strong><br />` : ''}
      ${timeStr ? `<span class="time-label">${timeStr}</span><br />` : ''}
      ${dayStr ? `<span class="day-label">${dayStr}</span><br />` : ''}
      ${notes ? `<p class="notes">${notes}</p>` : ''}
    </div>
  `;
}

function getDetailEntry(pokemon, game, sectionId) {
  const gameKey = normalizeGameId(game.id);
  const raw = pokemon.games?.[gameKey];
  if (!raw) return null;

  const entries = Array.isArray(raw) ? raw : [raw];

  if (sectionId) {
    const match = entries.find(e => e.sections?.includes(sectionId));
    if (match) return match;
  }

  return entries[0] ?? null;
}

/* =========================================================
   SECTION 3 — Pokémon Detail Panel
   ========================================================= */

export function renderPokemonDetail(pokemon, gameData, sectionId) {
  const panel = document.getElementById('detail-panel');
  if (!panel || !pokemon || !gameData) return;

  const gameKey = normalizeGameId(gameData.id);
  const gameEntry = pokemon.games?.[gameKey];
  if (!gameEntry) {
    panel.innerHTML = `<p>${pokemon.slug} not found in this version.</p>`;
    return;
  }

  const lang = getLanguage();
  const name = pokemon.names?.[lang] || pokemon.names?.en || pokemon.slug;
  const dex = pokemon.dex;
  const regDex = gameData.regionalDex?.[dex];

  // Sprites (normal/shiny) — assuming sprites use the slug and padded dex
  const spriteBase = `./assets/sprites/${String(dex).padStart(3, '0')}-${pokemon.slug}`;
  const spriteNormal = `${spriteBase}.gif`;
  const spriteShiny = `${spriteBase}-shiny.gif`;

  // Types
  const types = pokemon.types || [];

  // Obtain methods
  const obtain = Array.isArray(gameEntry.obtain)
    ? gameEntry.obtain
    : [];

  // HTML generation
  panel.innerHTML = `
    <div class="detail-header">
      <h2 class="detail-name">${name}</h2>
      <div class="detail-dex">#${String(dex).padStart(3, '0')}
        ${regDex ? ` | Johto #${regDex}` : ''}
      </div>
    </div>

    <div class="detail-sprite-window" id="sprite-window">
      <img 
        class="detail-sprite-img" 
        id="detail-sprite" 
        src="${spriteNormal}" 
        alt="${name}" 
      />
    </div>

    <div class="type-list">
      ${types.map(type => `<span class="type-badge type-${type}">${type.toUpperCase()}</span>`).join('')}
    </div>

    <label class="shiny-toggle-label">
      <input type="checkbox" id="toggle-shiny" />
      Show Shiny Sprite
    </label>

    <div class="obtain-section">
      <h3>How to Obtain</h3>
      ${obtain.length ? obtain.map(o => buildObtainHTML(o, gameData.generation)).join('') : '<p>—</p>'}
    </div>
  `;

  // Wire shiny toggle
  const shinyToggle = document.getElementById('toggle-shiny');
  const sprite = document.getElementById('detail-sprite');
  const spriteWindow = document.getElementById('sprite-window');

  if (shinyToggle && sprite) {
    shinyToggle.addEventListener('change', () => {
      sprite.src = shinyToggle.checked ? spriteShiny : spriteNormal;
      spriteWindow.classList.toggle('shiny-active', shinyToggle.checked);
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









