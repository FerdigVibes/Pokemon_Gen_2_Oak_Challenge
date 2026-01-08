// docs/js/ui/detail.js
// Responsible ONLY for rendering Section 3 content

export function renderPokemonDetail(pokemon) {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  panel.innerHTML = `
    <h2>${pokemon.names.en}</h2>

    <p>
      <strong>National Dex:</strong>
      #${String(pokemon.dex).padStart(3, '0')}
    </p>

    <p>
      <strong>Type:</strong>
      ${pokemon.types.join(', ')}
    </p>

    <p style="opacity: 0.6; margin-top: 12px;">
      More details coming soon…
    </p>
  `;
}
