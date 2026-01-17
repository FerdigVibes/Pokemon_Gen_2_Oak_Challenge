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
    method = '—',
    locations = [],
    time = [],
    days = [],
  } = entry;

  const lang = getLanguage();

  // 🧠 If notes is an object with translations, grab the right one
  let notes = '';
  if (typeof entry.notes === 'string') {
    notes = entry.notes;
  } else if (typeof entry.notes === 'object' && entry.notes !== null) {
    notes = entry.notes[lang] || entry.notes.en || '';
  }

  const timeStr = generation === 2 && time.length
   ? `${t('detail.time')}: ${time.join(', ')}`
   : '';

  const fullDayMap = {
   mon: 'monday',
   tue: 'tuesday',
   wed: 'wednesday',
   thu: 'thursday',
   fri: 'friday',
   sat: 'saturday',
   sun: 'sunday'
  };

  const dayStr = generation === 2 && days.length
   ? `${t('detail.days')}: ${days.map(d => t(`days.${fullDayMap[d] || d}`)).join(', ')}`
   : '';
   
  const locationStr = locations.length
   ? `${t('detail.locations')}: ${locations.join(', ')}`
   : '';
   
  return `
   <div class="obtain-method">
    <strong>${t('detail.method')}:</strong> ${t(`methods.${method}`) || method}<br />
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
    panel.innerHTML = `<p>${pokemon.slug} is not available in this version.</p>`;
    return;
  }

  const lang = getLanguage();
  const name = pokemon.names?.[lang] || pokemon.names?.en || pokemon.slug;
  const dex = pokemon.dex;
  const regDex = gameData.regionalDex?.[String(dex)];

  // Sprites
  const spriteFile = `${String(dex).padStart(3, '0')}-${pokemon.slug}.gif`;
  const spriteNormal = `./assets/sprites/normal/${spriteFile}`;
  const spriteShiny = `./assets/sprites/shiny/${spriteFile}`;

  // Types
  const types = pokemon.types || [];

  // Obtain info
  const obtain = Array.isArray(gameEntry.obtain) ? gameEntry.obtain : [];

  panel.innerHTML = `
    <div class="detail-header">
      <h2 class="detail-name">
        ${name}
        <span id="shiny-toggle" class="shiny-icon" title="Toggle shiny sprite">✨</span>
      </h2>
      <div class="detail-dex">
        National Dex: #${String(dex).padStart(3, '0')}
        ${regDex ? ` | Regional Dex: #${regDex}` : ''}
      </div>
    </div>

    <div class="detail-sprite-window" id="sprite-window">
      <img 
        class="detail-sprite-img" 
        id="detail-sprite" 
        src="${spriteNormal}" 
        alt="${name}" 
        onerror="this.src='./assets/icons/pokeball-empty.png'"
      />
    </div>

    <div class="type-list">
      ${types.map(type => {
        const label = t(`types.${type}`) || type.toUpperCase();
        return `<span class="type-badge type-${type}">${label}</span>`;
      }).join('')}
    </div>

    <div class="obtain-section">
      <h3>${t('detail.obtainTitle')}</h3>
      ${obtain.length
        ? obtain.map(o => buildObtainHTML(o, gameData.generation)).join('')
        : '<p>—</p>'}
    </div>
  `;

  const shinyToggle = document.getElementById('shiny-toggle');
  const sprite = document.getElementById('detail-sprite');
  const spriteWindow = document.getElementById('sprite-window');
  if (shinyToggle && sprite) {
     const gen = gameData.generation || 1;
   
     if (gen >= 2) {
       let isShiny = false;
   
       const toggleShiny = () => {
         isShiny = !isShiny;
         sprite.src = isShiny ? spriteShiny : spriteNormal;
         shinyToggle.classList.toggle('active', isShiny);
         spriteWindow.classList.toggle('shiny-active', isShiny);
       };
   
       shinyToggle.addEventListener('click', toggleShiny);
     } else {
       shinyToggle.style.display = 'none';
     }
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
      ${method ? `<strong>${t('method')}:</strong><br/>` : ''}
      ${locations ? `<strong>${t('locations')}:</strong> ${locations}<br/>` : ''}
      ${time ? `<strong>${t('time')}:</strong> ${time}<br/>` : ''}
      ${notes ? `<em>${notes}</em>` : ''}
    </li>
  `;
}

export function getCurrentDetailSelection() {
  return currentSelection;
}









