import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { cravingSchema } from '../validators/cravings.js';
import { formatCravingOutcome, parseCravingOutcome } from '../lib/domain.js';
import { markReminderEventsActedOn } from '../services/reminder-event-service.js';
import { syncQuitSupportFromCraving } from '../services/quit-support-service.js';

export const cravingsRouter = Router();

cravingsRouter.use(authenticate);

cravingsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const logs = await prisma.cravingLog.findMany({
      where: { userId: request.auth!.userId },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    });

    response.json({
      logs: logs.map((log) => ({
        id: log.id,
        habitType: log.habitType,
        trigger: log.trigger,
        intensity: log.intensity,
        outcome: formatCravingOutcome(log.outcome),
        notes: log.notes,
        occurredAt: log.occurredAt,
      })),
    });
  }),
);

cravingsRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = cravingSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid craving payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const outcome = parseCravingOutcome(parsed.data.outcome, parsed.data.resisted);
    const log = await prisma.$transaction(async (transaction) => {
      const createdLog = await transaction.cravingLog.create({
        data: {
          userId,
          habitType: parsed.data.habitType,
          trigger: parsed.data.trigger,
          intensity: parsed.data.intensity,
          outcome,
          notes: parsed.data.notes,
        },
      });

      await syncQuitSupportFromCraving(transaction, {
        userId,
        cravingLogId: createdLog.id,
        habitType: createdLog.habitType,
        outcome: createdLog.outcome,
        occurredAt: createdLog.occurredAt,
        trigger: createdLog.trigger,
        intensity: createdLog.intensity,
        notes: createdLog.notes,
      });

      await markReminderEventsActedOn(transaction, {
        userId,
        type: 'quit-support',
        actedAt: createdLog.occurredAt,
      });

      return createdLog;
    });

    response.status(201).json({
      log: {
        id: log.id,
        habitType: log.habitType,
        trigger: log.trigger,
        intensity: log.intensity,
        outcome: formatCravingOutcome(log.outcome),
        notes: log.notes,
        occurredAt: log.occurredAt,
      },
      supportMessage:
        log.outcome === 'RELAPSED'
          ? 'A relapse is data, not defeat. Reset the next hour and stay in the process.'
          : 'You got through that urge. Build on the win with one small healthy action now.',
    });
  }),
);
