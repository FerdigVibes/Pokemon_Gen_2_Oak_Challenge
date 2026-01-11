// state/gameTime.js
let gameTime = {
  period: "day",       // "morning" | "day" | "night"
  dayOfWeek: "monday", // monday → sunday
  dst: false           // optional, Gen II accuracy
};

export function getGameTime() {
  return gameTime;
}

export function setGameTime(update) {
  gameTime = { ...gameTime, ...update };
  window.dispatchEvent(new Event("game-time-changed"));
}
