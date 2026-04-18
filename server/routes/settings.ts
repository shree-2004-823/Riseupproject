import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { serializeRoutine } from '../lib/profile.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { settingsUpdateSchema } from '../validators/settings.js';

export const settingsRouter = Router();

settingsRouter.use(authenticate);

const reminderDefaults = {
  workout: { title: 'Workout reminder', time: '08:00' },
  hydration: { title: 'Hydration reminder', time: '11:00' },
  'mood-check': { title: 'Mood check reminder', time: '18:00' },
  journal: { title: 'Journal reminder', time: '20:30' },
  'quit-support': { title: 'Quit support reminder', time: '17:00' },
  sleep: { title: 'Sleep reminder', time: '22:00' },
} as const;

type ReminderType = keyof typeof reminderDefaults;

async function buildSettingsResponse(userId: string) {
  const [profile, schedules] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.reminderSchedule.findMany({
      where: {
        userId,
        habitId: null,
        type: {
          in: Object.keys(reminderDefaults),
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return {
    settings: {
      coachPersonality: profile?.aiStyle ?? '',
      routine: serializeRoutine(profile),
      reminderSettings: (Object.keys(reminderDefaults) as ReminderType[]).map((type) => {
        const existing = schedules.find((schedule) => schedule.type === type);
        return {
          type,
          title: reminderDefaults[type].title,
          enabled: existing?.enabled ?? false,
          time: existing?.time ?? reminderDefaults[type].time,
        };
      }),
    },
  };
}

settingsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    response.json(await buildSettingsResponse(request.auth!.userId));
  }),
);

settingsRouter.patch(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = settingsUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid settings payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const data = parsed.data;

    await prisma.$transaction(async (transaction) => {
      if (data.coachPersonality !== undefined || data.routine !== undefined) {
        const existingProfile = await transaction.userProfile.findUnique({
          where: { userId },
        });

        await transaction.userProfile.upsert({
          where: { userId },
          update: {
            aiStyle: data.coachPersonality !== undefined ? data.coachPersonality : existingProfile?.aiStyle,
            wakeTime: data.routine?.wakeTime ?? existingProfile?.wakeTime,
            sleepTime: data.routine?.sleepTime ?? existingProfile?.sleepTime,
            workoutTime: data.routine?.workoutTime ?? existingProfile?.workoutTime,
            reminderTime: data.routine?.reminderTime ?? existingProfile?.reminderTime,
          },
          create: {
            userId,
            aiStyle: data.coachPersonality ?? '',
            wakeTime: data.routine?.wakeTime ?? '07:00',
            sleepTime: data.routine?.sleepTime ?? '22:00',
            workoutTime: data.routine?.workoutTime ?? '08:00',
            reminderTime: data.routine?.reminderTime ?? '20:00',
          },
        });
      }

      for (const reminderSetting of data.reminderSettings ?? []) {
        const existing = await transaction.reminderSchedule.findFirst({
          where: {
            userId,
            habitId: null,
            type: reminderSetting.type,
          },
          orderBy: { createdAt: 'asc' },
        });

        if (existing) {
          await transaction.reminderSchedule.updateMany({
            where: {
              userId,
              habitId: null,
              type: reminderSetting.type,
            },
            data: {
              enabled: reminderSetting.enabled,
              time: reminderSetting.time,
              title: reminderDefaults[reminderSetting.type].title,
            },
          });
          continue;
        }

        await transaction.reminderSchedule.create({
          data: {
            userId,
            type: reminderSetting.type,
            title: reminderDefaults[reminderSetting.type].title,
            time: reminderSetting.time,
            enabled: reminderSetting.enabled,
          },
        });
      }
    });

    response.json(await buildSettingsResponse(userId));
  }),
);
