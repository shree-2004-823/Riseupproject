import { addDays, format, parseISO, startOfDay, subDays } from 'date-fns';

export function getDateKey(date = new Date()) {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

export function getDateFromKey(dateKey: string) {
  return parseISO(`${dateKey}T00:00:00`);
}

export function getDateRange(days: number, from = new Date()) {
  const end = startOfDay(from);
  const start = subDays(end, days - 1);

  return { start, end: addDays(end, 1) };
}

export function getWeekDateKeys(from = new Date()) {
  const today = startOfDay(from);

  return Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index);
    return {
      dateKey: getDateKey(date),
      label: format(date, 'EEE'),
      date,
    };
  });
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
