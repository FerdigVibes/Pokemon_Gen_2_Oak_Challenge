// docs/js/ui/detail.js

import { playPokemonCry } from './cry.js';
import { getLanguage } from '../state/language.js';
import { resolveLangField, t } from '../data/i18n.js';
import { normalizeGameId } from '../utils/normalizeGameId.js';

let currentSelection = null; // { pokemon, game }
let isShiny = false;
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

export function renderPokemonDetail(pokemon, game, sectionId) {
  const entry = getDetailEntry(pokemon, game, sectionId);

  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  currentSelection = { pokemon, game, sectionId };

  const lang = getLanguage();
  const displayName =
    pokemon.names?.[lang] || pokemon.names?.en || pokemon.slug;

  const dex = String(pokemon.dex).padStart(3, '0');
  const isGen1 = ['red', 'blue', 'yellow'].includes(game.id);

  isShiny = false; // reset whenever a new Pokémon is opened
   
  const getSpritePath = () =>
   `./assets/sprites/${isShiny ? 'shiny' : 'normal'}/${dex}-${pokemon.slug}.gif`;

  const regionalDex =
  entry?.regionalDex
    ? ` · ${t('regionalDex')} #${entry.regionalDex}`
    : '';

  panel.innerHTML = `
   <div class="detail-sprite-window">
    <img
     src="${getSpritePath()}"
     alt="${displayName}"
     data-cry
     class="detail-sprite-img"
    />
   </div>
   
   <div class="detail-header">
    <div class="detail-name-row">
     <h2 class="detail-name">${displayName}</h2>
     
     <button
      class="shiny-toggle"
      id="shiny-toggle"
      aria-label="Toggle shiny"
      title="Toggle shiny"
     >
      ✨
     </button>
    </div>
   
    <div class="detail-dex">
     ${t('nationalDex')} #${dex}${regionalDex || ''}
    </div>
   </div>
   
   ${
     entry?.obtain?.length
       ? renderObtainMethods(entry.obtain, lang)
       : `<p style="opacity:.6">${t('notObtainable')}</p>`
    }
  `;

  /* ---------- Shiny toggle ---------- */

   const spriteImg = panel.querySelector('.detail-sprite img');
   const shinyBtn = panel.querySelector('#shiny-toggle');
   
   // Disable shiny toggle entirely for Gen 1
   if (isGen1 && shinyBtn) {
     shinyBtn.remove();
   }
   
   if (spriteImg && shinyBtn && !isGen1) {
     shinyBtn.addEventListener('click', () => {
       isShiny = !isShiny;
   
       spriteImg.src = getSpritePath();
   
       shinyBtn.classList.toggle('active', isShiny);
     });
   }

  /* ---------- Sprite → Cry ---------- */

  panel.querySelector('[data-cry]')
    ?.addEventListener('click', () => playPokemonCry(pokemon));
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
  if (isGen1) {
   panel.querySelector('#shiny-toggle')?.remove();
  }

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









