// docs/js/app.js

import { loadGame } from './data/loader.js';
import { GAME_REGISTRY } from './data/registry.js';
import { renderSections } from './ui/sections.js';
import { getGlobalProgress } from './state/progress.js';
import { isCaught } from './state/caught.js';
import { isMuted, toggleMute } from './state/audio.js';
import { setLanguage, getLanguage } from './state/language.js';
import { loadLanguage, t } from './data/i18n.js';
import { closePokemonDetail, renderPokemonDetail, getCurrentDetailSelection } from './ui/detail.js';
import { getGameTime } from "./state/gameTime.js";
import { setGameTime } from './state/gameTime.js';
import { openGameTimeModal } from './ui/gameTimeModal.js';


window.__setGameTime = setGameTime;
const STORAGE_KEY = 'oakChallenge.gameTime';
const TIME_SLOTS = ["morning", "day", "night"];
const btn = document.getElementById('game-time-btn');

const TIME_ICONS = {
  morning: "🌅",
  day: "☀️",
  night: "🌙"
};

window.__CURRENT_GAME__ = null;
window.__POKEMON_CACHE__ = null;

window.addEventListener("game-time-changed", () => {
  if (!window.__CURRENT_GAME__ || !window.__POKEMON_CACHE__) return;

  renderSections({
    game: window.__CURRENT_GAME__.data,
    pokemon: window.__POKEMON_CACHE__
  });

  const selection = getCurrentDetailSelection();
  if (selection) {
    renderPokemonDetail(selection.pokemon, window.__CURRENT_GAME__.data);
  }

  updateTopBarTimeIcons();
  renderTopBarDays();
});

function formatGameTime() {
  const { day, hour, minute, meridiem } = getGameTime();
  return `${t(`days.${day}`)} ${hour}:${String(minute).padStart(2,'0')} ${meridiem}`;
}

/* =========================================================
   INIT
   ========================================================= */

async function init() {
  try {
    wireSearch();
    wireMuteToggle();
    wireLanguageSelector();

    await loadLanguage(getLanguage());

    resetAppToBlankState();   // ← must be first

    buildGameSelector();
    applyTranslations();

    updateTopBarTimeIcons();
    renderTopBarDays();

  } catch (err) {
    console.error('Init failed:', err);
  }
}

function wireSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    applySearchFilter(input.value);
  });
}

function wireLanguageSelector() {
  const select = document.getElementById('language-selector');
  if (!select) return;

  select.value = getLanguage();

  select.addEventListener('change', async () => {
    const lang = select.value;

    setLanguage(lang);
    await loadLanguage(lang);

    applyTranslations();
    rebuildGameSelector();

    // Notify UI modules (detail panel, etc.)
    window.dispatchEvent(
      new CustomEvent('language-changed', {
        detail: { lang }
      })
    );
  });
}

export function wireGameTimeButton(game) {
  if (!game || game.generation !== 2) {
    btn.classList.add('hidden');
    return;
  }

  btn.classList.remove('hidden');
  const label = btn.querySelector('.game-time-label');
  label.textContent = formatGameTime();

  btn.onclick = openGameTimeModal;

  window.addEventListener('game-time-changed', () => {
    btn.textContent = `⏰ ${formatGameTime()}`;
  });
}

function getPeriod({ hour, meridiem }) {
  let h = hour % 12;
  if (meridiem === 'PM') h += 12;

  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 18) return 'day';
  return 'night';
}

function resetAppToBlankState() {
  window.__CURRENT_GAME__ = null;
  window.__POKEMON_CACHE__ = null;

  document.getElementById('app-title').textContent =
    t('appTitleNoVersion');

  document.getElementById('game-selector-btn').textContent =
    `${t('pickVersion')} ▾`;

  document.getElementById('section-list').innerHTML = '';
  document.getElementById('app')?.classList.remove('has-detail');

  document
    .getElementById("game-time-btn")
    ?.classList.add("hidden");
  
  document
    .querySelector(".time-icons")
    ?.classList.add("hidden");
  
  document
    .querySelector(".time-legend")
    ?.classList.add("hidden");
  
  document
    .getElementById("day-icons")
    ?.classList.add("hidden");

  const progressText = document.getElementById('progress-text');
  const progressFill = document.querySelector('.progress-fill');
  if (progressText) {
    progressText.textContent = t('globalCaughtCount', {
      caught: 0,
      total: 0
    });
  }
  if (progressFill) progressFill.style.width = '0%';

  const obj = document.getElementById('current-objective');
  if (obj) obj.textContent = t('pickVersionPrompt');
}

