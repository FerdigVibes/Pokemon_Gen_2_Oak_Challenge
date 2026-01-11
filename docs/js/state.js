// state/time.js
let currentTime = "day"; // "morning" | "day" | "night"

export function getCurrentTime() {
  return currentTime;
}

export function setCurrentTime(time) {
  currentTime = time;
  window.dispatchEvent(new Event("time-changed"));
}
