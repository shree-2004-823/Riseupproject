import { CravingOutcome, type Prisma } from '@prisma/client';
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

type QuitProfileLike = {
  quitStartedAt: Date | null;
  currentStreakStartedAt: Date | null;
  lastRelapseAt: Date | null;
  longestStreakDays: number;
};

function getEffectiveQuitStart(profile: QuitProfileLike, fallback?: Date | null) {
  return profile.currentStreakStartedAt ?? profile.quitStartedAt ?? fallback ?? null;
}

function getCurrentStreakDaysForDate(profile: QuitProfileLike, now: Date) {
  const start = getEffectiveQuitStart(profile);

  if (!start) {
    return 0;
  }

  const startDay = startOfDay(start);
  const today = startOfDay(now);

  if (startDay.getTime() > today.getTime()) {
    return 0;
  }

  return Math.max(0, differenceInCalendarDays(today, startDay) + 1);
}

function getCompletedStreakDays(profile: QuitProfileLike, relapseAt: Date) {
  const start = getEffectiveQuitStart(profile, relapseAt);
  const relapseDay = startOfDay(relapseAt);
  const startDay = startOfDay(start ?? relapseAt);

  return Math.max(0, differenceInCalendarDays(relapseDay, startDay));
}

export function getCurrentQuitStreakDays(profile: QuitProfileLike | null | undefined, now = new Date()) {
  if (!profile) {
    return 0;
  }

  return getCurrentStreakDaysForDate(profile, now);
}

export function getLongestQuitStreakDays(profile: QuitProfileLike | null | undefined) {
  if (!profile) {
    return 0;
  }

  return Math.max(profile.longestStreakDays, getCurrentQuitStreakDays(profile));
}

export async function syncQuitSupportFromCraving(
  transaction: Prisma.TransactionClient,
  params: {
    userId: string;
    cravingLogId: string;
    habitType: string;
    outcome: CravingOutcome;
    occurredAt: Date;
    trigger?: string | null;
    intensity?: number | null;
    notes?: string | null;
  },
) {
  const occurredAt = params.occurredAt;
  const streakStartDay = startOfDay(occurredAt);

  let profile = await transaction.quitProfile.upsert({
    where: { userId: params.userId },
    update: {
      primaryHabitType: params.habitType,
    },
    create: {
      userId: params.userId,
      primaryHabitType: params.habitType,
      quitStartedAt: streakStartDay,
      currentStreakStartedAt: streakStartDay,
    },
  });

  const baseUpdate: Prisma.QuitProfileUpdateInput = {
    primaryHabitType: params.habitType,
  };

  if (!profile.quitStartedAt) {
    baseUpdate.quitStartedAt = streakStartDay;
  }

  if (!profile.currentStreakStartedAt && params.outcome !== CravingOutcome.RELAPSED) {
    baseUpdate.currentStreakStartedAt = streakStartDay;
  }

  if (params.outcome === CravingOutcome.RELAPSED) {
    const completedStreakDays = getCompletedStreakDays(profile, occurredAt);

    await transaction.relapseEvent.upsert({
      where: { cravingLogId: params.cravingLogId },
      update: {
        habitType: params.habitType,
        trigger: params.trigger ?? null,
        intensity: params.intensity ?? null,
        notes: params.notes ?? null,
        occurredAt,
      },
      create: {
        userId: params.userId,
        quitProfileId: profile.id,
        cravingLogId: params.cravingLogId,
        habitType: params.habitType,
        trigger: params.trigger ?? null,
        intensity: params.intensity ?? null,
        notes: params.notes ?? null,
        occurredAt,
      },
    });

    profile = await transaction.quitProfile.update({
      where: { id: profile.id },
      data: {
        ...baseUpdate,
        lastRelapseAt: occurredAt,
        longestStreakDays: Math.max(profile.longestStreakDays, completedStreakDays),
        currentStreakStartedAt: addDays(streakStartDay, 1),
      },
    });

    return profile;
  }

  if (params.outcome === CravingOutcome.SUPPORT_REQUESTED) {
    await transaction.urgeIntervention.create({
      data: {
        userId: params.userId,
        quitProfileId: profile.id,
        cravingLogId: params.cravingLogId,
        interventionType: 'emergency_support',
        source: 'craving_log',
        outcome: 'requested',
        usedAt: occurredAt,
      },
    });

    baseUpdate.emergencySupportUses = {
      increment: 1,
    };
  }

  if (params.outcome === CravingOutcome.RESISTED) {
    await transaction.urgeIntervention.create({
      data: {
        userId: params.userId,
        quitProfileId: profile.id,
        cravingLogId: params.cravingLogId,
        interventionType: 'urge_resisted',
        source: 'craving_log',
        outcome: 'resisted',
        usedAt: occurredAt,
      },
    });
  }

  profile = await transaction.quitProfile.update({
    where: { id: profile.id },
    data: baseUpdate,
  });

  return profile;
}