function applyTranslations() {
  const selectorBtn = document.getElementById('game-selector-btn');
  const titleEl = document.getElementById('app-title');

  if (window.__CURRENT_GAME__) {
    const { meta, data } = window.__CURRENT_GAME__;

    selectorBtn.textContent = `${t(meta.labelKey)} ▾`;
    titleEl.textContent = t('appTitle', {
      version: t(meta.labelKey)
    });

    renderSections({
      game: data,
      pokemon: data.pokemon
    });

    updateGlobalProgress(data, data.pokemon);
    updateCurrentObjective(data, data.pokemon);
  } else {
    selectorBtn.textContent = `${t('pickVersion')} ▾`;
    titleEl.textContent = t('appTitleNoVersion');
  }

  const search = document.getElementById('search-input');
  if (search) search.placeholder = t('searchPlaceholder');

  const objLabel = document.querySelector('.objective strong');
  if (objLabel) objLabel.textContent = t('currentObjective') + ':';
}

function isAvailableNow(pokemonAvailability, gameTime) {
  const timeOk =
    !pokemonAvailability.time ||
    pokemonAvailability.time.includes(gameTime.period);

  const dayOk =
    !pokemonAvailability.days ||
    pokemonAvailability.days.includes(gameTime.dayOfWeek);

  return timeOk && dayOk;
}


/* =========================================================
   GAME SELECTOR
   ========================================================= */

function buildGameSelector() {
  const btn = document.getElementById('game-selector-btn');
  const container = document.createElement('div');
  container.className = 'game-menu';

  GAME_REGISTRY.forEach(gen => {
    const genItem = document.createElement('div');
    genItem.className = 'game-menu-gen';
    genItem.textContent = t(gen.genKey);

    const submenu = document.createElement('div');
    submenu.className = 'game-menu-sub';

    gen.games.forEach(game => {
      const item = document.createElement('div');
      item.className = 'game-menu-item';
      item.textContent = t(game.labelKey);

      item.addEventListener('click', async () => {
        await selectGame({
          ...game,
          label: t(game.labelKey)
        });
        container.classList.remove('open');
      });

      submenu.appendChild(item);
    });

    genItem.appendChild(submenu);
    container.appendChild(genItem);
  });

  btn.parentElement.appendChild(container);

  btn.addEventListener('mouseenter', () => {
    container.classList.add('open');
  });

  btn.parentElement.addEventListener('mouseleave', () => {
    container.classList.remove('open');
  });
}

function wireMuteToggle() {
  const btn = document.getElementById('mute-toggle');
  if (!btn) return;

  const updateIcon = () => {
    btn.textContent = isMuted() ? '🔇' : '🔊';
  };

  updateIcon();

  btn.addEventListener('click', () => {
    toggleMute();
    updateIcon();
  });
}

function renderTopBarDays() {
  const container = document.getElementById("day-icons");
  if (!container) return;

  const { dayOfWeek } = getGameTime();
  container.innerHTML = "";

  Object.entries(DAY_LABELS).forEach(([day, label]) => {
    const span = document.createElement("span");
    span.className = "day-icon";
    span.textContent = label;

    span.classList.toggle("active", day === dayOfWeek);
    span.classList.toggle("inactive", day !== dayOfWeek);

    container.appendChild(span);
  });
}

/* =========================================================
   GAME SWITCH CORE
   ========================================================= */

