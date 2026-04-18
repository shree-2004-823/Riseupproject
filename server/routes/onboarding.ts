import { EnergyLevel, HabitCategory, HabitSource, PlannerMode, PlannerPeriod, TaskStatus } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { inferCountsAsWorkout } from '../lib/habit-signals.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { onboardingSchema } from '../validators/onboarding.js';
import { getDateKey } from '../lib/dates.js';
import { parseStoredGoals, stringifyGoals } from '../lib/profile.js';

export const onboardingRouter = Router();

onboardingRouter.use(authenticate);

const defaultHabitNames = new Set([
  'Exercise',
  'Running',
  'Drink water',
  'Meditation',
  'Reading',
  'Sleep on time',
  'No smoking',
  'No alcohol',
  'Journal daily',
  'Eat healthy',
  'Take vitamins',
  'Stretch',
]);

function inferCategoryFromHabit(habitName: string) {
  const normalized = habitName.toLowerCase();

  if (normalized.includes('smoking') || normalized.includes('alcohol')) {
    return HabitCategory.RECOVERY;
  }

  if (normalized.includes('journal') || normalized.includes('meditation')) {
    return HabitCategory.EMOTIONAL;
  }

  if (normalized.includes('read') || normalized.includes('study')) {
    return HabitCategory.MENTAL;
  }

  if (normalized.includes('sleep') || normalized.includes('discipline')) {
    return HabitCategory.DISCIPLINE;
  }

  return HabitCategory.PHYSICAL;
}

function buildStarterPlannerItems(habits: string[], routine: Record<string, string | undefined>) {
  const items = [];

  if (habits.length > 0) {
    items.push({
      title: habits[0],
      period: PlannerPeriod.MORNING,
      energyLevel: EnergyLevel.HIGH,
      scheduledTime: routine.workoutTime ?? '08:00',
      status: TaskStatus.PENDING,
    });
  }

  items.push(
    {
      title: 'Focus session',
      period: PlannerPeriod.AFTERNOON,
      energyLevel: EnergyLevel.HIGH,
      scheduledTime: '14:00',
      status: TaskStatus.PENDING,
    },
    {
      title: 'Evening reflection',
      period: PlannerPeriod.EVENING,
      energyLevel: EnergyLevel.LOW,
      scheduledTime: routine.reminderTime ?? '20:00',
      status: TaskStatus.PENDING,
    },
  );

  return items;
}

onboardingRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const [profile, habits] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.habit.findMany({
        where: { userId, source: HabitSource.ONBOARDING, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    response.json({
      goals: parseStoredGoals(profile?.goals),
      habits: habits.map((habit) => habit.name),
      customHabits: habits
        .map((habit) => habit.name)
        .filter((habit) => !defaultHabitNames.has(habit)),
      routine: {
        wakeTime: profile?.wakeTime ?? '07:00',
        workoutTime: profile?.workoutTime ?? '08:00',
        reminderTime: profile?.reminderTime ?? '20:00',
        sleepTime: profile?.sleepTime ?? '22:00',
      },
      coachPersonality: profile?.aiStyle ?? '',
    });
  }),
);

onboardingRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = onboardingSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid onboarding payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const { goals, habits, customHabits, routine, coachPersonality } = parsed.data;
    const allHabits = Array.from(new Set([...habits, ...customHabits]));
    const todayKey = getDateKey();

    await prisma.$transaction(async (transaction) => {
      await transaction.userProfile.upsert({
        where: { userId },
        update: {
          goals: stringifyGoals(goals),
          aiStyle: coachPersonality,
          wakeTime: routine.wakeTime,
          workoutTime: routine.workoutTime,
          reminderTime: routine.reminderTime,
          sleepTime: routine.sleepTime,
        },
        create: {
          userId,
          goals: stringifyGoals(goals),
          aiStyle: coachPersonality,
          wakeTime: routine.wakeTime,
          workoutTime: routine.workoutTime,
          reminderTime: routine.reminderTime,
          sleepTime: routine.sleepTime,
        },
      });

      await transaction.habit.updateMany({
        where: {
          userId,
          source: HabitSource.ONBOARDING,
        },
        data: {
          isActive: false,
        },
      });

      if (allHabits.length > 0) {
        await transaction.habit.createMany({
          data: allHabits.map((habit) => ({
            userId,
            name: habit,
            category: inferCategoryFromHabit(habit),
            countsAsWorkout: inferCountsAsWorkout(habit, inferCategoryFromHabit(habit)),
            source: HabitSource.ONBOARDING,
            scheduledTime: habit.toLowerCase().includes('journal')
              ? routine.reminderTime
              : routine.workoutTime,
            frequency: 'Daily',
            isActive: true,
          })),
        });
      }

      const starterItems = buildStarterPlannerItems(allHabits, routine);
      await transaction.dailyPlan.upsert({
        where: {
          userId_dateKey: {
            userId,
            dateKey: todayKey,
          },
        },
        update: {
          mode: PlannerMode.NORMAL,
          items: {
            deleteMany: {},
            create: starterItems,
          },
        },
        create: {
          userId,
          dateKey: todayKey,
          mode: PlannerMode.NORMAL,
          items: {
            create: starterItems,
          },
        },
      });

      if (allHabits.some((habit) => {
        const normalized = habit.toLowerCase();
        return normalized.includes('smoking') || normalized.includes('alcohol');
      })) {
        await transaction.quitProfile.upsert({
          where: { userId },
          update: {
            reasonsToQuit: stringifyGoals(goals),
            ...(allHabits.some((habit) => habit.toLowerCase().includes('alcohol'))
              ? { primaryHabitType: 'alcohol' }
              : { primaryHabitType: 'smoking' }),
          },
          create: {
            userId,
            reasonsToQuit: stringifyGoals(goals),
            primaryHabitType: allHabits.some((habit) => habit.toLowerCase().includes('alcohol')) ? 'alcohol' : 'smoking',
            quitStartedAt: new Date(`${todayKey}T00:00:00`),
            currentStreakStartedAt: new Date(`${todayKey}T00:00:00`),
          },
        });
      }

      await transaction.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });
    });

    response.json({
      message: 'Onboarding saved successfully',
    });
  }),
);
