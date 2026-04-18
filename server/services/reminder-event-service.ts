import { ReminderEventStatus, type Prisma } from '@prisma/client';
import { getDateFromKey, getDateKey } from '../lib/dates.js';

type PersistedGeneratedReminder = {
  externalKey: string;
  scheduleId?: string | null;
  habitId?: string | null;
  planItemId?: string | null;
  type: string;
  status: 'upcoming' | 'due' | 'missed';
  time: string;
};

function buildScheduledFor(dateKey: string, time: string) {
  const date = getDateFromKey(dateKey);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function mapGeneratedStatus(status: PersistedGeneratedReminder['status']) {
  if (status === 'missed') {
    return ReminderEventStatus.MISSED;
  }

  return ReminderEventStatus.SENT;
}

export async function persistGeneratedReminderEvents(
  transaction: Prisma.TransactionClient,
  userId: string,
  reminders: PersistedGeneratedReminder[],
  dateKey = getDateKey(),
) {
  if (reminders.length === 0) {
    return;
  }

  await Promise.all(
    reminders.map((reminder) =>
      transaction.reminderEvent.upsert({
        where: { externalKey: reminder.externalKey },
        update: {
          scheduleId: reminder.scheduleId ?? null,
          habitId: reminder.habitId ?? null,
          planItemId: reminder.planItemId ?? null,
          type: reminder.type,
          status: mapGeneratedStatus(reminder.status),
          scheduledFor: buildScheduledFor(dateKey, reminder.time),
          sentAt: reminder.status === 'missed' ? null : new Date(),
        },
        create: {
          externalKey: reminder.externalKey,
          userId,
          scheduleId: reminder.scheduleId ?? null,
          habitId: reminder.habitId ?? null,
          planItemId: reminder.planItemId ?? null,
          type: reminder.type,
          status: mapGeneratedStatus(reminder.status),
          scheduledFor: buildScheduledFor(dateKey, reminder.time),
          sentAt: reminder.status === 'missed' ? null : new Date(),
        },
      }),
    ),
  );
}

export async function markReminderEventsActedOn(
  transaction: Prisma.TransactionClient,
  params: {
    userId: string;
    dateKey?: string;
    type?: string;
    habitId?: string;
    planItemId?: string;
    actedAt?: Date;
  },
) {
  const dateKey = params.dateKey ?? getDateKey(params.actedAt ?? new Date());
  const dayStart = getDateFromKey(dateKey);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  await transaction.reminderEvent.updateMany({
    where: {
      userId: params.userId,
      scheduledFor: {
        gte: dayStart,
        lt: dayEnd,
      },
      status: {
        in: [ReminderEventStatus.GENERATED, ReminderEventStatus.SENT, ReminderEventStatus.MISSED],
      },
      ...(params.type ? { type: params.type } : {}),
      ...(params.habitId ? { habitId: params.habitId } : {}),
      ...(params.planItemId ? { planItemId: params.planItemId } : {}),
    },
    data: {
      status: ReminderEventStatus.ACTED_ON,
      actedAt: params.actedAt ?? new Date(),
    },
  });
}

export async function markReminderEventsDismissed(
  transaction: Prisma.TransactionClient,
  params: {
    userId: string;
    scheduleId: string;
    dismissedAt?: Date;
  },
) {
  const dismissedAt = params.dismissedAt ?? new Date();
  const dateKey = getDateKey(dismissedAt);
  const dayStart = getDateFromKey(dateKey);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  await transaction.reminderEvent.updateMany({
    where: {
      userId: params.userId,
      scheduleId: params.scheduleId,
      scheduledFor: {
        gte: dayStart,
        lt: dayEnd,
      },
      status: {
        in: [ReminderEventStatus.GENERATED, ReminderEventStatus.SENT],
      },
    },
    data: {
      status: ReminderEventStatus.DISMISSED,
      dismissedAt,
    },
  });
}
