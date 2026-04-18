import type { UserProfile } from '@prisma/client';

export function parseStoredGoals(goals: string | null | undefined) {
  if (!goals) {
    return [];
  }

  try {
    const parsed = JSON.parse(goals);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyGoals(goals: string[]) {
  return JSON.stringify(goals);
}

export function serializeRoutine(profile: Pick<UserProfile, 'wakeTime' | 'sleepTime' | 'workoutTime' | 'reminderTime'> | null) {
  return {
    wakeTime: profile?.wakeTime ?? '07:00',
    sleepTime: profile?.sleepTime ?? '22:00',
    workoutTime: profile?.workoutTime ?? '08:00',
    reminderTime: profile?.reminderTime ?? '20:00',
  };
}
