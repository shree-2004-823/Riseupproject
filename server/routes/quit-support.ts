import { CravingOutcome } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler } from '../lib/http.js';
import { getDateKey } from '../lib/dates.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { formatCravingOutcome } from '../lib/domain.js';
import { getCurrentQuitStreakDays, getLongestQuitStreakDays } from '../services/quit-support-service.js';

export const quitSupportRouter = Router();

quitSupportRouter.use(authenticate);

function parseReasonsToQuit(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

quitSupportRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const [profile, logs] = await Promise.all([
      prisma.quitProfile.findUnique({ where: { userId } }),
      prisma.cravingLog.findMany({
        where: {
          userId,
          habitType: 'smoking',
        },
        orderBy: { occurredAt: 'desc' },
        take: 30,
      }),
    ]);

    const todayKey = getDateKey();
    const cravingsToday = logs.filter((log) => getDateKey(log.occurredAt) === todayKey).length;
    const urgesResistedToday = logs.filter(
      (log) => getDateKey(log.occurredAt) === todayKey && log.outcome === CravingOutcome.RESISTED,
    ).length;
    const smokeFreeDays = getCurrentQuitStreakDays(profile);
    const longestSmokeFreeStreak = getLongestQuitStreakDays(profile);
    const triggerCounts = logs
      .map((log) => log.trigger)
      .filter((trigger): trigger is string => Boolean(trigger))
      .reduce<Record<string, number>>((accumulator, trigger) => {
        accumulator[trigger] = (accumulator[trigger] ?? 0) + 1;
        return accumulator;
      }, {});
    const topTrigger =
      Object.entries(triggerCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

    response.json({
      currentSmokeFreeStreak: smokeFreeDays,
      longestSmokeFreeStreak,
      cravingsToday,
      urgesResistedToday,
      moneySaved: smokeFreeDays * 10,
      topTrigger,
      reasonsToQuit: parseReasonsToQuit(profile?.reasonsToQuit),
      quitStartedAt: profile?.quitStartedAt ?? null,
      supportUses: profile?.emergencySupportUses ?? 0,
      recentLogs: logs.map((log) => ({
        id: log.id,
        trigger: log.trigger,
        intensity: log.intensity,
        outcome: formatCravingOutcome(log.outcome),
        occurredAt: log.occurredAt,
      })),
    });
  }),
);
