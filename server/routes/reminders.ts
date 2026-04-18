import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { markReminderEventsDismissed } from '../services/reminder-event-service.js';
import { getReminderData } from '../services/reminder-service.js';
import { reminderScheduleSchema, reminderScheduleUpdateSchema } from '../validators/reminders.js';

export const remindersRouter = Router();

remindersRouter.use(authenticate);

remindersRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const data = await getReminderData(request.auth!.userId);
    response.json(data);
  }),
);

remindersRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = reminderScheduleSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid reminder payload', parsed.error.flatten());
    }

    if (parsed.data.habitId) {
      const habit = await prisma.habit.findFirst({
        where: {
          id: parsed.data.habitId,
          userId: request.auth!.userId,
          isActive: true,
        },
      });

      if (!habit) {
        throw new HttpError(404, 'Habit not found');
      }
    }

    await prisma.reminderSchedule.create({
      data: {
        userId: request.auth!.userId,
        habitId: parsed.data.habitId ?? null,
        type: parsed.data.type,
        title: parsed.data.title,
        message: parsed.data.message || null,
        time: parsed.data.time,
        enabled: true,
      },
    });

    response.status(201).json(await getReminderData(request.auth!.userId));
  }),
);

remindersRouter.patch(
  '/:id',
  asyncHandler(async (request, response) => {
    const parsed = reminderScheduleUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid reminder update payload', parsed.error.flatten());
    }

    const schedule = await prisma.reminderSchedule.findFirst({
      where: {
        id: String(request.params.id),
        userId: request.auth!.userId,
      },
    });

    if (!schedule) {
      throw new HttpError(404, 'Reminder schedule not found');
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.reminderSchedule.update({
        where: { id: schedule.id },
        data: {
          ...(parsed.data.enabled !== undefined ? { enabled: parsed.data.enabled } : {}),
          ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
          ...(parsed.data.message !== undefined ? { message: parsed.data.message || null } : {}),
          ...(parsed.data.time !== undefined ? { time: parsed.data.time } : {}),
        },
      });

      if (parsed.data.enabled === false) {
        await markReminderEventsDismissed(transaction, {
          userId: request.auth!.userId,
          scheduleId: schedule.id,
        });
      }
    });

    response.json(await getReminderData(request.auth!.userId));
  }),
);
