const STORAGE_KEY = 'oak:mute';

let muted = localStorage.getItem(STORAGE_KEY) === 'true';

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY, muted);
  return muted;
}

export function setMuted(value) {
  muted = !!value;
  localStorage.setItem(STORAGE_KEY, muted);
}
