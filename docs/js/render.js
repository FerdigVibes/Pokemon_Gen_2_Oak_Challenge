import { state } from "./state.js";

export function renderApp() {
  renderTopBar();
  renderPokedexList();
}

function renderTopBar() {
  const title = document.getElementById("title");
  title.textContent = `Pokédex – ${state.game.toUpperCase()}`;

  if (game.generation === 2) {
    showTimeLegend();
  } else {
    hideTimeLegend();
  }
}

function renderPokedexList() {
  const list = document.getElementById("pokedex-list");
  list.innerHTML = "<p>Pokédex list coming next.</p>";
}
