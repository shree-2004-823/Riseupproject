import { CravingOutcome, MoodLabel, PlannerPeriod, TaskStatus } from '@prisma/client';
import { differenceInCalendarDays, format, startOfDay, subDays } from 'date-fns';
import { Router } from 'express';
import { formatMoodLabel, formatPlannerPeriod } from '../lib/domain.js';
import { getDateKey } from '../lib/dates.js';
import { asyncHandler } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentQuitStreakDays, getLongestQuitStreakDays } from '../services/quit-support-service.js';

export const progressRouter = Router();

progressRouter.use(authenticate);

const moodScores: Record<MoodLabel, number> = {
  HAPPY: 9,
  CALM: 8,
  MOTIVATED: 8,
  NEUTRAL: 6,
  TIRED: 4,
  STRESSED: 3,
  ANXIOUS: 2,
  SAD: 2,
  FRUSTRATED: 3,
  OVERWHELMED: 1,
};

function average(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function buildRecentDays(days: number) {
  const today = startOfDay(new Date());

  return Array.from({ length: days }, (_, index) => {
    const date = subDays(today, days - index - 1);

    return {
      date,
      dateKey: getDateKey(date),
      label: format(date, 'MMM d'),
    };
  });
}

function parseRange(rawRange?: string) {
  if (rawRange === '7d') return 7;
  if (rawRange === '30d') return 30;
  if (rawRange === '90d') return 90;
  return 14;
}

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

function getMoodDirection(values: number[]) {
  if (values.length < 4) {
    return 'steady';
  }

  const midpoint = Math.floor(values.length / 2);
  const firstHalf = average(values.slice(0, midpoint));
  const secondHalf = average(values.slice(midpoint));
  const delta = secondHalf - firstHalf;

  if (delta >= 0.75) {
    return 'improving';
  }

  if (delta <= -0.75) {
    return 'declining';
  }

  return 'steady';
}

function getTimeWindowLabel(date: Date) {
  const hour = date.getHours();

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function buildCountArray(values: string[]) {
  const counts = values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function formatMoodValue(value: number | null) {
  return value == null ? 'No data' : `${value}/10`;
}

progressRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const rangeLabel = typeof request.query.range === 'string' ? request.query.range : '14d';
    const rangeDays = parseRange(rangeLabel);
    const recentDays = buildRecentDays(rangeDays);
    const weeklyDays = buildRecentDays(7);
    const oldestDay = recentDays[0];
    const latestDay = recentDays[recentDays.length - 1];
    const weeklyDateKeys = new Set(weeklyDays.map((day) => day.dateKey));

    const [habits, habitLogs, moods, cravings, plans, quitProfile, reminderEvents] = await Promise.all([
      prisma.habit.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          category: true,
          countsAsWorkout: true,
        },
      }),
      prisma.habitLog.findMany({
        where: {
          userId,
          dateKey: {
            gte: oldestDay.dateKey,
            lte: latestDay.dateKey,
          },
          completed: true,
        },
        select: {
          dateKey: true,
          habitId: true,
        },
      }),
      prisma.moodLog.findMany({
        where: {
          userId,
          date: { gte: oldestDay.date },
        },
        orderBy: { date: 'asc' },
        select: {
          date: true,
          moodLabel: true,
          energy: true,
          stress: true,
          motivation: true,
        },
      }),
      prisma.cravingLog.findMany({
        where: {
          userId,
          occurredAt: { gte: oldestDay.date },
        },
        orderBy: { occurredAt: 'asc' },
        select: {
          trigger: true,
          intensity: true,
          outcome: true,
          occurredAt: true,
        },
      }),
      prisma.dailyPlan.findMany({
        where: {
          userId,
          dateKey: {
            gte: oldestDay.dateKey,
            lte: latestDay.dateKey,
          },
        },
        include: {
          items: {
            select: {
              id: true,
              status: true,
              period: true,
              carriedFromDateKey: true,
              completedAfterRollover: true,
            },
          },
        },
      }),
      prisma.quitProfile.findUnique({
        where: { userId },
      }),
      prisma.reminderEvent.findMany({
        where: {
          userId,
          scheduledFor: {
            gte: oldestDay.date,
          },
        },
        select: {
          status: true,
          scheduledFor: true,
          type: true,
        },
      }),
    ]);

    const totalHabitTargets = habits.length * recentDays.length;
    const weeklyHabitTargets = habits.length * weeklyDays.length;

    const completionByDay = recentDays.map((day) => {
      const completedCount = new Set(
        habitLogs.filter((log) => log.dateKey === day.dateKey).map((log) => log.habitId),
      ).size;
      const targetCount = habits.length;

      return {
        day: day.label,
        completed: completedCount,
        target: targetCount,
        completionRate: targetCount === 0 ? 0 : Math.round((completedCount / targetCount) * 100),
      };
    });

    const moodTrend = recentDays.map((day) => {
      const logsForDay = moods.filter((entry) => getDateKey(entry.date) === day.dateKey);
      const value = logsForDay.length === 0 ? null : average(logsForDay.map((entry) => moodScores[entry.moodLabel]));

      return {
        day: day.label,
        mood: value == null ? null : Number(value.toFixed(1)),
      };
    });

    const cravingTrend = recentDays.map((day) => {
      const dayCravings = cravings.filter((entry) => getDateKey(entry.occurredAt) === day.dateKey);

      return {
        day: day.label,
        cravings: dayCravings.length,
        resisted: dayCravings.filter((entry) => entry.outcome === CravingOutcome.RESISTED).length,
        relapsed: dayCravings.filter((entry) => entry.outcome === CravingOutcome.RELAPSED).length,
      };
    });

    const completedDateKeys = habitLogs.map((log) => log.dateKey);
    const weeklyHabitLogs = habitLogs.filter((log) => weeklyDateKeys.has(log.dateKey));
    const weeklyMoodEntries = moods.filter((entry) => weeklyDateKeys.has(getDateKey(entry.date)));
    const weeklyPlans = plans.filter((plan) => weeklyDateKeys.has(plan.dateKey));
    const weeklyPlanItems = weeklyPlans.flatMap((plan) => plan.items);
    const weeklyCompletedPlanItems = weeklyPlanItems.filter((item) => item.status === TaskStatus.COMPLETED).length;
    const weeklyPlannerCompletionRate =
      weeklyPlanItems.length === 0 ? 0 : Math.round((weeklyCompletedPlanItems / weeklyPlanItems.length) * 100);

    const currentHabitStreak = calculateDateKeyStreak(completedDateKeys);
    const longestHabitStreak = calculateLongestStreak(completedDateKeys);
    const moodCheckInStreak = calculateDateKeyStreak(moods.map((entry) => getDateKey(entry.date)));
    const habitCompletionRate =
      totalHabitTargets === 0 ? 0 : Math.round((habitLogs.length / totalHabitTargets) * 100);
    const weeklyHabitCompletionRate =
      weeklyHabitTargets === 0 ? 0 : Math.round((weeklyHabitLogs.length / weeklyHabitTargets) * 100);

    const moodValues = moods.map((entry) => moodScores[entry.moodLabel]);
    const weeklyMoodValues = weeklyMoodEntries.map((entry) => moodScores[entry.moodLabel]);
    const averageMoodScore = moodValues.length > 0 ? Number(average(moodValues).toFixed(1)) : null;
    const weeklyAverageMoodScore = weeklyMoodValues.length > 0 ? Number(average(weeklyMoodValues).toFixed(1)) : null;
    const moodDirection = getMoodDirection(moodValues);

    const resistedCravings = cravings.filter((entry) => entry.outcome === CravingOutcome.RESISTED).length;
    const totalCravings = cravings.length;
    const cravingResistanceRate =
      totalCravings === 0 ? 0 : Math.round((resistedCravings / totalCravings) * 100);
    const triggerCounts = buildCountArray(
      cravings.map((entry) => entry.trigger).filter((trigger): trigger is string => Boolean(trigger)),
    );
    const timeOfDayPattern = ['morning', 'afternoon', 'evening', 'night'].map((label) => ({
      label,
      count: cravings.filter((entry) => getTimeWindowLabel(entry.occurredAt) === label).length,
    }));
    const topTrigger = triggerCounts[0]?.label ?? null;
    const topTimeWindow = [...timeOfDayPattern].sort((left, right) => right.count - left.count)[0]?.label ?? null;
    const averageCravingIntensity = average(
      cravings.map((entry) => entry.intensity).filter((value): value is number => value != null),
    );

    const commonMood =
      Object.entries(
        moods.reduce<Record<string, number>>((accumulator, entry) => {
          const label = formatMoodLabel(entry.moodLabel);
          accumulator[label] = (accumulator[label] ?? 0) + 1;
          return accumulator;
        }, {}),
      ).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

    const strongestHabitRows = habits.map((habit) => {
      const habitDateKeys = habitLogs.filter((log) => log.habitId === habit.id).map((log) => log.dateKey);
      const completedDays = new Set(habitDateKeys).size;
      const completionRate = recentDays.length === 0 ? 0 : Math.round((completedDays / recentDays.length) * 100);

      return {
        id: habit.id,
        name: habit.name,
        completionRate,
        completedDays,
        targetDays: recentDays.length,
        currentStreak: calculateDateKeyStreak(habitDateKeys),
      };
    });

    const strongestHabits = [...strongestHabitRows]
      .sort(
        (left, right) =>
          right.completionRate - left.completionRate ||
          right.currentStreak - left.currentStreak ||
          left.name.localeCompare(right.name),
      )
      .slice(0, 3);

    const weakestHabits = [...strongestHabitRows]
      .sort(
        (left, right) =>
          left.completionRate - right.completionRate ||
          left.currentStreak - right.currentStreak ||
          left.name.localeCompare(right.name),
      )
      .slice(0, 3);

    const mostMissedHabit =
      [...strongestHabitRows]
        .sort(
          (left, right) =>
            right.targetDays - right.completedDays - (left.targetDays - left.completedDays) ||
            left.name.localeCompare(right.name),
        )[0] ?? null;

    const averageEnergy =
      moods.filter((entry) => entry.energy != null).length > 0
        ? Number(average(moods.map((entry) => entry.energy).filter((value): value is number => value != null)).toFixed(1))
        : null;
    const averageStress =
      moods.filter((entry) => entry.stress != null).length > 0
        ? Number(average(moods.map((entry) => entry.stress).filter((value): value is number => value != null)).toFixed(1))
        : null;
    const averageMotivation =
      moods.filter((entry) => entry.motivation != null).length > 0
        ? Number(
            average(moods.map((entry) => entry.motivation).filter((value): value is number => value != null)).toFixed(1),
          )
        : null;

    const plannerItems = plans.flatMap((plan) => plan.items);
    const plannerCompleted = plannerItems.filter((item) => item.status === TaskStatus.COMPLETED).length;
    const plannerCompletionRate =
      plannerItems.length === 0 ? 0 : Math.round((plannerCompleted / plannerItems.length) * 100);
    const carryForwardCount = plannerItems.filter((item) => item.carriedFromDateKey != null).length;
    const completedAfterRolloverCount = plannerItems.filter((item) => item.completedAfterRollover).length;
    const periodStats = plannerItems.reduce<Record<string, { completed: number; pending: number }>>((accumulator, item) => {
      const entry = accumulator[item.period] ?? { completed: 0, pending: 0 };

      if (item.status === TaskStatus.COMPLETED) {
        entry.completed += 1;
      } else {
        entry.pending += 1;
      }

      accumulator[item.period] = entry;
      return accumulator;
    }, {});
    const mostCompletedBlock =
      Object.entries(periodStats).sort((left, right) => right[1].completed - left[1].completed)[0]?.[0] ?? null;
    const mostSkippedBlock =
      Object.entries(periodStats).sort((left, right) => right[1].pending - left[1].pending)[0]?.[0] ?? null;

    const explicitWorkoutHabitIds = new Set(habits.filter((habit) => habit.countsAsWorkout).map((habit) => habit.id));
    const fallbackWorkoutHabitIds = new Set(
      habits.filter((habit) => habit.category === 'PHYSICAL').map((habit) => habit.id),
    );
    const workoutHabitIds = explicitWorkoutHabitIds.size > 0 ? explicitWorkoutHabitIds : fallbackWorkoutHabitIds;
    const workoutsCompleted = new Set(
      habitLogs.filter((log) => workoutHabitIds.has(log.habitId)).map((log) => log.dateKey),
    ).size;
    const moodLogRate = recentDays.length === 0 ? 0 : Math.round((moods.length / recentDays.length) * 100);
    const consistencyScore = Math.round(average([habitCompletionRate, plannerCompletionRate, moodLogRate]));
    const smokeFreeDays = quitProfile ? getCurrentQuitStreakDays(quitProfile) : 0;
    const longestSmokeFreeStreak = quitProfile ? getLongestQuitStreakDays(quitProfile) : 0;
    const notResistedCount = totalCravings - resistedCravings;
    const reminderSentCount = reminderEvents.filter((event) => event.status === 'SENT').length;
    const reminderMissedCount = reminderEvents.filter((event) => event.status === 'MISSED').length;
    const reminderActedOnCount = reminderEvents.filter((event) => event.status === 'ACTED_ON').length;
    const reminderEffectivenessRate =
      reminderSentCount === 0 ? 0 : Math.round((reminderActedOnCount / reminderSentCount) * 100);

    const bestDay =
      [...completionByDay]
        .sort((left, right) => right.completionRate - left.completionRate || left.day.localeCompare(right.day))[0]
        ?.day ?? null;
    const hardestDay =
      [...cravingTrend]
        .sort((left, right) => right.cravings - left.cravings || left.day.localeCompare(right.day))[0]
        ?.day ?? null;

    response.json({
      range: rangeLabel,
      stats: [
        {
          label: 'Habit Completion',
          value: `${weeklyHabitCompletionRate}%`,
          tone: 'blue',
          note: `${weeklyHabitLogs.length}/${weeklyHabitTargets || 0} completions this week`,
        },
        {
          label: 'Streak Summary',
          value: `${currentHabitStreak} days`,
          tone: 'orange',
          note: `Best run: ${longestHabitStreak} days`,
        },
        {
          label: 'Mood Trend',
          value: formatMoodValue(weeklyAverageMoodScore),
          tone: 'emerald',
          note: `Trend is ${moodDirection}`,
        },
        {
          label: 'Planner Completion',
          value: `${weeklyPlannerCompletionRate}%`,
          tone: 'violet',
          note: `${weeklyCompletedPlanItems}/${weeklyPlanItems.length} tasks completed`,
        },
      ],
      summary: {
        currentStreak: currentHabitStreak,
        habitsCompletedThisWeek: weeklyHabitLogs.length,
        averageMoodLabel: commonMood,
        habitCompletionRate,
        totalHabits: habits.length,
        completedHabitLogs: habitLogs.length,
        plannerCompletionRate,
        averageMoodScore,
        smokeFreeDays,
        longestSmokeFreeStreak,
        workoutsCompleted,
        consistencyScore,
        recoveryRate: cravingResistanceRate,
        moodDirection,
        strongestMood: commonMood,
        resistedCravings,
        totalCravings,
        cravingResistanceRate,
        topTrigger,
        topTimeWindow,
        averageCravingIntensity: cravings.length === 0 ? null : Number(averageCravingIntensity.toFixed(1)),
        reminderEffectivenessRate,
      },
      streaks: {
        currentHabitStreak,
        longestHabitStreak,
        moodCheckInStreak,
      },
      habitTrend: completionByDay,
      moodTrend,
      cravingTrend,
      cravingTriggerCounts: triggerCounts.slice(0, 6),
      cravingTimePattern: timeOfDayPattern,
      habitScores: {
        strongest: strongestHabits,
        weakest: weakestHabits,
      },
      habitAnalytics: {
        activeHabits: habits.length,
        completionRate: habitCompletionRate,
        strongestHabit: strongestHabits[0]?.name ?? null,
        weakestHabit: weakestHabits[0]?.name ?? null,
        mostMissedHabit: mostMissedHabit?.name ?? null,
        dailyTrend: completionByDay,
      },
      moodAnalytics: {
        mostCommonMood: commonMood,
        averageEnergy,
        averageStress,
        averageMotivation,
        recentSummary: moodDirection,
        trend: moods.map((entry) => ({
          date: entry.date.toISOString(),
          moodLabel: formatMoodLabel(entry.moodLabel),
          energy: entry.energy ?? null,
          stress: entry.stress ?? null,
          motivation: entry.motivation ?? null,
        })),
      },
      quitSupportAnalytics: {
        totalCravings,
        resistedCount: resistedCravings,
        notResistedCount,
        smokeFreeDays,
        longestSmokeFreeStreak,
        mostCommonTrigger: topTrigger,
        triggerCounts,
        timeBuckets: timeOfDayPattern.map((entry) => ({
          bucket: entry.label[0].toUpperCase() + entry.label.slice(1),
          count: entry.count,
        })),
        comebackSummary:
          notResistedCount > 0
            ? `Recent relapses are clustering around ${topTimeWindow ?? 'one part of the day'}.`
            : 'No relapse has been logged in this range.',
      },
      plannerAnalytics: {
        completionRate: plannerCompletionRate,
        mostSkippedBlock: mostSkippedBlock ? formatPlannerPeriod(mostSkippedBlock as PlannerPeriod) : null,
        mostCompletedBlock: mostCompletedBlock ? formatPlannerPeriod(mostCompletedBlock as PlannerPeriod) : null,
        pendingTasks: plannerItems.length - plannerCompleted,
        carryForwardCount,
        completedAfterRolloverCount,
      },
      reminderAnalytics: {
        sentCount: reminderSentCount,
        missedCount: reminderMissedCount,
        actedOnCount: reminderActedOnCount,
        effectivenessRate: reminderEffectivenessRate,
      },
      weeklyReview: {
        bestDay,
        hardestDay,
        biggestWin:
          strongestHabits[0] != null
            ? `${strongestHabits[0].name} is leading at ${strongestHabits[0].completionRate}% completion.`
            : 'No habit win is available yet.',
        biggestStruggle:
          topTrigger != null
            ? `${topTrigger} is the biggest recurring trigger right now.`
            : mostMissedHabit != null
              ? `${mostMissedHabit.name} is being missed most often.`
              : 'No single struggle stands out yet.',
        nextFocus:
          carryForwardCount > 0
            ? `Reduce rollover by protecting your ${formatPlannerPeriod((mostSkippedBlock as PlannerPeriod) ?? PlannerPeriod.EVENING)} block with fewer tasks.`
            : mostSkippedBlock != null
            ? `Protect your ${formatPlannerPeriod(mostSkippedBlock as PlannerPeriod)} block with smaller tasks and one anchor habit.`
            : 'Keep logging habit, mood, and planner data to unlock a clearer next focus.',
      },
      insights: [
        {
          tone: weeklyHabitCompletionRate >= 65 ? 'emerald' : 'blue',
          title: 'Habit consistency',
          message:
            habits.length === 0
              ? 'Add active habits to unlock completion analytics.'
              : `You completed ${weeklyHabitCompletionRate}% of planned habits this week.`,
        },
        {
          tone: currentHabitStreak >= 3 ? 'violet' : 'blue',
          title: 'Streak momentum',
          message: `You are on a ${currentHabitStreak}-day streak, with a best run of ${longestHabitStreak} days.`,
        },
        {
          tone: moodDirection === 'improving' ? 'emerald' : moodDirection === 'declining' ? 'yellow' : 'blue',
          title: 'Mood trend',
          message:
            averageMoodScore == null
              ? 'Log mood check-ins consistently to reveal a trend.'
              : `Mood is ${moodDirection} overall, averaging ${averageMoodScore}/10 with ${commonMood ?? 'mixed'} showing up most often.`,
        },
        {
          tone: triggerCounts.length > 0 ? 'yellow' : 'blue',
          title: 'Craving trigger pattern',
          message:
            triggerCounts.length === 0
              ? 'No craving triggers have been logged recently.'
              : `${topTrigger} is your most common trigger, and ${topTimeWindow ?? 'the day'} is the busiest craving window.`,
        },
        {
          tone: weeklyPlannerCompletionRate >= 60 ? 'emerald' : 'violet',
          title: 'Planner follow-through',
          message:
            weeklyPlanItems.length === 0
              ? 'No planner items were tracked this week.'
              : `Planner completion is ${weeklyPlannerCompletionRate}% for the week, so your next lift is keeping scheduled tasks realistic.`,
        },
      ],
    });
  }),
);
