/* =========================
   Game-specific rendering
   ========================= */

function renderGameInfo(gameData) {
  const obtainHtml = (gameData.obtain || [])
    .map(o => renderObtainEntry(o))
    .join('');

  return `
    <h3>How to Obtain</h3>
    <ul>
      ${obtainHtml || '<li>—</li>'}
    </ul>
  `;
}

function renderObtainEntry(o) {
  const locations = Array.isArray(o.locations)
    ? o.locations.join(', ')
    : o.location ?? null;

  const time = Array.isArray(o.time)
    ? o.time.join(', ')
    : null;

  return `
    <li style="margin-bottom: 8px;">
      ${locations ? `<strong>Locations:</strong> ${locations}<br/>` : ''}
      ${time ? `<strong>Time:</strong> ${time}<br/>` : ''}
      ${o.notes ? `<em>${o.notes}</em>` : ''}
    </li>
  `;
}





