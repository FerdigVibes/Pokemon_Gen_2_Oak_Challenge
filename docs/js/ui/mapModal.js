// docs/js/ui/mapModal.js

import { LOCATION_REGISTRY } from '../../data/maps/locations.js';

const MAP_IMAGES = {
  johto: './assets/maps/johto.jpeg',
  kanto: './assets/maps/kanto.png'
};

const grid = document.createElement('div');
grid.className = 'map-grid';
mapContainer.appendChild(grid);

export function openMap({ gameId, locations }) {
  const modal = document.getElementById('map-modal');
  const img = document.getElementById('map-image');
  const pinsContainer = document.getElementById('map-pins');

  if (!modal || !img || !pinsContainer) {
    console.error('[MapModal] Modal elements missing');
    return;
  }

  // Clear old pins
  pinsContainer.innerHTML = '';

  // Resolve locations → coordinates
  const resolved = locations
    .map(loc => LOCATION_REGISTRY[loc])
    .filter(Boolean);

  if (!resolved.length) {
    console.warn('[MapModal] No resolvable locations:', locations);
    return;
  }
  
  // Use the FIRST location to choose map
  const mapKey = resolved[0].map;
  const mapSrc = MAP_IMAGES[mapKey];

  if (!mapSrc) {
    console.error('[MapModal] Unknown map:', mapKey);
    return;
  }

  // Set map image
  img.src = mapSrc;

  // Create pins
  resolved.forEach(({ x, y }) => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;
    pinsContainer.appendChild(pin);
  });

  locations.forEach(locationName => {
    const key = `${region}:${locationName}`;
    const data = LOCATION_REGISTRY[key];
  
    if (!data) {
      console.warn('[Map] Unknown location:', key);
      return;
    }
  
    createPin(data);
  });

  // Show modal
  modal.classList.remove('hidden');

  mapImage.addEventListener('click', e => {
    const rect = mapImage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
  
    console.log(
      `x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`
    );
  });
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
