import { TaskStatus } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  formatEnergyLevel,
  formatPlannerMode,
  formatPlannerPeriod,
  formatTaskStatus,
  parseEnergyLevel,
  parsePlannerMode,
  parsePlannerPeriod,
  parseTaskStatus,
} from '../lib/domain.js';
import {
  plannerItemCreateSchema,
  plannerItemUpdateSchema,
  plannerSchema,
} from '../validators/planner.js';
import { getDateFromKey, getDateKey } from '../lib/dates.js';

export const plannerRouter = Router();

plannerRouter.use(authenticate);

function buildPlannerItemMatchKey(item: {
  title: string;
  period: string;
  scheduledTime?: string | null;
}) {
  return `${item.title.trim().toLowerCase()}::${item.period}::${item.scheduledTime ?? ''}`;
}

async function buildCarryForwardAwareItems(params: {
  userId: string;
  dateKey: string;
  items: Array<{
    title: string;
    category?: string;
    priority?: string;
    status?: string;
    period: string;
    energyLevel?: string;
    scheduledTime?: string | null;
    fallbackTask?: string | null;
  }>;
  existingPlanId?: string;
}) {
  const targetDate = getDateFromKey(params.dateKey);
  const previousDate = new Date(targetDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateKey = getDateKey(previousDate);

  const [existingItems, previousPlan] = await Promise.all([
    params.existingPlanId
      ? prisma.dailyPlanItem.findMany({
          where: { planId: params.existingPlanId },
        })
      : Promise.resolve([]),
    prisma.dailyPlan.findUnique({
      where: {
        userId_dateKey: {
          userId: params.userId,
          dateKey: previousDateKey,
        },
      },
      include: {
        items: {
          where: {
            status: TaskStatus.PENDING,
          },
        },
      },
    }),
  ]);

  const existingByKey = new Map(existingItems.map((item) => [buildPlannerItemMatchKey(item), item]));
  const previousByKey = new Map(
    (previousPlan?.items ?? []).map((item) => [buildPlannerItemMatchKey(item), item]),
  );

  return params.items.map((item) => {
    const period = parsePlannerPeriod(item.period);
    const key = buildPlannerItemMatchKey({
      title: item.title,
      period,
      scheduledTime: item.scheduledTime ?? null,
    });
    const existingItem = existingByKey.get(key);
    const previousItem = previousByKey.get(key);

    if (existingItem) {
      return {
        title: item.title,
        category: item.category,
        priority: item.priority,
        status: parseTaskStatus(item.status),
        period,
        energyLevel: parseEnergyLevel(item.energyLevel),
        scheduledTime: item.scheduledTime,
        fallbackTask: item.fallbackTask,
        carriedFromDateKey: existingItem.carriedFromDateKey,
        wasRescheduled: existingItem.wasRescheduled,
        rolloverCount: existingItem.rolloverCount,
        completedAfterRollover: existingItem.completedAfterRollover,
      };
    }

    if (previousItem) {
      return {
        title: item.title,
        category: item.category,
        priority: item.priority,
        status: parseTaskStatus(item.status),
        period,
        energyLevel: parseEnergyLevel(item.energyLevel),
        scheduledTime: item.scheduledTime,
        fallbackTask: item.fallbackTask,
        carriedFromDateKey: previousItem.carriedFromDateKey ?? previousDateKey,
        wasRescheduled: true,
        rolloverCount: previousItem.rolloverCount + 1,
        completedAfterRollover: false,
      };
    }

    return {
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: parseTaskStatus(item.status),
      period,
      energyLevel: parseEnergyLevel(item.energyLevel),
      scheduledTime: item.scheduledTime,
      fallbackTask: item.fallbackTask,
    };
  });
}

function groupPlannerItems(
  items: Array<{
    id: string;
    title: string;
    period: ReturnType<typeof parsePlannerPeriod>;
    energyLevel: ReturnType<typeof parseEnergyLevel>;
    status: ReturnType<typeof parseTaskStatus>;
    scheduledTime: string | null;
    category: string | null;
    priority: string | null;
    fallbackTask: string | null;
  }>,
) {
  return items.reduce<Record<string, unknown[]>>(
    (accumulator, item) => {
      const period = formatPlannerPeriod(item.period);

      accumulator[period].push({
        id: item.id,
        title: item.title,
        time: item.scheduledTime,
        category: item.category,
        priority: item.priority,
        fallbackTask: item.fallbackTask,
        energyLevel: formatEnergyLevel(item.energyLevel),
        status: formatTaskStatus(item.status),
        completed: item.status === 'COMPLETED',
      });

      return accumulator;
    },
    { morning: [], afternoon: [], evening: [], night: [] },
  );
}

function buildPlannerResponse(params: {
  dateKey: string;
  mode: ReturnType<typeof parsePlannerMode>;
  items: Array<{
    id: string;
    title: string;
    period: ReturnType<typeof parsePlannerPeriod>;
    energyLevel: ReturnType<typeof parseEnergyLevel>;
    status: ReturnType<typeof parseTaskStatus>;
    scheduledTime: string | null;
    category: string | null;
    priority: string | null;
    fallbackTask: string | null;
  }>;
}) {
  const isRecovery = params.mode === 'RECOVERY';
  const isLowEnergy = params.mode === 'LOW_ENERGY';

  return {
    dateKey: params.dateKey,
    mode: formatPlannerMode(params.mode),
    itemsByPeriod: groupPlannerItems(params.items),
    totals: {
      completedCount: params.items.filter((item) => item.status === 'COMPLETED').length,
      totalCount: params.items.length,
    },
    aiInsight: isRecovery
      ? 'Keep the plan light and restorative today.'
      : isLowEnergy
        ? 'Lower the load, protect the essentials, and keep momentum.'
        : 'Focus on one physical, one mental, and one recovery win today.',
  };
}

plannerRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const dateKey = typeof request.query.dateKey === 'string' ? request.query.dateKey : getDateKey();

    const plan = await prisma.dailyPlan.findUnique({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
      include: {
        items: {
          orderBy: [{ period: 'asc' }, { scheduledTime: 'asc' }],
        },
      },
    });

    response.json(
      buildPlannerResponse({
        dateKey,
        mode: plan?.mode ?? 'NORMAL',
        items: plan?.items ?? [],
      }),
    );
  }),
);

plannerRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = plannerSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid planner payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const existingPlan = await prisma.dailyPlan.findUnique({
      where: {
        userId_dateKey: {
          userId,
          dateKey: parsed.data.dateKey,
        },
      },
      select: { id: true },
    });
    const carryForwardItems = await buildCarryForwardAwareItems({
      userId,
      dateKey: parsed.data.dateKey,
      items: parsed.data.items,
      existingPlanId: existingPlan?.id,
    });

    const plan = await prisma.dailyPlan.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey: parsed.data.dateKey,
        },
      },
      update: {
        mode: parsePlannerMode(parsed.data.mode),
        items: {
          deleteMany: {},
          create: carryForwardItems,
        },
      },
      create: {
        userId,
        dateKey: parsed.data.dateKey,
        mode: parsePlannerMode(parsed.data.mode),
        items: {
          create: carryForwardItems,
        },
      },
      include: { items: true },
    });

    response.json(
      buildPlannerResponse({
        dateKey: plan.dateKey,
        mode: plan.mode,
        items: plan.items,
      }),
    );
  }),
);

plannerRouter.post(
  '/item',
  asyncHandler(async (request, response) => {
    const parsed = plannerItemCreateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid planner item payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const dateKey = parsed.data.dateKey ?? getDateKey();

    const plan = await prisma.dailyPlan.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
      update: {},
      create: {
        userId,
        dateKey,
      },
    });

    const previousDate = getDateFromKey(dateKey);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateKey = getDateKey(previousDate);
    const previousPendingItem = await prisma.dailyPlanItem.findFirst({
      where: {
        title: parsed.data.title,
        period: parsePlannerPeriod(parsed.data.period),
        plan: {
          userId,
          dateKey: previousDateKey,
        },
        status: TaskStatus.PENDING,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const item = await prisma.dailyPlanItem.create({
      data: {
        planId: plan.id,
        title: parsed.data.title,
        category: parsed.data.category,
        priority: parsed.data.priority,
        status: parseTaskStatus(parsed.data.status),
        period: parsePlannerPeriod(parsed.data.period),
        energyLevel: parseEnergyLevel(parsed.data.energyLevel),
        scheduledTime: parsed.data.scheduledTime,
        fallbackTask: parsed.data.fallbackTask,
        carriedFromDateKey: previousPendingItem?.carriedFromDateKey ?? (previousPendingItem ? previousDateKey : null),
        wasRescheduled: Boolean(previousPendingItem),
        rolloverCount: previousPendingItem ? previousPendingItem.rolloverCount + 1 : 0,
      },
    });

    response.status(201).json({
      item: {
        id: item.id,
        title: item.title,
        category: item.category,
        priority: item.priority,
        period: formatPlannerPeriod(item.period),
        energyLevel: formatEnergyLevel(item.energyLevel),
        status: formatTaskStatus(item.status),
        time: item.scheduledTime,
      },
    });
  }),
);

plannerRouter.patch(
  '/item',
  asyncHandler(async (request, response) => {
    const parsed = plannerItemUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid planner item update payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const item = await prisma.dailyPlanItem.findFirst({
      where: {
        id: parsed.data.itemId,
        plan: {
          userId,
        },
      },
    });

    if (!item) {
      throw new HttpError(404, 'Planner item not found');
    }

    const nextStatus = parsed.data.status !== undefined ? parseTaskStatus(parsed.data.status) : item.status;
    const nextPeriod = parsed.data.period !== undefined ? parsePlannerPeriod(parsed.data.period) : item.period;
    const updatedItem = await prisma.dailyPlanItem.update({
      where: { id: item.id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
        ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
        ...(parsed.data.status !== undefined ? { status: nextStatus } : {}),
        ...(parsed.data.period !== undefined ? { period: nextPeriod } : {}),
        ...(parsed.data.energyLevel !== undefined ? { energyLevel: parseEnergyLevel(parsed.data.energyLevel) } : {}),
        ...(parsed.data.scheduledTime !== undefined ? { scheduledTime: parsed.data.scheduledTime } : {}),
        ...(parsed.data.fallbackTask !== undefined ? { fallbackTask: parsed.data.fallbackTask } : {}),
        ...(parsed.data.period !== undefined || parsed.data.scheduledTime !== undefined
          ? { wasRescheduled: true }
          : {}),
        ...(nextStatus === TaskStatus.COMPLETED && item.carriedFromDateKey
          ? { completedAfterRollover: true }
          : {}),
      },
    });

    response.json({
      item: {
        id: updatedItem.id,
        title: updatedItem.title,
        category: updatedItem.category,
        priority: updatedItem.priority,
        period: formatPlannerPeriod(updatedItem.period),
        energyLevel: formatEnergyLevel(updatedItem.energyLevel),
        status: formatTaskStatus(updatedItem.status),
        time: updatedItem.scheduledTime,
      },
    });
  }),
);

plannerRouter.delete(
  '/item/:id',
  asyncHandler(async (request, response) => {
    const itemId = String(request.params.id);
    const userId = request.auth!.userId;
    const item = await prisma.dailyPlanItem.findFirst({
      where: {
        id: itemId,
        plan: {
          userId,
        },
      },
    });

    if (!item) {
      throw new HttpError(404, 'Planner item not found');
    }

    await prisma.dailyPlanItem.delete({
      where: { id: item.id },
    });

    response.status(204).send();
  }),
);
