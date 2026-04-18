import { differenceInCalendarDays, startOfDay } from 'date-fns';

export function calculateDateKeyStreak(dateKeys: string[]) {
  const sorted = Array.from(new Set(dateKeys))
    .map((dateKey) => startOfDay(new Date(`${dateKey}T00:00:00`)))
    .sort((left, right) => right.getTime() - left.getTime());

  if (sorted.length === 0) {
    return 0;
  }

  let streak = 0;
  let cursor = startOfDay(new Date());

  for (const date of sorted) {
    const difference = differenceInCalendarDays(cursor, date);

    if (difference === 0) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
      continue;
    }

    if (difference === 1 && streak === 0) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 2);
      continue;
    }

    break;
  }

  return streak;
}

export function calculateDaysSinceLastRelapse(relapseDates: Date[], fallbackStart: Date) {
  if (relapseDates.length === 0) {
    return Math.max(1, differenceInCalendarDays(startOfDay(new Date()), startOfDay(fallbackStart)) + 1);
  }

  const latestRelapse = relapseDates.sort((left, right) => right.getTime() - left.getTime())[0];
  return Math.max(0, differenceInCalendarDays(startOfDay(new Date()), startOfDay(latestRelapse)));
}
