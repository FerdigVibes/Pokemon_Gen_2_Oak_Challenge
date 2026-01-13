// docs/js/ui/gameTimeModal.js
import { getGameTime, setGameTime } from '../state/gameTime.js';
import { t } from '../data/i18n.js';

const modal = document.getElementById('game-time-modal');

const daySelect = document.getElementById('gt-day');
const hourSelect = document.getElementById('gt-hour');
const minuteSelect = document.getElementById('gt-minute');
const meridiemSelect = document.getElementById('gt-meridiem');
const dstCheckbox = document.getElementById('gt-dst');

const saveBtn = document.getElementById('gt-save');
const cancelBtn = document.getElementById('gt-cancel');

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];

const backdrop = modal.querySelector('.modal-backdrop');

backdrop.addEventListener('click', () => {
  modal.classList.add('hidden');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modal.classList.add('hidden');
  }
});

function buildSelectors() {
  daySelect.innerHTML = '';
  DAYS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = t(`days.${d}`);
    daySelect.appendChild(opt);
  });

  hourSelect.innerHTML = '';
  for (let h = 1; h <= 12; h++) {
    hourSelect.appendChild(new Option(h, h));
  }

  minuteSelect.innerHTML = '';
  for (let m = 0; m < 60; m++) {
    minuteSelect.appendChild(
      new Option(String(m).padStart(2, '0'), m)
    );
  }
}

export function openGameTimeModal() {
  buildSelectors();

  const state = getGameTime();

  daySelect.value = state.day;
  hourSelect.value = state.hour;
  minuteSelect.value = state.minute;
  meridiemSelect.value = state.meridiem;
  dstCheckbox.checked = !!state.dst;

  modal.classList.remove('hidden');

  saveBtn.onclick = () => {
    setGameTime({
      day: daySelect.value,
      hour: Number(hourSelect.value),
      minute: Number(minuteSelect.value),
      meridiem: meridiemSelect.value,
      dst: dstCheckbox.checked
    });

    modal.classList.add('hidden');
  };

  cancelBtn.onclick = () => {
    modal.classList.add('hidden');
  };
}
