import { LOCATION_REGISTRY } from '../../data/maps/locations.js';

const modal = document.getElementById('map-modal');
const mapImage = document.getElementById('map-image');
const pinsContainer = document.getElementById('map-pins');

document.querySelector('.map-close').onclick = closeMap;
document.querySelector('.map-backdrop').onclick = closeMap;

export function openMap(locations = []) {
  pinsContainer.innerHTML = '';

  // Resolve valid locations
  const resolved = locations
    .map(l => LOCATION_REGISTRY[l])
    .filter(Boolean);

  if (!resolved.length) return;

  // Determine which map to show
  const mapType = resolved[0].map;

  mapImage.src =
    mapType === 'johto'
      ? './assets/maps/johto.png'
      : './assets/maps/kanto.png';

  resolved.forEach(loc => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.left = `${loc.x}%`;
    pin.style.top = `${loc.y}%`;
    pinsContainer.appendChild(pin);
  });

  modal.classList.remove('hidden');
}

function closeMap() {
  modal.classList.add('hidden');
}
