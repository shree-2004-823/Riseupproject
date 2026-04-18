import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { getWeekDateKeys } from '../lib/dates.js';
import { parseStoredGoals, serializeRoutine, stringifyGoals } from '../lib/profile.js';
import { prisma } from '../lib/prisma.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { authenticate } from '../middleware/authenticate.js';
import { profileUpdateSchema } from '../validators/profile.js';

export const profileRouter = Router();

profileRouter.use(authenticate);

function calculateLongestStreak(dateKeys: string[]) {
  const sorted = Array.from(new Set(dateKeys))
    .map((dateKey) => startOfDay(new Date(`${dateKey}T00:00:00`)))
    .sort((left, right) => left.getTime() - right.getTime());

  if (sorted.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const currentDate = sorted[index];

    if (differenceInCalendarDays(currentDate, previous) === 1) {
      current += 1;
      longest = Math.max(longest, current);
      continue;
    }

    current = 1;
  }

  return longest;
}

async function buildProfileResponse(userId: string) {
  const weekDateKeys = new Set(getWeekDateKeys().map((entry) => entry.dateKey));
  const [user, profile, habits, completedHabitLogs, moodLogs] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      select: { id: true },
    }),
    prisma.habitLog.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        dateKey: true,
      },
    }),
    prisma.moodLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        date: true,
      },
    }),
  ]);

  const completedDateKeys = completedHabitLogs.map((log) => log.dateKey);
  const weeklyCompletions = completedHabitLogs.filter((log) => weekDateKeys.has(log.dateKey)).length;
  const weeklyTarget = habits.length * 7;

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      goals: parseStoredGoals(profile?.goals),
      coachPersonality: profile?.aiStyle ?? '',
      routine: serializeRoutine(profile),
    },
    stats: {
      currentStreak: calculateDateKeyStreak(completedDateKeys),
      longestStreak: calculateLongestStreak(completedDateKeys),
      totalHabits: habits.length,
      weekCompletionRate: weeklyTarget === 0 ? 0 : Math.round((weeklyCompletions / weeklyTarget) * 100),
      moodCheckInStreak: calculateDateKeyStreak(moodLogs.map((log) => log.date.toISOString().slice(0, 10))),
    },
  };
}

profileRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    response.json(await buildProfileResponse(request.auth!.userId));
  }),
);

profileRouter.patch(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = profileUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid profile payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const data = parsed.data;

    await prisma.$transaction(async (transaction) => {
      if (data.fullName !== undefined) {
        await transaction.user.update({
          where: { id: userId },
          data: {
            fullName: data.fullName,
          },
        });
      }

      if (data.goals !== undefined || data.coachPersonality !== undefined) {
        const existingProfile = await transaction.userProfile.findUnique({
          where: { userId },
        });

        await transaction.userProfile.upsert({
          where: { userId },
          update: {
            goals: data.goals !== undefined ? stringifyGoals(data.goals) : existingProfile?.goals,
            aiStyle: data.coachPersonality !== undefined ? data.coachPersonality : existingProfile?.aiStyle,
          },
          create: {
            userId,
            goals: stringifyGoals(data.goals ?? []),
            aiStyle: data.coachPersonality ?? '',
          },
        });
      }
    });

    response.json(await buildProfileResponse(userId));
  }),
);
