import { TaskStatus } from '@prisma/client';
import { formatPlannerPeriod } from '../lib/domain.js';
import { getDateKey } from '../lib/dates.js';
import { prisma } from '../lib/prisma.js';
import { persistGeneratedReminderEvents } from './reminder-event-service.js';

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function determineReminderState(scheduleMinutes: number, currentMinutes: number) {
  if (currentMinutes >= scheduleMinutes + 60) {
    return 'missed';
  }

  if (currentMinutes >= scheduleMinutes) {
    return 'due';
  }

  if (scheduleMinutes - currentMinutes <= 120) {
    return 'upcoming';
  }

  return null;
}

type GeneratedReminderStatus = Exclude<ReturnType<typeof determineReminderState>, null>;
type ReminderType = 'workout' | 'hydration' | 'mood-check' | 'journal' | 'quit-support' | 'sleep';
type GeneratedReminder = {
  id: string;
  externalKey: string;
  scheduleId: string;
  type: ReminderType | 'habit';
  status: GeneratedReminderStatus;
  title: string;
  message: string;
  time: string;
  habitId?: string | null;
  planItemId?: string | null;
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const reminderLabelMap: Record<ReminderType, string> = {
  workout: 'Workout',
  hydration: 'Hydration',
  'mood-check': 'Mood Check',
  journal: 'Journal',
  'quit-support': 'Quit Support',
  sleep: 'Sleep',
};

function createReminder(params: {
  id: string;
  externalKey: string;
  scheduleId: string;
  type: ReminderType | 'habit';
  status: GeneratedReminderStatus;
  title: string;
  message: string;
  time: string;
  habitId?: string | null;
  planItemId?: string | null;
}) {
  return params;
}

export async function getReminderData(userId: string) {
  const todayKey = getDateKey();
  const currentMinutes = nowMinutes();

  const [schedules, habits, todayHabitLogs, todayMoodLog, todayJournalEntry, todayPlan, todayCravings, recentEvents] = await Promise.all([
    prisma.reminderSchedule.findMany({
      where: { userId },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ enabled: 'desc' }, { time: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        reminderTime: true,
        scheduledTime: true,
      },
    }),
    prisma.habitLog.findMany({
      where: { userId, dateKey: todayKey, completed: true },
      select: {
        habitId: true,
      },
    }),
    prisma.moodLog.findFirst({
      where: { userId, date: { gte: new Date(`${todayKey}T00:00:00`) } },
      orderBy: { date: 'desc' },
      select: {
        id: true,
      },
    }),
    prisma.journalEntry.findFirst({
      where: {
        userId,
        createdAt: { gte: new Date(`${todayKey}T00:00:00`) },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
      },
    }),
    prisma.dailyPlan.findUnique({
      where: {
        userId_dateKey: {
          userId,
          dateKey: todayKey,
        },
      },
      include: {
        items: {
          where: {
            status: TaskStatus.PENDING,
          },
          orderBy: [{ period: 'asc' }, { scheduledTime: 'asc' }],
          select: {
            title: true,
            period: true,
          },
        },
      },
    }),
    prisma.cravingLog.count({
      where: {
        userId,
        occurredAt: { gte: new Date(`${todayKey}T00:00:00`) },
      },
    }),
    prisma.reminderEvent.findMany({
      where: {
        userId,
        scheduledFor: {
          gte: new Date(`${todayKey}T00:00:00`),
          lt: new Date(`${todayKey}T23:59:59.999`),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const completedHabitIds = new Set(todayHabitLogs.map((log) => log.habitId));
  const schedulesByHabitId = new Set(schedules.map((schedule) => schedule.habitId).filter((habitId): habitId is string => Boolean(habitId)));
  const generatedFromSchedules = schedules
    .filter((schedule) => schedule.enabled)
    .map<GeneratedReminder | null>((schedule) => {
      const scheduleMinutes = timeToMinutes(schedule.time);
      const state = determineReminderState(scheduleMinutes, currentMinutes);

      if (!state) {
        return null;
      }

      if (schedule.type === 'mood-check' && todayMoodLog) {
        return null;
      }

      if (schedule.type === 'journal' && todayJournalEntry) {
        return null;
      }

      if (schedule.type === 'workout' && schedule.habitId && completedHabitIds.has(schedule.habitId)) {
        return null;
      }

      const baseLabel = reminderLabelMap[schedule.type as ReminderType];
      const nextTask = todayPlan?.items[0];

      let message =
        schedule.message ??
        (state === 'missed'
          ? `${baseLabel} check-in for ${schedule.time} still needs attention.`
          : `${baseLabel} reminder is scheduled for ${schedule.time}.`);

      if (schedule.type === 'hydration') {
        message =
          schedule.message ??
          (state === 'missed'
            ? `You missed your hydration reminder from ${schedule.time}. Drink some water now and reset.`
            : `Hydrate and reset your energy at ${schedule.time}.`);
      } else if (schedule.type === 'mood-check') {
        message =
          schedule.message ??
          (state === 'missed'
            ? `You planned to log your mood at ${schedule.time} and it is still open.`
            : `Take a quick moment to check in with your mood at ${schedule.time}.`);
      } else if (schedule.type === 'journal') {
        message =
          schedule.message ??
          (state === 'missed'
            ? `Your journal reflection from ${schedule.time} is still missing today.`
            : `Capture a quick reflection in your journal at ${schedule.time}.`);
      } else if (schedule.type === 'quit-support') {
        message =
          schedule.message ??
          (todayCravings > 0
            ? `You logged ${todayCravings} craving moments today. Use this reminder to reset and protect the next hour.`
            : `Pause, breathe, and protect your recovery routine at ${schedule.time}.`);
      } else if (schedule.type === 'sleep') {
        message =
          schedule.message ??
          (state === 'missed'
            ? `Your sleep wind-down from ${schedule.time} has slipped. Start a lighter shutdown routine now.`
            : `Start winding down at ${schedule.time} to protect sleep consistency.`);
      } else if (schedule.type === 'workout' && schedule.habit) {
        message =
          schedule.message ??
          (state === 'missed'
            ? `${schedule.habit.name} was planned for ${schedule.time} and is still incomplete today.`
            : `${schedule.habit.name} is scheduled for ${schedule.time}.`);
      } else if (nextTask && schedule.type === 'workout') {
        message =
          schedule.message ??
          `Pair this workout reminder with your ${titleCase(formatPlannerPeriod(nextTask.period))} plan block.`;
      }

      return createReminder({
        id: `${schedule.id}:${todayKey}`,
        externalKey: `${schedule.id}:${todayKey}`,
        scheduleId: schedule.id,
        type: schedule.type as ReminderType,
        status: state,
        title: state === 'missed' ? `Missed ${baseLabel.toLowerCase()} reminder` : `${baseLabel} reminder`,
        message,
        time: schedule.time,
        habitId: schedule.habitId,
      });
    })
    .filter((reminder): reminder is NonNullable<typeof reminder> => reminder !== null);

  const generatedHabitCandidates = habits
    .filter((habit) => !completedHabitIds.has(habit.id))
    .filter((habit) => !schedulesByHabitId.has(habit.id))
    .map<GeneratedReminder | null>((habit) => {
      const reminderTime = habit.reminderTime ?? habit.scheduledTime;

      if (!reminderTime) {
        return null;
      }

      const state = determineReminderState(timeToMinutes(reminderTime), currentMinutes);

      if (!state) {
        return null;
      }

      return createReminder({
        id: `candidate:habit:${habit.id}:${todayKey}`,
        externalKey: `candidate:habit:${habit.id}:${todayKey}`,
        scheduleId: `candidate:habit:${habit.id}`,
        type: 'habit',
        status: state,
        title: state === 'missed' ? `Missed habit: ${habit.name}` : `Habit reminder: ${habit.name}`,
        message:
          state === 'missed'
            ? `${habit.name} was expected by ${reminderTime} and is still not complete today.`
            : `${habit.name} is still open for today. Knock it out while the window is active.`,
        time: reminderTime,
        habitId: habit.id,
      });
    })
    .filter((reminder): reminder is NonNullable<typeof reminder> => reminder !== null);

  const generatedJournalCandidate =
    todayJournalEntry || schedules.some((schedule) => schedule.enabled && schedule.type === 'journal')
      ? null
      : (() => {
          const journalTime = '20:00';
          const state = determineReminderState(timeToMinutes(journalTime), currentMinutes);

          if (!state) {
            return null;
          }

          return createReminder({
            id: `candidate:journal:${todayKey}`,
            externalKey: `candidate:journal:${todayKey}`,
            scheduleId: 'candidate:journal',
            type: 'journal',
            status: state,
            title: state === 'missed' ? 'Missed journal reflection' : 'Journal reminder',
            message:
              state === 'missed'
                ? 'You have not logged a journal entry today. A short reflection can still close the day well.'
                : 'You have not journaled today yet. Capture a quick reflection before the day ends.',
            time: journalTime,
          });
        })();

  const generated = [...generatedFromSchedules, ...generatedHabitCandidates, ...(generatedJournalCandidate ? [generatedJournalCandidate] : [])]
    .sort((left, right) => {
      const statePriority: Record<GeneratedReminderStatus, number> = { due: 0, missed: 1, upcoming: 2 };
      return statePriority[left.status] - statePriority[right.status] || left.time.localeCompare(right.time);
    });

  await prisma.$transaction(async (transaction) => {
    await persistGeneratedReminderEvents(
      transaction,
      userId,
      generated.map((reminder) => ({
        externalKey: reminder.externalKey,
        scheduleId: reminder.scheduleId.startsWith('candidate:') ? null : reminder.scheduleId,
        habitId: reminder.habitId,
        planItemId: reminder.planItemId,
        type: reminder.type,
        status: reminder.status,
        time: reminder.time,
      })),
      todayKey,
    );
  });

  return {
    schedules: schedules.map((schedule) => ({
      id: schedule.id,
      type: schedule.type,
      title: schedule.title,
      message: schedule.message,
      time: schedule.time,
      enabled: schedule.enabled,
      habitId: schedule.habitId,
      habitName: schedule.habit?.name ?? null,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    })),
    generated,
    availableHabits: habits,
    summary: {
      enabledCount: schedules.filter((schedule) => schedule.enabled).length,
      missedCount: generated.filter((reminder) => reminder.status === 'missed').length,
      dueCount: generated.filter((reminder) => reminder.status === 'due').length,
      actedOnCount: recentEvents.filter((event) => event.status === 'ACTED_ON').length,
    },
  };
}
