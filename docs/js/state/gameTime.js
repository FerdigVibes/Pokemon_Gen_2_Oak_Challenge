// docs/js/state/gameTime.js

const STORAGE_KEY = 'oakChallenge.gameTime';

let gameTime = {
  dayOfWeek: 'monday',
  period: 'day',
  dst: false
};

// STEP 2 — load persisted time
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    gameTime = { ...gameTime, ...JSON.parse(saved) };
  } catch {}
}

export function getGameTime() {
  return { ...gameTime };
}

// STEP 3 — THIS is where it goes
export function setGameTime(next) {
  gameTime = {
    ...gameTime,
    ...next
  };

  // persist
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(gameTime)
  );

  // notify UI
  window.dispatchEvent(
    new CustomEvent('game-time-changed', {
      detail: getGameTime()
    })
  );
}


