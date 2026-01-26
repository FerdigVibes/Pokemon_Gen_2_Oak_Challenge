// docs/js/ui/sections.js

import { renderPokemonDetail } from './detail.js';
import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';
import { getLanguage } from '../state/language.js';
import { t } from '../data/i18n.js';
import { normalizeGameId } from '../utils/normalizeGameId.js';
import { getGameTime } from '../state/gameTime.js';
import { setCurrentDetailSelection } from './detail.js';

const MOON_STONE_SECTIONS = new Set([
  'MOON_STONE_1',
  'MOON_STONE_2'
]);

// Tracks sections manually expanded by the user
const userExpandedSections = new Set();

function getGameEntries(pokemon, gameId) {
  const normalized = normalizeGameId(gameId);
  const raw = pokemon.games?.[normalized];
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

function isAvailableToday(entry) {
  if (!entry?.obtain) return true;

  const { day } = getGameTime();

  return entry.obtain.some(o => {
    if (!o.days) return true; // If no restriction, it's always available
    return o.days.includes(day);
  });
}

function hasTimeOrDayRestriction(entry) {
  if (!entry?.obtain) return false;
  return entry.obtain.some(o =>
    Array.isArray(o.time) || Array.isArray(o.days)
  );
}

function getPokemonDayAvailability(gameData) {
  if (!gameData?.obtain) return [];
  return gameData.obtain.flatMap(o => Array.isArray(o.days) ? o.days : []);
}

function isMoonStoneDexResolved(gameId, dex) {
  return isCaught(gameId, dex);
}

function updateSectionCounter(sectionBlock) {
  const sectionId = sectionBlock.dataset.sectionId;
  const gameId = sectionBlock.dataset.gameId;
  const required = Number(sectionBlock.dataset.requiredCount);
  if (Number.isNaN(required)) return;

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
    caughtCount = Array.from(rows).filter(row => {
      const dex = Number(row.dataset.dex);
    
      if (row.classList.contains('is-locked')) {
        return false;
      }
      
      return isCaught(gameId, dex);
    }).length;
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
    
      const entries = getGameEntries(p, normalizeGameId(game.id));
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

function isPokemonAvailable(gameEntry) {
  if (!gameEntry?.obtain) return true;

  const { day, hour, meridiem } = getGameTime();

  // Convert current time to 24h
  let h = hour % 12;
  if (meridiem === 'PM') h += 12;

  return gameEntry.obtain.some(o => {
    // Time check
    let timeOk = true;
    if (Array.isArray(o.time)) {
      if (o.time.includes('morning')) timeOk = h >= 6 && h < 10;
      else if (o.time.includes('day')) timeOk = h >= 10 && h < 18;
      else if (o.time.includes('night')) timeOk = h >= 18 || h < 6;
    }

    // Day check
    let dayOk = true;
    if (Array.isArray(o.days)) {
      dayOk = o.days.includes(day);
    }

    return timeOk && dayOk;
  });
}

function applyStarterExclusivity(sectionBlock, gameId) {
  const rows = sectionBlock.querySelectorAll('.pokemon-row');

  // Group rows by family
  const families = {};
  rows.forEach(row => {
    const family = row.dataset.family;
    if (!family) return;
    if (!families[family]) families[family] = [];
    families[family].push(row);
  });

  // Reset visibility and remove animations
  rows.forEach(row => {
    row.style.display = '';
    row.classList.remove('starter-collapsed');
  });

  // Determine if exactly one family has any caught Pokémon
  let caughtFamilies = [];

  Object.entries(families).forEach(([family, familyRows]) => {
    const isFamilyCaught = familyRows.some(row =>
      isCaught(gameId, Number(row.dataset.dex))
    );
    if (isFamilyCaught) {
      caughtFamilies.push(family);
    }
  });

  const onlyOneCaught = caughtFamilies.length === 1;

  // Collapse other families if exactly one is caught
  if (onlyOneCaught) {
    const chosenFamily = caughtFamilies[0];
    Object.entries(families).forEach(([family, familyRows]) => {
      if (family !== chosenFamily) {
        familyRows.forEach(row => {
          row.classList.add('starter-collapsed'); // Collapse with animation
        });
      }
    });
  }
}

function applyPokemonAvailabilityState(row, caught, availableNow, timeGated = false) {
  row.classList.remove('is-caught', 'is-available', 'is-unavailable', 'is-time-gated');

  if (caught) {
    row.classList.add('is-caught');
  } else if (availableNow) {
    row.classList.add('is-available');
    if (timeGated) row.classList.add('is-time-gated');
  } else {
    row.classList.add('is-unavailable');
  }
}

function applyMoonStoneLocks(gameId) {
  const rows = document.querySelectorAll('.pokemon-row');

  const groupsByDex = {};

  rows.forEach(row => {
    const sectionId =
      row.closest('.section-block')?.dataset.sectionId;

    if (!MOON_STONE_SECTIONS.has(sectionId)) return;

    const dex = Number(row.dataset.dex);
    if (!groupsByDex[dex]) groupsByDex[dex] = [];
    groupsByDex[dex].push(row);
  });

  Object.values(groupsByDex).forEach(group => {
    if (group.length < 2) return;

    // 🔑 Find resolver by DOM state, not global caught state
    const resolvedRow = group.find(row =>
      row.classList.contains('is-caught')
    );

    group.forEach(row => {
      row.classList.remove('is-counterpart-locked');

      if (!resolvedRow) return;

      // Lock ONLY the opposite row
      if (row !== resolvedRow) {
        row.classList.add('is-counterpart-locked');
      }
    });
  });
}

function applyMoonStoneSectionCapacity(sectionBlock) {
  const sectionId = sectionBlock.dataset.sectionId;
  if (sectionId !== 'MOON_STONE_1') return;

  const gameId = sectionBlock.dataset.gameId;
  const rows = Array.from(sectionBlock.querySelectorAll('.pokemon-row'));

  const caughtRows = rows.filter(row =>
    isCaught(gameId, Number(row.dataset.dex))
  );

  const capacityReached = caughtRows.length >= 2;

  rows.forEach(row => {
    row.classList.remove('is-capacity-locked');

    if (isCaught(gameId, Number(row.dataset.dex))) return;

    if (capacityReached) {
      row.classList.add('is-capacity-locked');
    }
  });
}

function applyMoonStoneLogic(game) {
  const config = game.moonStone;
  if (!config) return;

  const { pool, sections } = config;
  const gameId = game.id;

  // Collect all Moon Stone rows
  const rows = [...document.querySelectorAll('.pokemon-row')]
    .filter(r =>
      pool.includes(r.dataset.slug) &&
      sections[r.closest('.section-block')?.dataset.sectionId]
    );

  // Group rows by section
  const rowsBySection = {};
  rows.forEach(row => {
    const sectionId = row.closest('.section-block').dataset.sectionId;
    rowsBySection[sectionId] ??= [];
    rowsBySection[sectionId].push(row);
  });

  // Determine resolved Pokémon (caught anywhere)
  const resolvedDex = new Set(
    rows
      .filter(r => isCaught(gameId, Number(r.dataset.dex)))
      .map(r => Number(r.dataset.dex))
  );

  // Apply per-section logic
  Object.entries(rowsBySection).forEach(([sectionId, sectionRows]) => {
    const capacity = sections[sectionId].capacity;

    const caughtHere = sectionRows.filter(r =>
      isCaught(gameId, Number(r.dataset.dex))
    );

    sectionRows.forEach(row => {
      row.classList.remove('is-capacity-locked', 'is-counterpart-locked');

      const dex = Number(row.dataset.dex);

      // Already caught → never lock
      if (isCaught(gameId, dex)) return;

      // Pokémon resolved elsewhere
      if (resolvedDex.has(dex)) {
        row.classList.add('is-counterpart-locked');
        return;
      }

      // Section capacity reached
      if (caughtHere.length >= capacity) {
        row.classList.add('is-capacity-locked');
      }
    });
  });
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

    if (window.__CURRENT_GAME__) {
      applyMoonStoneLogic(window.__CURRENT_GAME__.data);
    }

    if (section.dataset.sectionId === 'MOON_STONE_1') {
      applyMoonStoneSectionCapacity(section);
    }
  });

  if (window.__CURRENT_GAME__) {
    applyMoonStoneLocks(window.__CURRENT_GAME__.data.id);
    document.querySelectorAll('.section-block').forEach(updateSectionCounter);
  }
});

