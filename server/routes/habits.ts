import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { habitSchema, habitUpdateSchema } from '../validators/habits.js';
import {
  formatHabitCategory,
  formatHabitDifficulty,
  parseHabitCategory,
  parseHabitDifficulty,
} from '../lib/domain.js';
import { inferCountsAsWorkout } from '../lib/habit-signals.js';
import { markReminderEventsActedOn } from '../services/reminder-event-service.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { getDateKey, getWeekDateKeys } from '../lib/dates.js';

export const habitsRouter = Router();

habitsRouter.use(authenticate);

function serializeHabit(
  habit: {
    id: string;
    name: string;
    category: ReturnType<typeof parseHabitCategory>;
    difficulty: ReturnType<typeof parseHabitDifficulty>;
    frequency: string | null;
    scheduledTime: string | null;
    reminderTime: string | null;
    fallbackTask: string | null;
    isActive: boolean;
    logs?: Array<{ dateKey: string; completed: boolean }>;
  },
  todayKey: string,
) {
  const completedLogs = (habit.logs ?? []).filter((log) => log.completed);
  const completedToday = completedLogs.some((log) => log.dateKey === todayKey);
  const streak = calculateDateKeyStreak(completedLogs.map((log) => log.dateKey));

  return {
    id: habit.id,
    name: habit.name,
    category: formatHabitCategory(habit.category),
    difficulty: formatHabitDifficulty(habit.difficulty),
    frequency: habit.frequency ?? 'Daily',
    time: habit.scheduledTime ?? habit.reminderTime,
    completed: completedToday,
    streak,
    fallbackTask: habit.fallbackTask,
    isActive: habit.isActive,
  };
}

habitsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const todayKey = typeof request.query.dateKey === 'string' ? request.query.dateKey : getDateKey();
    const weekDateKeys = getWeekDateKeys();

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        logs: {
          orderBy: { dateKey: 'desc' },
          take: 60,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serializedHabits = habits.map((habit) => serializeHabit(habit, todayKey));
    const completedCount = serializedHabits.filter((habit) => habit.completed).length;
    const totalCount = serializedHabits.length;
    const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const longestStreak = serializedHabits.reduce((max, habit) => Math.max(max, habit.streak), 0);
    const activeCount = serializedHabits.length;
    const weekRate =
      totalCount === 0
        ? 0
        : Math.round(
            (weekDateKeys.reduce((sum, day) => {
              return (
                sum +
                habits.reduce((daySum, habit) => {
                  return daySum + Number(habit.logs.some((log) => log.dateKey === day.dateKey && log.completed));
                }, 0)
              );
            }, 0) /
              (weekDateKeys.length * totalCount)) *
              100,
          );

    response.json({
      habits: serializedHabits,
      stats: {
        completedCount,
        totalCount,
        completionPercentage,
        longestStreak,
        activeCount,
        weekRate,
      },
      week: weekDateKeys.map((day) => ({
        label: day.label,
        completed: habits.some((habit) => habit.logs.some((log) => log.dateKey === day.dateKey && log.completed)),
      })),
    });
  }),
);

habitsRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = habitSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid habit payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const category = parseHabitCategory(parsed.data.category);
    const habit = await prisma.habit.create({
      data: {
        userId,
        name: parsed.data.name,
        category,
        countsAsWorkout: inferCountsAsWorkout(parsed.data.name, category),
        difficulty: parseHabitDifficulty(parsed.data.difficulty),
        frequency: parsed.data.frequency ?? 'Daily',
        scheduledTime: parsed.data.scheduledTime,
        reminderTime: parsed.data.reminderTime,
        fallbackTask: parsed.data.fallbackTask,
      },
    });

    response.status(201).json({
      habit: serializeHabit({ ...habit, logs: [] }, getDateKey()),
    });
  }),
);

habitsRouter.patch(
  '/:id',
  asyncHandler(async (request, response) => {
    const habitId = String(request.params.id);
    const parsed = habitUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid habit update payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const existingHabit = await prisma.habit.findFirst({
      where: { id: habitId, userId, isActive: true },
      include: { logs: true },
    });

    if (!existingHabit) {
      throw new HttpError(404, 'Habit not found');
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: existingHabit.id },
      data: (() => {
        const nextName = parsed.data.name ?? existingHabit.name;
        const nextCategory = parsed.data.category ? parseHabitCategory(parsed.data.category) : existingHabit.category;

        return {
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
          ...(parsed.data.category ? { category: nextCategory } : {}),
          countsAsWorkout: inferCountsAsWorkout(nextName, nextCategory),
        ...(parsed.data.difficulty ? { difficulty: parseHabitDifficulty(parsed.data.difficulty) } : {}),
        ...(parsed.data.frequency !== undefined ? { frequency: parsed.data.frequency } : {}),
        ...(parsed.data.scheduledTime !== undefined ? { scheduledTime: parsed.data.scheduledTime } : {}),
        ...(parsed.data.reminderTime !== undefined ? { reminderTime: parsed.data.reminderTime } : {}),
        ...(parsed.data.fallbackTask !== undefined ? { fallbackTask: parsed.data.fallbackTask } : {}),
        };
      })(),
      include: { logs: true },
    });

    response.json({
      habit: serializeHabit(updatedHabit, getDateKey()),
    });
  }),
);

habitsRouter.delete(
  '/:id',
  asyncHandler(async (request, response) => {
    const habitId = String(request.params.id);
    const userId = request.auth!.userId;
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId, isActive: true },
    });

    if (!habit) {
      throw new HttpError(404, 'Habit not found');
    }

    await prisma.habit.update({
      where: { id: habit.id },
      data: { isActive: false },
    });

    response.status(204).send();
  }),
);

habitsRouter.post(
  '/:id/log',
  asyncHandler(async (request, response) => {
    const habitId = String(request.params.id);
    const userId = request.auth!.userId;
    const dateKey = typeof request.body?.dateKey === 'string' ? request.body.dateKey : getDateKey();

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId, isActive: true },
    });

    if (!habit) {
      throw new HttpError(404, 'Habit not found');
    }

    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_dateKey: {
          habitId: habit.id,
          dateKey,
        },
      },
    });

    const log = await prisma.$transaction(async (transaction) => {
      const nextLog = existingLog
        ? await transaction.habitLog.update({
            where: { id: existingLog.id },
            data: {
              completed: !existingLog.completed,
              completedAt: existingLog.completed ? null : new Date(),
            },
          })
        : await transaction.habitLog.create({
            data: {
              userId,
              habitId: habit.id,
              dateKey,
              completed: true,
              completedAt: new Date(),
            },
          });

      if (nextLog.completed) {
        await markReminderEventsActedOn(transaction, {
          userId,
          habitId: habit.id,
          actedAt: nextLog.completedAt ?? new Date(),
        });
      }

      return nextLog;
    });

    response.json({
      habitId: habit.id,
      completed: log.completed,
      dateKey: log.dateKey,
    });
  }),
);
