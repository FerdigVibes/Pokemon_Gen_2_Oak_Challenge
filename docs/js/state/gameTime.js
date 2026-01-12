// docs/js/state/gameTime.js

let gameTime = {
  dayOfWeek: 'monday',   // monday → sunday
  period: 'day',         // morning | day | night
  dst: false             // boolean
};

export function getGameTime() {
  return { ...gameTime };
}

export function setGameTime(next) {
  gameTime = {
    ...gameTime,
    ...next
  };

  window.dispatchEvent(
    new CustomEvent('game-time-changed', {
      detail: getGameTime()
    })
  );
}

