import {
  CravingOutcome,
  type DailyPlanItem,
  MoodLabel,
  PlannerPeriod,
  TaskStatus,
} from '@prisma/client';
import { format } from 'date-fns';
import {
  formatCravingOutcome,
  formatHabitCategory,
  formatHabitDifficulty,
  formatMoodLabel,
  formatPlannerMode,
  formatPlannerPeriod,
  formatQuoteCategory,
} from '../lib/domain.js';
import { getDateKey, getDateRange, getGreeting, getWeekDateKeys } from '../lib/dates.js';
import { prisma } from '../lib/prisma.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { getCurrentQuitStreakDays } from './quit-support-service.js';
import { getQuoteCategoryForMood, getRotatingQuote } from './quote-service.js';

type DashboardInsightTone = 'success' | 'info' | 'warning';
type DashboardInsightConfidence = 'emerging' | 'medium' | 'high';

function scoreToLabel(score?: number | null) {
  if (score == null) return 'Unknown';
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

function parseStoredGoals(goals: string | null | undefined) {
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

function moodToEmoji(mood?: MoodLabel | null) {
  switch (mood) {
    case MoodLabel.HAPPY:
      return '😊';
    case MoodLabel.CALM:
      return '😌';
    case MoodLabel.MOTIVATED:
      return '💪';
    case MoodLabel.NEUTRAL:
      return '😐';
    case MoodLabel.TIRED:
      return '😴';
    case MoodLabel.STRESSED:
      return '😰';
    case MoodLabel.ANXIOUS:
      return '😟';
    case MoodLabel.SAD:
      return '😢';
    case MoodLabel.FRUSTRATED:
      return '😤';
    case MoodLabel.OVERWHELMED:
      return '😵';
    default:
      return '✨';
  }
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getMoodCluster(moodLabel: MoodLabel) {
  switch (moodLabel) {
    case MoodLabel.HAPPY:
    case MoodLabel.CALM:
    case MoodLabel.MOTIVATED:
      return 'positive';
    case MoodLabel.STRESSED:
    case MoodLabel.ANXIOUS:
    case MoodLabel.SAD:
    case MoodLabel.FRUSTRATED:
    case MoodLabel.OVERWHELMED:
    case MoodLabel.TIRED:
      return 'challenging';
    default:
      return 'neutral';
  }
}

function getTimeWindow(date: Date) {
  const hour = date.getHours();

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function buildFocusSentence(params: {
  remainingHabits: number;
  cravingsToday: number;
  plannerItems: DailyPlanItem[];
  latestMood?: MoodLabel | null;
}) {
  if (params.cravingsToday > 0) {
    return 'Protect your momentum by planning ahead for your known triggers tonight.';
  }

  if (params.remainingHabits > 0) {
    return `Protect your momentum with ${params.remainingHabits} small wins still left today.`;
  }

  if (params.plannerItems.some((item) => item.status === TaskStatus.PENDING)) {
    return 'Focus on your next planned task and keep the day moving forward.';
  }

  if (params.latestMood === MoodLabel.TIRED) {
    return 'Keep today light and consistent. Recovery is still progress.';
  }

  return 'Protect your momentum with small consistent wins.';
}

function getTopTrigger(triggers: Array<string | null>) {
  const counts = new Map<string, number>();

  for (const trigger of triggers) {
    if (!trigger) continue;
    counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function createInsight(params: {
  id: string;
  category: 'mood_habits' | 'cravings' | 'productivity';
  tone: DashboardInsightTone;
  title: string;
  summary: string;
  metric: string;
  confidence: DashboardInsightConfidence;
}) {
  return params;
}

function buildMoodHabitInsight(params: {
  habitsCount: number;
  moodLogs: Array<{ date: Date; moodLabel: MoodLabel }>;
  habitLogs: Array<{ dateKey: string; habitId: string; completed: boolean }>;
}) {
  const { habitsCount, moodLogs, habitLogs } = params;

  if (habitsCount === 0) {
    return createInsight({
      id: 'mood-habits',
      category: 'mood_habits',
      tone: 'info',
      title: 'Mood and habits',
      summary: 'Add a few active habits to reveal how your mood affects routine follow-through.',
      metric: `${moodLogs.length} mood logs`,
      confidence: 'emerging',
    });
  }

  if (moodLogs.length === 0) {
    return createInsight({
      id: 'mood-habits',
      category: 'mood_habits',
      tone: 'info',
      title: 'Mood and habits',
      summary: 'Start logging mood check-ins to uncover which emotional states help your habits stick.',
      metric: `${habitsCount} active habits`,
      confidence: 'emerging',
    });
  }

  const completionsByDate = new Map<string, Set<string>>();

  for (const log of habitLogs) {
    if (!log.completed) continue;

    const existing = completionsByDate.get(log.dateKey) ?? new Set<string>();
    existing.add(log.habitId);
    completionsByDate.set(log.dateKey, existing);
  }

  const dailyMoodPerformance = moodLogs.map((entry) => {
    const dateKey = getDateKey(entry.date);
    const completedCount = completionsByDate.get(dateKey)?.size ?? 0;
    const completionRate = Math.round((completedCount / habitsCount) * 100);

    return {
      label: entry.moodLabel,
      cluster: getMoodCluster(entry.moodLabel),
      completionRate,
    };
  });

  const positiveRates = dailyMoodPerformance
    .filter((entry) => entry.cluster === 'positive')
    .map((entry) => entry.completionRate);
  const challengingRates = dailyMoodPerformance
    .filter((entry) => entry.cluster === 'challenging')
    .map((entry) => entry.completionRate);

  if (positiveRates.length > 0 && challengingRates.length > 0) {
    const positiveAverage = average(positiveRates);
    const challengingAverage = average(challengingRates);
    const delta = positiveAverage - challengingAverage;

    if (Math.abs(delta) < 8) {
      const steadyAverage = average(dailyMoodPerformance.map((entry) => entry.completionRate));

      return createInsight({
        id: 'mood-habits',
        category: 'mood_habits',
        tone: 'info',
        title: 'Mood and habits',
        summary: `Your habit consistency stays fairly steady across moods, hovering around ${steadyAverage}% completion.`,
        metric: `${steadyAverage}% steady`,
        confidence: 'medium',
      });
    }

    if (delta > 0) {
      return createInsight({
        id: 'mood-habits',
        category: 'mood_habits',
        tone: 'success',
        title: 'Mood and habits',
        summary: `On calm or motivated days, you complete about ${positiveAverage}% of habits versus ${challengingAverage}% on tougher days.`,
        metric: `+${delta} pts`,
        confidence: 'high',
      });
    }

    return createInsight({
      id: 'mood-habits',
      category: 'mood_habits',
      tone: 'warning',
      title: 'Mood and habits',
      summary: `Recent data shows habits slipping on calmer days too, with ${positiveAverage}% completion versus ${challengingAverage}% on difficult days.`,
      metric: `${delta} pts`,
      confidence: 'medium',
    });
  }

  const bestMood = dailyMoodPerformance.reduce<{ label: MoodLabel; completionRate: number } | null>((best, entry) => {
    if (!best || entry.completionRate > best.completionRate) {
      return { label: entry.label, completionRate: entry.completionRate };
    }

    return best;
  }, null);

  return createInsight({
    id: 'mood-habits',
    category: 'mood_habits',
    tone: 'info',
    title: 'Mood and habits',
    summary: `${formatMoodLabel(bestMood?.label ?? MoodLabel.NEUTRAL)} check-ins currently align with your strongest habit follow-through.`,
    metric: `${bestMood?.completionRate ?? 0}% completion`,
    confidence: dailyMoodPerformance.length >= 4 ? 'medium' : 'emerging',
  });
}

function buildCravingInsight(
  cravingLogs: Array<{
    trigger: string | null;
    outcome: CravingOutcome;
    intensity: number | null;
    occurredAt: Date;
  }>,
) {
  if (cravingLogs.length === 0) {
    return createInsight({
      id: 'craving-patterns',
      category: 'cravings',
      tone: 'success',
      title: 'Craving patterns',
      summary: 'No recent cravings are logged. Keep tracking urges when they happen so trigger windows stay visible early.',
      metric: '0 recent logs',
      confidence: 'emerging',
    });
  }

  const resistedCount = cravingLogs.filter((log) => log.outcome === CravingOutcome.RESISTED).length;
  const resistanceRate = Math.round((resistedCount / cravingLogs.length) * 100);
  const averageIntensity = average(
    cravingLogs.map((log) => log.intensity).filter((value): value is number => value != null),
  );
  const topTrigger = getTopTrigger(cravingLogs.map((log) => log.trigger));
  const timeWindowCounts = new Map<string, number>();

  for (const log of cravingLogs) {
    const timeWindow = getTimeWindow(log.occurredAt);
    timeWindowCounts.set(timeWindow, (timeWindowCounts.get(timeWindow) ?? 0) + 1);
  }

  const busiestWindow = Array.from(timeWindowCounts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0];

  let summary = `You resisted ${resistanceRate}% of recent cravings.`;

  if (busiestWindow && topTrigger) {
    summary = `Cravings cluster most in the ${busiestWindow} and are often linked to ${topTrigger}. You resisted ${resistanceRate}% of recent urges.`;
  } else if (busiestWindow) {
    summary = `Cravings cluster most in the ${busiestWindow}. You resisted ${resistanceRate}% of recent urges.`;
  } else if (topTrigger) {
    summary = `The most common trigger lately is ${topTrigger}. You resisted ${resistanceRate}% of recent urges.`;
  }

  if (averageIntensity >= 7) {
    summary += ` Average intensity is running high at ${averageIntensity}/10, so a fast fallback plan would help.`;
  }

  return createInsight({
    id: 'craving-patterns',
    category: 'cravings',
    tone: resistanceRate >= 70 ? 'success' : resistanceRate >= 45 ? 'info' : 'warning',
    title: 'Craving patterns',
    summary,
    metric: busiestWindow ? `${busiestWindow} hotspot` : `${resistanceRate}% resisted`,
    confidence: cravingLogs.length >= 5 ? 'high' : 'medium',
  });
}

function buildProductivityInsight(params: {
  plannerDays: Array<{
    dateKey: string;
    items: Array<{
      period: PlannerPeriod;
      status: TaskStatus;
    }>;
  }>;
  habitLogs: Array<{ dateKey: string; habitId: string; completed: boolean }>;
}) {
  const allItems = params.plannerDays.flatMap((day) =>
    day.items.map((item) => ({
      ...item,
      dateKey: day.dateKey,
    })),
  );

  if (allItems.length === 0) {
    return createInsight({
      id: 'productivity-patterns',
      category: 'productivity',
      tone: 'info',
      title: 'Productivity patterns',
      summary: 'Add a few planner sessions to surface which parts of the day are your most reliable for deep work.',
      metric: 'No planner history',
      confidence: 'emerging',
    });
  }

  const periodStats = new Map<PlannerPeriod, { completed: number; total: number }>();

  for (const item of allItems) {
    const existing = periodStats.get(item.period) ?? { completed: 0, total: 0 };
    existing.total += 1;

    if (item.status === TaskStatus.COMPLETED) {
      existing.completed += 1;
    }

    periodStats.set(item.period, existing);
  }

  const rankedPeriods = Array.from(periodStats.entries())
    .map(([period, stats]) => ({
      period,
      total: stats.total,
      completionRate: Math.round((stats.completed / stats.total) * 100),
    }))
    .sort((left, right) => right.completionRate - left.completionRate || right.total - left.total);

  const strongestPeriod = rankedPeriods[0];
  const habitCompletionsByDate = new Map<string, number>();

  for (const log of params.habitLogs) {
    if (!log.completed) continue;
    habitCompletionsByDate.set(log.dateKey, (habitCompletionsByDate.get(log.dateKey) ?? 0) + 1);
  }

  const strongPlannerDays: number[] = [];
  const slowerPlannerDays: number[] = [];

  for (const day of params.plannerDays) {
    if (day.items.length === 0) continue;

    const completed = day.items.filter((item) => item.status === TaskStatus.COMPLETED).length;
    const completionRate = completed / day.items.length;
    const habitCount = habitCompletionsByDate.get(day.dateKey) ?? 0;

    if (completionRate >= 0.6) {
      strongPlannerDays.push(habitCount);
    } else {
      slowerPlannerDays.push(habitCount);
    }
  }

  if (strongestPeriod && strongPlannerDays.length > 0 && slowerPlannerDays.length > 0) {
    const strongHabitAverage = average(strongPlannerDays);
    const slowerHabitAverage = average(slowerPlannerDays);

    return createInsight({
      id: 'productivity-patterns',
      category: 'productivity',
      tone: strongestPeriod.completionRate >= 65 ? 'success' : 'info',
      title: 'Productivity patterns',
      summary: `Your ${formatPlannerPeriod(strongestPeriod.period)} block is strongest at ${strongestPeriod.completionRate}% task completion. On stronger planning days, you also finish about ${strongHabitAverage} habits versus ${slowerHabitAverage} on lighter days.`,
      metric: `${strongestPeriod.completionRate}% ${formatPlannerPeriod(strongestPeriod.period)}`,
      confidence: params.plannerDays.length >= 4 ? 'high' : 'medium',
    });
  }

  return createInsight({
    id: 'productivity-patterns',
    category: 'productivity',
    tone: strongestPeriod?.completionRate >= 65 ? 'success' : 'info',
    title: 'Productivity patterns',
    summary: `Your ${formatPlannerPeriod(strongestPeriod?.period ?? PlannerPeriod.MORNING)} window is currently the most reliable for task completion.`,
    metric: `${strongestPeriod?.completionRate ?? 0}% complete`,
    confidence: rankedPeriods.length >= 2 ? 'medium' : 'emerging',
  });
}

export async function getDashboardData(userId: string) {
  const todayKey = getDateKey();
  const { start } = getDateRange(7);
  const { start: insightStart } = getDateRange(14);
  const insightStartKey = getDateKey(insightStart);

  const [
    user,
    profile,
    quitProfile,
    habits,
    todayHabitLogs,
    weekHabitLogs,
    latestMood,
    weekMoods,
    recentCravings,
    plan,
    journalCount,
    insightHabitLogs,
    insightMoods,
    recentPlans,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.quitProfile.findUnique({ where: { userId } }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.habitLog.findMany({
      where: { userId, dateKey: todayKey, completed: true },
    }),
    prisma.habitLog.findMany({
      where: {
        userId,
        completed: true,
        createdAt: { gte: start },
      },
    }),
    prisma.moodLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    }),
    prisma.moodLog.findMany({
      where: { userId, date: { gte: start } },
      orderBy: { date: 'asc' },
    }),
    prisma.cravingLog.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    }),
    prisma.dailyPlan.findUnique({
      where: {
        userId_dateKey: {
          userId,
          dateKey: todayKey,
        },
      },
      include: { items: true },
    }),
    prisma.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: start },
      },
    }),
    prisma.habitLog.findMany({
      where: {
        userId,
        createdAt: { gte: insightStart },
      },
      select: {
        dateKey: true,
        habitId: true,
        completed: true,
      },
    }),
    prisma.moodLog.findMany({
      where: { userId, date: { gte: insightStart } },
      select: {
        date: true,
        moodLabel: true,
      },
      orderBy: { date: 'asc' },
    }),
    prisma.dailyPlan.findMany({
      where: {
        userId,
        dateKey: { gte: insightStartKey, lte: todayKey },
      },
      include: {
        items: {
          select: {
            period: true,
            status: true,
          },
        },
      },
      orderBy: { dateKey: 'asc' },
    }),
  ]);

  const completedHabitIds = new Set(todayHabitLogs.map((log) => log.habitId));
  const completionPercentage = habits.length === 0 ? 0 : Math.round((completedHabitIds.size / habits.length) * 100);
  const remainingHabits = Math.max(habits.length - completedHabitIds.size, 0);
  const recentCravingTodayCount = recentCravings.filter((log) => getDateKey(log.occurredAt) === todayKey).length;

  const activityDateKeys = [
    ...weekHabitLogs.map((log) => log.dateKey),
    ...weekMoods.map((log) => getDateKey(log.date)),
    ...recentCravings
      .filter((log) => log.outcome === CravingOutcome.RESISTED)
      .map((log) => getDateKey(log.occurredAt)),
  ];
  const streakDays = calculateDateKeyStreak(activityDateKeys);
  const smokeFreeDays = getCurrentQuitStreakDays(quitProfile);
  const topTrigger = getTopTrigger(recentCravings.map((log) => log.trigger));
  const plannerItems = plan?.items ?? [];
  const upcomingTasks = plannerItems
    .filter((item) => item.status === TaskStatus.PENDING)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      period: formatPlannerPeriod(item.period),
      status: item.status.toLowerCase(),
      time: item.scheduledTime ?? null,
      energyLevel: item.energyLevel.toLowerCase(),
    }));

  const quote = await getRotatingQuote({
    category: getQuoteCategoryForMood(latestMood?.moodLabel),
  });

  const goals =
    plannerItems.length > 0
      ? plannerItems.slice(0, 5).map((item) => ({
          id: item.id,
          label: item.title,
          done: item.status === TaskStatus.COMPLETED,
        }))
      : habits.slice(0, 5).map((habit) => ({
          id: habit.id,
          label: habit.name,
          done: completedHabitIds.has(habit.id),
        }));

  const alerts = [
    remainingHabits > 0
      ? {
          id: 'remaining-habits',
          tone: 'warning',
          message: `${remainingHabits} habits still need your attention today.`,
        }
      : null,
    topTrigger
      ? {
          id: 'top-trigger',
          tone: 'info',
          message: `Most common trigger lately: ${topTrigger}. Plan ahead for it.`,
        }
      : null,
    streakDays > 0
      ? {
          id: 'streak',
          tone: 'success',
          message: `You're building a ${streakDays}-day engagement streak.`,
        }
      : null,
  ].filter((alert): alert is { id: string; tone: string; message: string } => alert !== null);

  const insights = [
    buildMoodHabitInsight({
      habitsCount: habits.length,
      moodLogs: insightMoods,
      habitLogs: insightHabitLogs,
    }),
    buildCravingInsight(recentCravings.filter((entry) => entry.occurredAt >= insightStart)),
    buildProductivityInsight({
      plannerDays: recentPlans,
      habitLogs: insightHabitLogs,
    }),
  ];

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
    },
    profile: {
      coachPersonality: profile?.aiStyle ?? null,
      goals: parseStoredGoals(profile?.goals),
    },
    greeting: getGreeting(),
    dateLabel: format(new Date(), 'EEEE, MMMM d'),
    streakDays,
    focusSentence: buildFocusSentence({
      remainingHabits,
      cravingsToday: recentCravingTodayCount,
      plannerItems,
      latestMood: latestMood?.moodLabel,
    }),
    quote: quote
      ? {
          id: quote.id,
          content: quote.content,
          author: quote.author,
          category: formatQuoteCategory(quote.category),
          nextRefreshInSeconds: 300,
        }
      : null,
    goals,
    habits: {
      completedCount: completedHabitIds.size,
      totalCount: habits.length,
      completionPercentage,
      remainingCount: remainingHabits,
    },
    mood: latestMood
      ? {
          label: formatMoodLabel(latestMood.moodLabel),
          emoji: moodToEmoji(latestMood.moodLabel),
          energyLabel: scoreToLabel(latestMood.energy),
          stressLabel: scoreToLabel(latestMood.stress),
          focusLabel: scoreToLabel(latestMood.focus),
          checkedInAt: latestMood.date,
        }
      : null,
    quitSupport: {
      smokeFreeDays,
      cravingsToday: recentCravingTodayCount,
      topTrigger,
      recentOutcomes: recentCravings.slice(0, 5).map((log) => ({
        id: log.id,
        outcome: formatCravingOutcome(log.outcome),
        trigger: log.trigger,
        intensity: log.intensity,
        occurredAt: log.occurredAt,
      })),
    },
    planner: {
      mode: plan ? formatPlannerMode(plan.mode) : 'normal',
      completedCount: plannerItems.filter((item) => item.status === TaskStatus.COMPLETED).length,
      totalCount: plannerItems.length,
      upcomingTasks,
    },
    stats: {
      moodCheckIns: weekMoods.length,
      journalEntries: journalCount,
      resistedCravings: recentCravings.filter((log) => log.outcome === CravingOutcome.RESISTED).length,
      plannerCompletion: plannerItems.length
        ? Math.round(
            (plannerItems.filter((item) => item.status === TaskStatus.COMPLETED).length / plannerItems.length) * 100,
          )
        : 0,
      strongestHabitCategory: habits[0] ? formatHabitCategory(habits[0].category) : 'none',
      currentMood: latestMood ? formatMoodLabel(latestMood.moodLabel) : 'unknown',
      habitDifficultyMix: habits[0] ? formatHabitDifficulty(habits[0].difficulty) : 'medium',
    },
    insights,
    alerts,
    week: getWeekDateKeys().map((day) => ({
      label: day.label,
      completed: weekHabitLogs.some((log) => log.dateKey === day.dateKey),
    })),
  };
}
