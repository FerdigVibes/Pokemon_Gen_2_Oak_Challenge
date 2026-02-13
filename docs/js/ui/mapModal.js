// docs/js/ui/mapModal.js

import { LOCATION_REGISTRY } from '../../data/maps/locations.js';

const MAP_IMAGES = {
  johto: './assets/maps/johto.png',
  kanto: './assets/maps/kanto.png'
};

export function openMap({ gameId, locations }) {
  const modal = document.getElementById('map-modal');
  const img = document.getElementById('map-image');
  const pinsContainer = document.getElementById('map-pins');
  const container = document.querySelector('.map-container');

  pinsContainer.innerHTML = '';

  const mapKey = getMapForGame(gameId);
  const mapSrc = MAP_IMAGES[mapKey];

  if (!mapSrc) {
    console.error('[MapModal] Unknown map for game:', gameId);
    return;
  }

  img.onload = () => {
    container.style.aspectRatio =
      mapKey === 'johto'
        ? '4248 / 1859'
        : '2458 / 2329';
  };
  
  img.src = mapSrc;

  locations.forEach(locationName => {
    const key = `${mapKey}:${locationName}`;
    const data = LOCATION_REGISTRY[key];

    if (!data) {
      console.warn('[MapModal] Unknown location:', key);
      return;
    }

    const pin = document.createElement('div');
    pin.className = 'map-pin glow';
    pin.style.left = `${data.x}%`;
    pin.style.top = `${data.y}%`;
    pinsContainer.appendChild(pin);
  });

  modal.classList.remove('hidden');
}

function getMapForGame(gameId) {
  const id = gameId.toLowerCase();

  if (id.startsWith('gold') || id.startsWith('silver') || id.startsWith('crystal')) {
    return 'johto';
  }
  return 'kanto';
}


/* ================= CLOSE HANDLING ================= */

function closeMap() {
  document.getElementById('map-modal')?.classList.add('hidden');
}

document.addEventListener('click', e => {
  if (
    e.target.classList.contains('map-backdrop') ||
    e.target.classList.contains('map-close')
  ) {
    closeMap();
  }
});
