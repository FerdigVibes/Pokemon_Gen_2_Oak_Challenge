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
