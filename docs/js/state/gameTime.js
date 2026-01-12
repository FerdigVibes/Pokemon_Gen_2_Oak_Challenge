// docs/js/state/gameTime.js

let gameTime = {
  dayOfWeek: 'monday',
  period: 'day',
  dst: false
};

// Load persisted state
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    gameTime = { ...gameTime, ...JSON.parse(saved) };
  } catch {
    // ignore corrupted storage
  }
}

export function getGameTime() {
  return { ...gameTime };
}

