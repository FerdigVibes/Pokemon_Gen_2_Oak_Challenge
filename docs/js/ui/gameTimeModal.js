// docs/js/ui/gameTimeModal.js
import { getGameTime, setGameTime } from '../state/gameTime.js';
import { t } from '../data/i18n.js';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function buildSelectors(daySelect, hourSelect, minuteSelect) {
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
    minuteSelect.appendChild(new Option(String(m).padStart(2, '0'), m));
  }
}

export function openGameTimeModal() {
  const modal = document.getElementById('game-time-modal');
  const daySelect = document.getElementById('gt-day');
  const hourSelect = document.getElementById('gt-hour');
  const minuteSelect = document.getElementById('gt-minute');
  const meridiemSelect = document.getElementById('gt-meridiem');
  const dstCheckbox = document.getElementById('gt-dst');
  const saveBtn = document.getElementById('gt-save');
  const cancelBtn = document.getElementById('gt-cancel');

  if (!modal || !daySelect || !hourSelect || !minuteSelect || !meridiemSelect || !dstCheckbox || !saveBtn || !cancelBtn) {
    console.warn('Modal elements missing');
    return;
  }

  buildSelectors(daySelect, hourSelect, minuteSelect);

  const state = getGameTime();

  daySelect.value = state.day;
  hourSelect.value = state.hour;
  minuteSelect.value = state.minute;
  meridiemSelect.value = state.meridiem;
  dstCheckbox.checked = !!state.dst;

  modal.classList.remove('hidden');
  document.getElementById('modal-overlay')?.classList.remove('hidden');

  saveBtn.onclick = () => {
    setGameTime({
      day: daySelect.value,
      hour: Number(hourSelect.value),
      minute: Number(minuteSelect.value),
      meridiem: meridiemSelect.value,
      dst: dstCheckbox.checked
    });

    closeModal();
  };

  cancelBtn.onclick = closeModal;

  // Escape key to close
  const keyHandler = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  // Backdrop click to close
  const backdrop = modal.querySelector('.modal-backdrop');
  if (backdrop) backdrop.onclick = closeModal;

  document.addEventListener('keydown', keyHandler, { once: true });

  function closeModal() {
    modal.classList.add('hidden');
    document.getElementById('modal-overlay')?.classList.add('hidden');
  }
}

