// docs/js/ui/sections.js

import { renderPokemonDetail } from './detail.js';
import { playPokemonCry } from './cry.js';
import { isCaught, toggleCaught } from '../state/caught.js';

// Tracks sections the user manually expanded
const userExpandedSections = new Set();

/* =========================================================
   STEP 2 — React to caught changes (section collapse)
   ========================================================= */

window.addEventListener('caught-changed', () => {
  document.querySelectorAll('.section-block').forEach(block => {
    const sectionId = block.dataset.sectionId;
    const rows = block.querySelectorAll('.pokemon-row');
    const header = block.querySelector('h2');
    const rowsContainer = block.querySelector('.section-rows');

    const required = Number(block.dataset.requiredCount);
    if (!required) return;

    const caughtCount = Array.from(rows).filter(row => {
      return isCaught(block.dataset.gameId, Number(row.dataset.dex));
    }).length;

    if (caughtCount >= required && !userExpandedSections.has(sectionId)) {
      rowsContainer.style.display = 'none';
      header.classList.add('collapsed');
    }
  });
});

/* =========================================================
   SECTION 2 RENDERER
   ========================================================= */

export function renderSections({ game, pokemon }) {
  const container = document.getElementById('section-list');
  container.innerHTML = '';

  game.sections.forEach(section => {
    if (!section.requiredCount) return;

    // Section wrapper
    const sectionBlock = document.createElement('div');
    sectionBlock.className = 'section-block';
    sectionBlock.dataset.sectionId = section.id;
    sectionBlock.dataset.requiredCount = section.requiredCount;
    sectionBlock.dataset.gameId = game.id;

    // Header
    const header = document.createElement('h2');
    header.textContent = section.title;

    // Rows container
    const sectionRows = document.createElement('div');
    sectionRows.className = 'section-rows';

    // Header toggle
    header.addEventListener('click', () => {
      const collapsed = sectionRows.style.display === 'none';

      if (collapsed) {
        sectionRows.style.display = '';
        header.classList.remove('collapsed');
        userExpandedSections.add(section.id);
      } else {
        sectionRows.style.display = 'none';
        header.classList.add('collapsed');
        userExpandedSections.delete(section.id);
      }
    });

    // Find Pokémon in this section
    const matches = pokemon.filter(p => {
      const gameData = p.games?.[game.id];
      if (!gameData) return false;

      const sections = gameData.sections ?? [];
      return Array.isArray(sections)
        ? sections.includes(section.id)
        : sections === section.id;
    });

    matches.forEach(p => {
      const dex = String(p.dex).padStart(3, '0');
      const caught = isCaught(game.id, p.dex);

      const row = document.createElement('div');
      row.className = 'pokemon-row';
      row.dataset.dex = dex;

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

        window.dispatchEvent(new CustomEvent('caught-changed', {
          detail: {
            gameId: game.id,
            dex: p.dex,
            caught: newState
          }
        }));
      });

      const dexSpan = document.createElement('span');
      dexSpan.textContent = `#${dex}`;

      const icon = document.createElement('img');
      icon.src = `./assets/icons/pokemon/${dex}-${p.slug}-icon.png`;

      const name = document.createElement('span');
      name.textContent = p.names.en;

      row.append(ball, dexSpan, icon, name);

      row.addEventListener('click', () => {
        renderPokemonDetail(p, game);
        playPokemonCry(p);
      });

      if (caught) row.classList.add('is-caught');

      sectionRows.appendChild(row);
    });

    sectionBlock.append(header, sectionRows);
    container.appendChild(sectionBlock);
  });
}

