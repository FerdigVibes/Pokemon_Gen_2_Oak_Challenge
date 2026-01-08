import { renderPokedexSection } from './pokedex.js';

export function renderSections({ game, pokemon }) {
  const container = document.getElementById('section-list');
  container.innerHTML = '';

  const sections = game.sections;

  sections.forEach(section => {
    if (!section.children) return; // skip parents for now

    const header = document.createElement('h2');
    header.textContent = section.title;
    container.appendChild(header);

    renderPokedexSection(section, pokemon, container);
  });
}