/* =========================================================
   SECTION 2 RENDERER
   ========================================================= */

export function renderSections({ game, pokemon }) {
  window.__POKEMON_CACHE__ = pokemon;

  const gameKey = normalizeGameId(game.id);

  const container = document.getElementById('section-list');
  if (!container) return;
  container.innerHTML = '';

  if (!game || !game.sections) {
    container.innerHTML = `
      <div class="intro-panel intro-with-bg">
        <h2>Professor Oak Pokédex</h2>
  
        <p>
          A Pokédex-style tracker built for Professor Oak–style completion.
          Catch every available Pokémon before progressing.
        </p>
  
        <ul>
          <li>Select a game version above</li>
          <li>Pokémon are grouped by progression</li>
          <li>Mark Pokémon as caught as you go</li>
          <li>Time-based availability updates automatically in Gen 2</li>
        </ul>
  
        <p class="intro-hint">
          Your progress is saved automatically.
        </p>
      </div>
    `;
    return;
  }

  game.sections.forEach(section => {
    if (typeof section.requiredCount !== 'number') return;

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
    console.log('[Section TitleKey]', section.titleKey);
    title.textContent = t(`objective.${section.titleKey}`);

    header.append(counter, title);
    sectionBlock._counterEl = counter;

    const sectionRows = document.createElement('div');
    sectionRows.className = 'section-rows';

    const matches = pokemon.filter(p => {
      const gameKey = normalizeGameId(game.id);
      const entriesRaw = p.games?.[gameKey];
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

      // 1️⃣ CREATE ROW FIRST
      const row = document.createElement('div');
      row.className = 'pokemon-row';
      row.dataset.dex = String(p.dex);
    
      // 2️⃣ SECTION ID — USE sectionBlock, NOT row
      const sectionId = sectionBlock.dataset.sectionId;
    
      // 3️⃣ FIND GAME ENTRY
      const entries = getGameEntries(p, normalizeGameId(game.id));
      const entry =
        entries.find(e => e.sections?.includes(sectionId)) ??
        entries[0];

      const isAvailable = isAvailableToday(entry);
      if (isAvailable) {
        row.classList.add('is-available-today');
      }
    
      // 4️⃣ AVAILABILITY
      const availableNow = !caught && isPokemonAvailable(entry);

      if (!caught && availableNow && hasTimeOrDayRestriction(entry)) {
       row.classList.add('is-time-gated');
      }
    
      // 5️⃣ APPLY STATE CLASSES
      applyPokemonAvailabilityState(row, caught, availableNow, hasTimeOrDayRestriction(entry));

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

        if (
          row.classList.contains('is-capacity-locked') ||
          row.classList.contains('is-counterpart-locked')
        ) return;

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
        setCurrentDetailSelection({
          pokemon: p,
          game: game,
          sectionId: sectionId
        });
        renderPokemonDetail(p, game, sectionId);
        playPokemonCry(p);
        app?.classList.add('has-detail');
      });

      sectionRows.appendChild(row);
    });

    if (section.id === 'STARTER') {
      applyStarterExclusivity(sectionBlock, game.id);
    }

    sectionBlock.append(header, sectionRows);
    container.appendChild(sectionBlock);

    updateSectionCounter(sectionBlock);
  });
}

window.__isPokemonAvailable = isPokemonAvailable;

window.addEventListener('game-time-changed', () => {
  if (!window.__CURRENT_GAME__ || !window.__POKEMON_CACHE__) return;

  document.querySelectorAll('.pokemon-row').forEach(row => {
    const sectionBlock = row.closest('.section-block');
    if (!sectionBlock) return;

    const sectionId = sectionBlock.dataset.sectionId;
    const gameId = sectionBlock.dataset.gameId;

    const pokemon = window.__POKEMON_CACHE__
      .find(p => String(p.dex) === row.dataset.dex);
    if (!pokemon) return;

    const caught = isCaught(gameId, pokemon.dex);

    const entries = getGameEntries(pokemon, normalizeGameId(gameId));
    const entry =
      entries.find(e => e.sections?.includes(sectionId)) ??
      entries[0];

    const availableNow = !caught && isPokemonAvailable(entry);

    applyPokemonAvailabilityState(row, caught, availableNow, hasTimeOrDayRestriction(entry));
  });
});

