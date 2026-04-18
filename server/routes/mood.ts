import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { markReminderEventsActedOn } from '../services/reminder-event-service.js';
import { moodSchema } from '../validators/mood.js';
import { formatMoodLabel, parseMoodLabel } from '../lib/domain.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { getDateKey } from '../lib/dates.js';

export const moodRouter = Router();

moodRouter.use(authenticate);

function moodSupportMessage(moodLabel: string, energy?: number, stress?: number) {
  if (moodLabel === 'stressed' || moodLabel === 'anxious') {
    return 'Take one calming action next: step away, breathe, and lower the pressure on the next hour.';
  }

  if ((energy ?? 0) >= 70 && (stress ?? 0) <= 40) {
    return 'You have strong energy today. Protect it by anchoring one important habit and one recovery habit.';
  }

  return 'Notice the pattern, not just the feeling. Small supportive routines will help this mood pass well.';
}

moodRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = moodSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid mood payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const moodLog = await prisma.$transaction(async (transaction) => {
      const createdLog = await transaction.moodLog.create({
        data: {
          userId,
          moodLabel: parseMoodLabel(parsed.data.moodLabel),
          energy: parsed.data.energy,
          stress: parsed.data.stress,
          confidence: parsed.data.confidence,
          anxiety: parsed.data.anxiety,
          motivation: parsed.data.motivation,
          focus: parsed.data.focus,
          note: parsed.data.note,
        },
      });

      await markReminderEventsActedOn(transaction, {
        userId,
        type: 'mood-check',
        actedAt: createdLog.date,
      });

      return createdLog;
    });

    response.status(201).json({
      entry: {
        id: moodLog.id,
        moodLabel: formatMoodLabel(moodLog.moodLabel),
        energy: moodLog.energy,
        stress: moodLog.stress,
        confidence: moodLog.confidence,
        anxiety: moodLog.anxiety,
        motivation: moodLog.motivation,
        focus: moodLog.focus,
        note: moodLog.note,
        date: moodLog.date,
      },
      aiResponse: moodSupportMessage(formatMoodLabel(moodLog.moodLabel), moodLog.energy ?? undefined, moodLog.stress ?? undefined),
    });
  }),
);

moodRouter.get(
  '/history',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const entries = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const trend = entries
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        day: entry.date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood:
          ((entry.energy ?? 0) +
            (100 - (entry.stress ?? 50)) +
            (entry.motivation ?? 0) +
            (entry.focus ?? 0)) /
          40,
      }));

    const moodFrequency = entries.reduce<Record<string, number>>((accumulator, entry) => {
      const label = formatMoodLabel(entry.moodLabel);
      accumulator[label] = (accumulator[label] ?? 0) + 1;
      return accumulator;
    }, {});

    const mostCommonMood =
      Object.entries(moodFrequency).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'unknown';
    const streak = calculateDateKeyStreak(entries.map((entry) => getDateKey(entry.date)));
    const averageEnergy = entries.length
      ? entries.reduce((sum, entry) => sum + (entry.energy ?? 0), 0) / entries.length
      : 0;

    response.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        moodLabel: formatMoodLabel(entry.moodLabel),
        energy: entry.energy,
        stress: entry.stress,
        confidence: entry.confidence,
        anxiety: entry.anxiety,
        motivation: entry.motivation,
        focus: entry.focus,
        note: entry.note,
        date: entry.date,
      })),
      trend,
      summary: {
        mostCommonMood,
        checkInStreak: streak,
        averageEnergyLabel: averageEnergy >= 70 ? 'High' : averageEnergy >= 40 ? 'Moderate' : 'Low',
        patterns: [
          'Mood improves after consistent action',
          'Stress is easier to manage when you check in early',
          'Short reflections improve pattern awareness',
        ],
      },
    });
  }),
);
