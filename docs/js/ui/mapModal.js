// docs/js/ui/mapModal.js

import { LOCATION_REGISTRY } from '../../data/maps/locations.js';

const modal = document.getElementById('map-modal');
const mapImage = document.getElementById('map-image');
const mapPins = document.getElementById('map-pins');
const mapContainer = document.querySelector('#map-modal .map-container');

const MAP_IMAGES = {
  johto: './assets/maps/johto.jpeg',
  kanto: './assets/maps/kanto.png'
};

export function openMap({ gameId, locations }) {
  const modal = document.getElementById('map-modal');
  const img = document.getElementById('map-image');
  const pinsContainer = document.getElementById('map-pins');

  if (!modal || !img || !pinsContainer) {
    console.error('[MapModal] Modal elements missing');
    return;
  }

  pinsContainer.innerHTML = '';

  const resolved = locations
    .map(loc => LOCATION_REGISTRY[loc])
    .filter(Boolean);

  if (!resolved.length) {
    console.warn('[MapModal] No resolvable locations:', locations);
    return;
  }

  const mapKey = resolved[0].map;
  const mapSrc = MAP_IMAGES[mapKey];

  if (!mapSrc) {
    console.error('[MapModal] Unknown map:', mapKey);
    return;
  }

  img.src = mapSrc;

  resolved.forEach(({ x, y }) => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;
    pinsContainer.appendChild(pin);
  });

  modal.classList.remove('hidden');

  img.onclick = e => {
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    console.log(`x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`);
  };
}

function resolveLocationKey(locationName, gameId) {
  const region =
    gameId.startsWith('crystal') || gameId.startsWith('gold') || gameId.startsWith('silver')
      ? 'johto'
      : 'kanto';

  const key = `${region}:${locationName}`;

  return LOCATION_REGISTRY[key] ? key : null;
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
