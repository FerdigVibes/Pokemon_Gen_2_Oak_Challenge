import { getGameTime, setGameTime } from '../state/gameTime.js';

export function openGameTimeModal() {
  const { dayOfWeek, period, dst } = getGameTime();

  // Replace this with your real modal markup
  const day = prompt(
    'Day of week (monday–sunday):',
    dayOfWeek
  );

  const time = prompt(
    'Time of day (morning / day / night):',
    period
  );

  const dstAnswer = prompt(
    'DST? (yes / no):',
    dst ? 'yes' : 'no'
  );

  if (!day || !time) return;

  setGameTime({
    dayOfWeek: day.toLowerCase(),
    period: time.toLowerCase(),
    dst: dstAnswer?.toLowerCase() === 'yes'
  });
}
