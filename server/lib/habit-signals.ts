import { HabitCategory } from '@prisma/client';

const hydrationKeywords = ['water', 'hydrate', 'hydration'];
const workoutKeywords = [
  'workout',
  'exercise',
  'gym',
  'lift',
  'lifting',
  'run',
  'running',
  'cardio',
  'swim',
  'swimming',
  'cycle',
  'cycling',
  'yoga',
  'pilates',
  'hiit',
  'sport',
  'training',
];

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export function isHydrationHabitName(name: string) {
  const normalized = normalizeName(name);
  return hydrationKeywords.some((keyword) => normalized.includes(keyword));
}

export function inferCountsAsWorkout(name: string, category: HabitCategory) {
  const normalized = normalizeName(name);

  if (isHydrationHabitName(name)) {
    return false;
  }

  if (workoutKeywords.some((keyword) => normalized.includes(keyword))) {
    return true;
  }

  return category === HabitCategory.PHYSICAL;
}
