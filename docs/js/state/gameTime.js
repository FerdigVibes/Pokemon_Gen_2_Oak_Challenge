// docs/js/state/gameTime.js

const STORAGE_KEY = 'oakChallenge.gameTime';

let gameTime = {
  day: 'mon',       // mon–sun
  hour: 10,         // 1–12
  minute: 0,        // 0–59
  meridiem: 'AM',   // AM | PM
  dst: false
};

// Load persisted time
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    gameTime = { ...gameTime, ...JSON.parse(saved) };
  } catch {}
}

export function getGameTime() {
  return { ...gameTime };
}

export function setGameTime(next) {
  gameTime = { ...gameTime, ...next };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(gameTime)
  );

  window.dispatchEvent(
    new CustomEvent('game-time-changed', {
      detail: getGameTime()
    })
  );
}