async function selectGame(gameMeta) {
  const gameData = await loadGame(gameMeta.id);
  const isGen2 = [ "gold", "silver", "crystal_gbc", "crystal_vc" ].includes(gameMeta.id);

  document
    .getElementById("game-time-btn")
    ?.classList.toggle("hidden", !isGen2);

  window.__CURRENT_GAME__ = {
    id:gameMeta.id,
    meta: gameMeta,
    data: gameData
  };

  wireGameTimeButton(gameMeta);

  const timeIcons = document.querySelector(".time-icons");
  const timeLegend = document.querySelector(".time-legend");
  const timeBtn = document.getElementById("game-time-btn");
  
  [timeIcons, timeLegend, timeBtn].forEach(el => {
    if (!el) return;
    el.classList.toggle("hidden", !isGen2);
  });
  
  if (isGen2) {
    updateTopBarTimeIcons();
  }

  document.getElementById('game-selector-btn').textContent =
    `${t(gameMeta.labelKey)} ▾`;

  document.getElementById('app-title').textContent = t('appTitle', {
    version: t(gameMeta.labelKey)
  });

  // Render Section 2 first (this updates __POKEMON_CACHE__)
  renderSections({
    game: gameData,
    pokemon: gameData.pokemon
  });

  // Reconcile Section 3 using DATA state (not DOM)
  const selection = getCurrentDetailSelection();

  if (selection) {
    const { pokemon } = selection;

    // Pokémon does not exist in this version → close Section 3
    if (!pokemon.games?.[gameMeta.id]) {
      closePokemonDetail();
    } else {
      // Pokémon exists → re-render with new game data
      renderPokemonDetail(pokemon, gameData);
    }
  }

  updateGlobalProgress(gameData, gameData.pokemon);
  updateCurrentObjective(gameData, gameData.pokemon);
}





/* =========================================================
   GLOBAL PROGRESS
   ========================================================= */

function updateGlobalProgress(game, pokemon) {
  const { caught, total, percent } =
    getGlobalProgress(game, pokemon);

  const text = document.getElementById('progress-text');
  const fill = document.querySelector('.progress-fill');

  if (text) {
    text.textContent = t('globalCaughtCount', {
      caught,
      total
    });
  }

  if (caught > total) {
    console.warn(
      `Caught count (${caught}) exceeds game total (${total}). Check duplicates.`
    );
  }

  if (fill) {
    fill.style.width = `${percent}%`;
  }
}

/* =========================================================
   CURRENT OBJECTIVE
   ========================================================= */

function getCurrentObjective(game, pokemon) {
  // 1. Get parent sections (those with children), ordered
  const parentSections = game.sections
    .filter(s => Array.isArray(s.children))
    .sort((a, b) => a.order - b.order);

  // 2. Walk each parent milestone
  for (const parent of parentSections) {
    let allChildrenComplete = true;

    for (const childId of parent.children) {
      const child = game.sections.find(s => s.id === childId);
      if (!child || !child.requiredCount) continue;

      const matches = pokemon.filter(p =>
        p.games?.[game.id]?.sections?.includes(child.id)
      );

      const caughtCount = matches.filter(p =>
        isCaught(game.id, p.dex)
      ).length;

      if (caughtCount < child.requiredCount) {
        allChildrenComplete = false;
        break;
      }
    }

    // 3. First incomplete milestone = current objective
    if (!allChildrenComplete) {
      return t(parent.titleKey);
    }
  }

  // 4. Everything complete
  return t('challengeComplete');
}

function updateTopBarTimeIcons() {
  const period = getPeriod(getGameTime());

  document.querySelectorAll(".time-icon").forEach(icon => {
    const iconPeriod = icon.dataset.period;
    icon.classList.toggle("active", iconPeriod === period);
    icon.classList.toggle("inactive", iconPeriod !== period);
  });
}


function rebuildGameSelector() {
  const btn = document.getElementById('game-selector-btn');
  const existing = btn.parentElement.querySelector('.game-menu');
  if (existing) existing.remove();

  buildGameSelector();
}

function updateCurrentObjective(game, pokemon) {
  const label = document.getElementById('current-objective');
  if (!label) return;

  label.textContent = getCurrentObjective(game, pokemon);
}

function applySearchFilter(query) {
  const q = query.trim().toLowerCase();

  document.querySelectorAll('.section-block').forEach(section => {
    let anyVisible = false;

    section.querySelectorAll('.pokemon-row').forEach(row => {
      const name = row.dataset.name;
      const dex = row.dataset.dex;

      const match =
        !q ||
        name.includes(q) ||
        dex.startsWith(q.replace('#', ''));

      row.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    // Hide entire section if nothing matches
    const rowsContainer = section.querySelector('.section-rows');
    if (rowsContainer) {
      rowsContainer.style.display = anyVisible ? '' : 'none';
    }
  });
}

window.addEventListener('caught-changed', () => {
  if (!window.__CURRENT_GAME__ || !window.__POKEMON_CACHE__) return;
  updateGlobalProgress(
   window.__CURRENT_GAME__.data,
   window.__POKEMON_CACHE__
  );

  updateCurrentObjective(
   window.__CURRENT_GAME__.data,
   window.__POKEMON_CACHE__
  );
});

init();

