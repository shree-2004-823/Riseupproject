import { CravingOutcome, HabitCategory } from '@prisma/client';
import { getDateKey } from '../lib/dates.js';
import { inferCountsAsWorkout } from '../lib/habit-signals.js';
import { prisma } from '../lib/prisma.js';
import { buildChallengeSnapshot } from './challenge-service.js';
import { syncQuitSupportFromCraving } from './quit-support-service.js';

type InitResult = {
  workoutHabitsUpdated: number;
  quitProfilesCreated: number;
  cravingLogsSynced: number;
  challengeParticipantsBackfilled: number;
  reminderEventsInitialized: number;
};

function normalizePrimaryHabitType(value: string | null | undefined) {
  const normalized = value?.toLowerCase() ?? '';
  if (normalized.includes('alcohol')) return 'alcohol';
  return 'smoking';
}

async function backfillWorkoutHabitFlags() {
  const habits = await prisma.habit.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      countsAsWorkout: true,
    },
  });

  let updated = 0;

  for (const habit of habits) {
    const inferred = inferCountsAsWorkout(habit.name, habit.category as HabitCategory);

    if (habit.countsAsWorkout !== inferred) {
      await prisma.habit.update({
        where: { id: habit.id },
        data: {
          countsAsWorkout: inferred,
        },
      });
      updated += 1;
    }
  }

  return updated;
}

async function ensureQuitProfiles() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      profile: {
        select: {
          goals: true,
        },
      },
      habits: {
        where: {
          isActive: true,
        },
        select: {
          name: true,
        },
      },
      cravingLogs: {
        orderBy: { occurredAt: 'asc' },
        select: {
          id: true,
          habitType: true,
          trigger: true,
          intensity: true,
          notes: true,
          outcome: true,
          occurredAt: true,
        },
      },
      quitProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  let createdProfiles = 0;
  let syncedCravings = 0;

  for (const user of users) {
    const recoveryHabit = user.habits.find((habit) => {
      const normalized = habit.name.toLowerCase();
      return normalized.includes('smoking') || normalized.includes('alcohol');
    });
    const firstCraving = user.cravingLogs[0];

    if (!recoveryHabit && !firstCraving && user.quitProfile) {
      continue;
    }

    if (!user.quitProfile) {
      const primaryHabitType = normalizePrimaryHabitType(recoveryHabit?.name ?? firstCraving?.habitType);
      const startedAt = firstCraving?.occurredAt ?? user.createdAt;

      await prisma.quitProfile.create({
        data: {
          userId: user.id,
          primaryHabitType,
          reasonsToQuit: user.profile?.goals ?? null,
          quitStartedAt: startedAt,
          currentStreakStartedAt: startedAt,
        },
      });
      createdProfiles += 1;
    }

    for (const craving of user.cravingLogs) {
      const existingRelapse = craving.outcome === CravingOutcome.RELAPSED
        ? await prisma.relapseEvent.findUnique({
            where: { cravingLogId: craving.id },
            select: { id: true },
          })
        : null;
      const existingIntervention =
        craving.outcome !== CravingOutcome.RELAPSED
          ? await prisma.urgeIntervention.findFirst({
              where: { cravingLogId: craving.id },
              select: { id: true },
            })
          : null;

      if (existingRelapse || existingIntervention) {
        continue;
      }

      await prisma.$transaction(async (transaction) => {
        await syncQuitSupportFromCraving(transaction, {
          userId: user.id,
          cravingLogId: craving.id,
          habitType: craving.habitType,
          outcome: craving.outcome,
          occurredAt: craving.occurredAt,
          trigger: craving.trigger,
          intensity: craving.intensity,
          notes: craving.notes,
        });
      });

      syncedCravings += 1;
    }
  }

  return { createdProfiles, syncedCravings };
}

async function backfillChallengeSnapshots() {
  const participants = await prisma.challengeParticipant.findMany({
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  for (const participant of participants) {
    await buildChallengeSnapshot(participant.userId);
  }

  return participants.length;
}

async function initializeTodayReminderEvents() {
  const todayKey = getDateKey();
  const userIds = await prisma.reminderSchedule.findMany({
    where: { enabled: true },
    select: { userId: true },
    distinct: ['userId'],
  });

  let initialized = 0;

  for (const entry of userIds) {
    const existingTodayEvents = await prisma.reminderEvent.count({
      where: {
        userId: entry.userId,
        scheduledFor: {
          gte: new Date(`${todayKey}T00:00:00`),
          lt: new Date(`${todayKey}T23:59:59.999`),
        },
      },
    });

    if (existingTodayEvents > 0) {
      continue;
    }

    const schedules = await prisma.reminderSchedule.findMany({
      where: {
        userId: entry.userId,
        enabled: true,
      },
      select: {
        id: true,
        type: true,
        time: true,
        habitId: true,
      },
    });

    if (schedules.length === 0) {
      continue;
    }

    await prisma.reminderEvent.createMany({
      data: schedules.map((schedule) => {
        const scheduledFor = new Date(`${todayKey}T00:00:00`);
        const [hours, minutes] = schedule.time.split(':').map(Number);
        scheduledFor.setHours(hours, minutes, 0, 0);

        return {
          externalKey: `${schedule.id}:${todayKey}:init`,
          userId: entry.userId,
          scheduleId: schedule.id,
          habitId: schedule.habitId,
          type: schedule.type,
          status: 'GENERATED',
          scheduledFor,
        };
      }),
    });

    initialized += schedules.length;
  }

  return initialized;
}

export async function runRefinedSchemaBackfill() {
  const workoutHabitsUpdated = await backfillWorkoutHabitFlags();
  const { createdProfiles: quitProfilesCreated, syncedCravings: cravingLogsSynced } = await ensureQuitProfiles();
  const challengeParticipantsBackfilled = await backfillChallengeSnapshots();
  const reminderEventsInitialized = await initializeTodayReminderEvents();

  const result: InitResult = {
    workoutHabitsUpdated,
    quitProfilesCreated,
    cravingLogsSynced,
    challengeParticipantsBackfilled,
    reminderEventsInitialized,
  };

  return result;
}
