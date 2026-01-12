// docs/js/ui/sections.js

import { renderPokemonDetail } from './detail.js';
import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';
import { getLanguage } from '../state/language.js';
import { t } from '../data/i18n.js';
import { getGameTime } from '../state/gameTime.js';

const GEN2_IDS = new Set(['gold', 'silver', 'crystal']);

const TIME_SLOTS = ['morning', 'day', 'night'];
const TIME_ICONS = {
  morning: '🌅',
  day: '☀️',
  night: '🌙'
};

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = {
  monday: 'Mo',
  tuesday: 'Tu',
  wednesday: 'We',
  thursday: 'Th',
  friday: 'Fr',
  saturday: 'Sa',
  sunday: 'Su'
};

const MOON_STONE_SECTIONS = new Set([
  'MOON_STONE_1',
  'MOON_STONE_2'
]);

// Tracks sections manually expanded by the user
const userExpandedSections = new Set();

function getGameEntries(pokemon, gameId) {
  const raw = pokemon.games?.[gameId];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/* =========================================================
   Helpers
   ========================================================= */

function getPokemonTimeAvailability(gameData) {
  if (!gameData?.obtain) return [];
  return gameData.obtain.flatMap(o =>
    Array.isArray(o.time) ? o.time : o.time ? [o.time] : []
  );
}

function getPokemonDayAvailability(gameData) {
  if (!gameData?.obtain) return [];
  return gameData.obtain.flatMap(o => Array.isArray(o.days) ? o.days : []);
}

function updateSectionCounter(sectionBlock) {
  const sectionId = sectionBlock.dataset.sectionId;
  const gameId = sectionBlock.dataset.gameId;
  const required = Number(sectionBlock.dataset.requiredCount);
  if (!required) return;

  const rows = sectionBlock.querySelectorAll('.pokemon-row');
  let caughtCount = 0;

  if (sectionId === 'STARTER') {
    const families = {};
    rows.forEach(row => {
      const family = row.dataset.family;
      if (!families[family]) families[family] = [];
      families[family].push(row);
    });

    caughtCount = Object.values(families).filter(familyRows =>
      familyRows.some(row => isCaught(gameId, Number(row.dataset.dex)))
    ).length;
  } else {
    caughtCount = Array.from(rows).filter(row =>
      isCaught(gameId, Number(row.dataset.dex))
    ).length;
  }

  sectionBlock._counterEl.textContent = t('sectionCaughtCount', {
    caught: caughtCount,
    total: required
  });
}

function isSectionCompleted(game, sectionId, pokemon, excludeDex = []) {
  const section = game.sections.find(s => s.id === sectionId);
  if (!section) return false;

  if (section.requiredCount) {
    const matches = pokemon.filter(p => {
      if (excludeDex.includes(p.dex)) return false;
    
      const entries = getGameEntries(p, game.id);
      return entries.some(e =>
        e.sections?.includes(sectionId)
      );
    });

    const caughtCount = matches.filter(p =>
      isCaught(game.id, p.dex)
    ).length;

    return caughtCount >= section.requiredCount;
  }

  if (Array.isArray(section.children)) {
    return section.children.every(childId =>
      isSectionCompleted(game, childId, pokemon, excludeDex)
    );
  }

  return false;
}

function isPokemonAvailable(pokemon, game) {
  const gameData = pokemon.games?.[game.id];
  if (!gameData) return false;

  const gate = gameData.availability;
  if (!gate) return true;

  if (gate.afterSection) {
    const exclude = gate.excludeDex ?? [];

    return isSectionCompleted(
      game,
      gate.afterSection,
      window.__POKEMON_CACHE__,
      exclude
    );
  }

  return true;
}


function applyStarterExclusivity(sectionBlock, gameId) {
  const rows = sectionBlock.querySelectorAll('.pokemon-row');

  const families = {};
  rows.forEach(row => {
    const family = row.dataset.family;
    if (!family) return;
    if (!families[family]) families[family] = [];
    families[family].push(row);
  });

  rows.forEach(row => { row.style.display = ''; });

  let chosenFamily = null;
  Object.entries(families).forEach(([family, familyRows]) => {
    if (familyRows.some(row => isCaught(gameId, Number(row.dataset.dex)))) {
      chosenFamily = family;
    }
  });

  if (chosenFamily) {
    Object.entries(families).forEach(([family, familyRows]) => {
      if (family !== chosenFamily) {
        familyRows.forEach(row => { row.style.display = 'none'; });
      }
    });
  }
}

function applyMoonStoneExclusivity(gameId) {
  const rows = document.querySelectorAll('.pokemon-row');

  // Group ONLY Moon Stone rows by Pokémon dex
  const groupsByDex = {};

  rows.forEach(row => {
    const sectionId =
      row.closest('.section-block')?.dataset.sectionId;

    if (!MOON_STONE_SECTIONS.has(sectionId)) return;

    const dex = Number(row.dataset.dex);
    if (!groupsByDex[dex]) groupsByDex[dex] = [];
    groupsByDex[dex].push(row);
  });

  // Apply exclusivity PER POKÉMON
  Object.values(groupsByDex).forEach(group => {
    const caughtRow = group.find(row =>
      isCaught(gameId, Number(row.dataset.dex))
    );

    group.forEach(row => {
      row.style.display =
        caughtRow && row !== caughtRow ? 'none' : '';
    });
  });
}


/* =========================================================
   Time/Day Icon Renderers (Gen 2 only)
   ========================================================= */

function appendRowTimeIcons(gameId, gameData, row) {
  if (!GEN2_IDS.has(gameId)) return;

  const availability = getPokemonTimeAvailability(gameData);
  if (!availability.length) return;

  const { period } = getGameTime();

  const wrapper = document.createElement('span');
  wrapper.className = 'row-time-icons';

  TIME_SLOTS.forEach(slot => {
    const span = document.createElement('span');
    span.className = 'time-icon';
    span.textContent = TIME_ICONS[slot];

    // Lit only if allowed AND matches current period
    if (availability.includes(slot) && slot === period) span.classList.add('active');
    else span.classList.add('inactive');

    wrapper.appendChild(span);
  });

  row.appendChild(wrapper);
}

function appendRowDayIcons(gameId, gameData, row) {
  if (!GEN2_IDS.has(gameId)) return;

  const availableDays = getPokemonDayAvailability(gameData);
  if (!availableDays.length) return;

  const { dayOfWeek } = getGameTime();

  const wrapper = document.createElement('div');
  wrapper.className = 'row-day-icons';

  DAYS.forEach(d => {
    const span = document.createElement('span');
    span.className = 'day-icon';
    span.textContent = DAY_LABELS[d];

    // Lit only if allowed AND matches current day
    if (availableDays.includes(d) && d === dayOfWeek) span.classList.add('active');
    else span.classList.add('inactive');

    wrapper.appendChild(span);
  });

  row.appendChild(wrapper);
}

/* =========================================================
   React to caught changes
   ========================================================= */

window.addEventListener('caught-changed', () => {
  document.querySelectorAll('.section-block').forEach(section => {
    updateSectionCounter(section);

    if (section.dataset.sectionId === 'STARTER') {
      applyStarterExclusivity(section, section.dataset.gameId);
    }
  });

  if (window.__CURRENT_GAME__) {
    applyMoonStoneExclusivity(window.__CURRENT_GAME__.data.id);
    document.querySelectorAll('.section-block').forEach(updateSectionCounter);
  }
});

/* =========================================================
   SECTION 2 RENDERER
   ========================================================= */

export function renderSections({ game, pokemon }) {
  window.__POKEMON_CACHE__ = pokemon;

  const container = document.getElementById('section-list');
  if (!container) return;
  container.innerHTML = '';

  game.sections.forEach(section => {
    if (!section.requiredCount) return;

    const sectionBlock = document.createElement('div');
    sectionBlock.className = 'section-block';
    sectionBlock.dataset.sectionId = section.id;
    sectionBlock.dataset.requiredCount = section.requiredCount;
    sectionBlock.dataset.gameId = game.id;
    sectionBlock.dataset.titleKey = section.titleKey;

    const header = document.createElement('h2');
    header.className = 'section-header';

    const counter = document.createElement('span');
    counter.className = 'section-counter';
    counter.textContent = t('sectionCaughtCount', { caught: 0, total: section.requiredCount });

    const title = document.createElement('span');
    title.className = 'section-title';
    title.textContent = t(section.titleKey);

    header.append(counter, title);
    sectionBlock._counterEl = counter;

    const sectionRows = document.createElement('div');
    sectionRows.className = 'section-rows';

    header.addEventListener('click', () => {
      const collapsed = sectionRows.style.display === 'none';
      sectionRows.style.display = collapsed ? '' : 'none';
      header.classList.toggle('collapsed', !collapsed);

      if (collapsed) userExpandedSections.add(section.id);
      else userExpandedSections.delete(section.id);
    });

    const matches = pokemon.filter(p => {
      const entriesRaw = p.games?.[game.id];
      if (!entriesRaw) return false;
    
      const entries = Array.isArray(entriesRaw)
        ? entriesRaw
        : [entriesRaw];
    
      return entries.some(entry =>
        entry.sections?.includes(section.id)
      );
    });

    matches.forEach(p => {
      const caught = isCaught(game.id, p.dex);

      const row = document.createElement('div');
      row.className = 'pokemon-row';
      row.dataset.dex = String(p.dex);

      const lang = getLanguage();
      const displayName = p.names?.[lang] || p.names?.en || p.slug;
      row.dataset.name = displayName.toLowerCase();
      row.dataset.family = p.evolution?.family?.join('|') ?? '';

      const ball = document.createElement('button');
      ball.className = 'caught-toggle';
      ball.style.backgroundImage = `url(./assets/icons/${
        caught ? 'pokeball-full.png' : 'pokeball-empty.png'
      })`;

      ball.addEventListener('click', e => {
        e.stopPropagation();

        const newState = toggleCaught(game.id, p.dex);
        ball.style.backgroundImage = `url(./assets/icons/${
          newState ? 'pokeball-full.png' : 'pokeball-empty.png'
        })`;

        row.classList.toggle('is-caught', newState);
        if (newState) playPokemonCry(p);

        window.dispatchEvent(
          new CustomEvent('caught-changed', {
            detail: { gameId: game.id, dex: p.dex, caught: newState }
          })
        );
      });

      const icon = document.createElement('img');
      icon.className = 'pokemon-icon';
      icon.src = `./assets/icons/pokemon/${String(p.dex).padStart(3, '0')}-${p.slug}-icon.png`;
      icon.alt = displayName;

      row.append(
        ball,
        icon,
        document.createTextNode(` #${String(p.dex).padStart(3, '0')} `),
        document.createTextNode(displayName)
      );

      // Gen 2 availability UI (time + days)
      const entriesRaw = p.games?.[game.id];
      const entries = Array.isArray(entriesRaw)
        ? entriesRaw
        : entriesRaw ? [entriesRaw] : [];
      
      entries.forEach(entry => {
        appendRowTimeIcons(game.id, entry, row);
        appendRowDayIcons(game.id, entry, row);
      });

      row.addEventListener('click', () => {
        const app = document.getElementById('app');
        const isActive = row.classList.contains('is-active');

        document.querySelectorAll('.pokemon-row.is-active')
          .forEach(r => r.classList.remove('is-active'));

        if (isActive) {
          app?.classList.remove('has-detail');
          return;
        }

        row.classList.add('is-active');
        renderPokemonDetail(p, game);
        playPokemonCry(p);
        app?.classList.add('has-detail');
      });

      if (caught) row.classList.add('is-caught');

      sectionRows.appendChild(row);
    });

    if (section.id === 'STARTER') {
      applyStarterExclusivity(sectionBlock, game.id);
    }

    sectionBlock.append(header, sectionRows);
    container.appendChild(sectionBlock);

    updateSectionCounter(sectionBlock);
    applyMoonStoneExclusivity(game.id);
    document.querySelectorAll('.section-block').forEach(updateSectionCounter);
  });
}

window.__isPokemonAvailable = isPokemonAvailable;
